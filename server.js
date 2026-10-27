const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

app.use(express.static(PUBLIC_DIR));

let cache = { at: 0, data: null };
let marketCache = { at: 0, data: null };
let cattleLocalCache = { at: 0, data: null };
const CACHE_MS = 60_000;
const MARKET_CACHE_MS = 30_000;
const CATTLE_LOCAL_CACHE_MS = 30 * 60_000;

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

async function yahooSnapshot(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
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
  const quote = result.indicators?.quote?.[0] || {};
  const lastNumeric = arr => [...(arr || [])].reverse().find(v => typeof v === "number");
  const price = meta.regularMarketPrice ?? lastNumeric(quote.close);
  if (typeof price !== "number") throw new Error(`Preço indisponível para ${symbol}`);
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
  const change = typeof previousClose === "number" ? price - previousClose : null;
  const changePct = typeof previousClose === "number" && previousClose !== 0 ? (change / previousClose) * 100 : null;

  return {
    symbol,
    price,
    previousClose,
    change,
    changePct,
    open: lastNumeric(quote.open),
    high: lastNumeric(quote.high),
    low: lastNumeric(quote.low),
    currency: meta.currency || "",
    exchangeName: meta.exchangeName || "",
    marketState: meta.marketState || "",
    timestamp: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString()
  };
}

async function latestCattleMG() {
  if (cattleLocalCache.data && Date.now() - cattleLocalCache.at < CATTLE_LOCAL_CACHE_MS) return cattleLocalCache.data;
  try {
    const r = await fetch("https://agrodocai.com.br/api/v1/cotacao?uf=MG", {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    const out = {
      value: Number(j.valor),
      date: j.data_cotacao || null,
      source: j.fonte || "referência local",
      unit: j.unidade || "@",
      uf: j.uf || "MG"
    };
    if (!Number.isFinite(out.value)) throw new Error("valor inválido");
    cattleLocalCache = { at: Date.now(), data: out };
    return out;
  } catch (_) {
    return null;
  }
}

const COFFEE_CONTRACTS = [
  { symbol: "KCZ26.NYB", label: "Dez/26", ice: "Dec26" },
  { symbol: "KCH27.NYB", label: "Mar/27", ice: "Mar27" },
  { symbol: "KCK27.NYB", label: "Mai/27", ice: "May27" },
  { symbol: "KCN27.NYB", label: "Jul/27", ice: "Jul27" },
  { symbol: "KCU27.NYB", label: "Set/27", ice: "Sep27" },
  { symbol: "KCZ27.NYB", label: "Dez/27", ice: "Dec27" },
  { symbol: "KCH28.NYB", label: "Mar/28", ice: "Mar28" }
];

app.get("/api/mercado", async (req, res) => {
  try {
    if (marketCache.data && Date.now() - marketCache.at < MARKET_CACHE_MS) return res.json(marketCache.data);

    const [usdResult, coffeeFrontResult, liveCattleResult, feederCattleResult, localCattle, ...coffeeContractResults] = await Promise.all([
      yahooSnapshot("BRL=X").catch(() => null),
      yahooSnapshot("KC=F").catch(() => null),
      yahooSnapshot("LE=F").catch(() => null),
      yahooSnapshot("GF=F").catch(() => null),
      latestCattleMG(),
      ...COFFEE_CONTRACTS.map(c => yahooSnapshot(c.symbol).catch(() => null))
    ]);

    const usdBrl = usdResult?.price || null;
    const poundsPer60kg = 132.277357;
    const poundsPerArroba = 15 * 2.20462262185;

    const enrichCoffee = (snap, c = {}) => {
      if (!snap) return { ...c, available: false };
      const brlPerSaca = usdBrl ? (snap.price / 100) * poundsPer60kg * usdBrl : null;
      return { ...c, ...snap, available: true, brlPerSaca };
    };

    const coffeeContracts = COFFEE_CONTRACTS.map((c, i) => enrichCoffee(coffeeContractResults[i], c));

    const convertCattle = snap => {
      if (!snap) return null;
      const brlPerArroba = usdBrl ? (snap.price / 100) * poundsPerArroba * usdBrl : null;
      return { ...snap, brlPerArroba };
    };

    const payload = {
      updatedAt: new Date().toISOString(),
      autoRefreshSeconds: 30,
      usdBrl: usdResult,
      coffee: {
        front: enrichCoffee(coffeeFrontResult, { label: "Coffee C contínuo" }),
        contracts: coffeeContracts,
        exchange: "ICE Futures U.S.",
        unit: "centavos de US$/lb",
        note: "Cotações de mercado podem ser atrasadas pelo provedor. R$/saca é uma conversão indicativa usando USD/BRL."
      },
      cattle: {
        localMG: localCattle,
        liveCattle: convertCattle(liveCattleResult),
        feederCattle: convertCattle(feederCattleResult),
        note: "Live Cattle/Feeder Cattle são referências dos EUA. O valor convertido em R$/@ não é o contrato BGI da B3. A referência MG é a última cotação local disponível."
      },
      disclaimer: "Painel informativo. Não é recomendação de investimento nem substitui uma fonte de mercado licenciada."
    };

    marketCache = { at: Date.now(), data: payload };
    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: "Mercado temporariamente indisponível", detail: error.message });
  }
});

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
