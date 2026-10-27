const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

app.use(express.static(PUBLIC_DIR));

let cache = { at: 0, data: null };
const CACHE_MS = 60_000;

async function yahooChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json"
    }
  });

  if (!response.ok) throw new Error(`Falha ao consultar ${symbol}: ${response.status}`);
  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`Sem dados para ${symbol}`);

  const meta = result.meta || {};
  const closes = result.indicators?.quote?.[0]?.close || [];
  const lastClose = [...closes].reverse().find(v => typeof v === "number");
  const price = meta.regularMarketPrice ?? lastClose;
  if (typeof price !== "number") throw new Error(`Preço indisponível para ${symbol}`);
  return price;
}

app.get("/api/cotacao-cafe", async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.at < CACHE_MS) {
      return res.json(cache.data);
    }

    // KC=F: Coffee C (arábica) em centavos de dólar por libra.
    // BRL=X: USD/BRL aproximado.
    const [coffeeCentsLb, usdBrl] = await Promise.all([
      yahooChart("KC=F"),
      yahooChart("BRL=X"),
    ]);

    const poundsPer60kg = 132.277357;
    const usdPerSaca = (coffeeCentsLb / 100) * poundsPer60kg;
    const brlPerSaca = usdPerSaca * usdBrl;

    const payload = {
      symbol: "KC=F",
      coffeeCentsLb,
      usdBrl,
      usdPerSaca,
      brlPerSaca,
      timestamp: new Date().toISOString(),
      methodology: "Coffee C (centavos/libra) × 132,277357 lb por 60 kg × USD/BRL",
      warning: "Estimativa de referência do futuro Coffee C; não é preço físico local nem recomendação financeira."
    };

    cache = { at: Date.now(), data: payload };
    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(503).json({
      error: "Cotação temporariamente indisponível",
      detail: error.message
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Grupo Fagundes Miari rodando em http://localhost:${PORT}`);
});
