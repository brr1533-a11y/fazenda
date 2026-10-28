const moneyBR = v => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toast = msg => { const el=document.querySelector("#salesToast"); el.textContent=msg; el.classList.add("show"); clearTimeout(window.__salesToast); window.__salesToast=setTimeout(()=>el.classList.remove("show"),3500); };
const qs = s => document.querySelector(s);
let paymentConfigured = false;
let currentPurchaseId = new URLSearchParams(location.search).get("purchase") || "";

async function jsonFetch(url, options={}){
  const r=await fetch(url,{...options,headers:{"Content-Type":"application/json",...(options.headers||{})}});
  let j={}; try{j=await r.json()}catch(_){ }
  if(!r.ok) throw new Error(j.error||`Erro ${r.status}`);
  return j;
}

async function loadConfig(){
  try{
    const c=await jsonFetch("/api/public/config");
    if(Number.isFinite(Number(c.planPrice))) qs("#planPrice").textContent=moneyBR(c.planPrice);
    paymentConfigured=Boolean(c.paymentConfigured);
    if(c.testPurchaseMode) qs("#paymentHint").textContent="MODO DE TESTE ATIVO — o botão Comprar acesso simula uma assinatura aprovada e não cobra nada.";
    else if(!paymentConfigured) qs("#paymentHint").textContent="Checkout pronto. Configure Mercado Pago no servidor para aceitar assinaturas reais; em ambiente de teste, TEST_PURCHASE_MODE=true libera o fluxo completo.";
  }catch(_){ }
}

async function checkPurchase(){
  if(!currentPurchaseId) return;
  try{
    const status=await jsonFetch(`/api/public/purchases/${encodeURIComponent(currentPurchaseId)}/status`);
    if(status.used){
      toast("Esta compra já foi usada para criar um Grupo.");
      return;
    }
    if(status.canOnboard){
      qs("#onboarding").classList.remove("hidden");
      qs("#onboarding").scrollIntoView({behavior:"smooth",block:"start"});
      toast("Assinatura confirmada. Agora crie seu Grupo e o primeiro CEO.");
    }else{
      toast(`Assinatura: ${status.status || "aguardando confirmação"}. Atualize a página após a aprovação do pagamento.`);
    }
  }catch(e){ toast(e.message); }
}

qs("#buyButton").addEventListener("click",async()=>{
  const email=qs("#buyerEmail").value.trim();
  if(!/^\S+@\S+\.\S+$/.test(email)) return toast("Informe o e-mail que será usado na assinatura.");
  const btn=qs("#buyButton"); btn.disabled=true; btn.textContent="Abrindo pagamento...";
  try{
    const j=await jsonFetch("/api/public/checkout",{method:"POST",body:JSON.stringify({email})});
    localStorage.setItem("gestaoRuralPurchaseId",j.purchaseId||"");
    location.href=j.checkoutUrl;
  }catch(e){ toast(e.message||"Checkout indisponível."); }
  finally{ btn.disabled=false; btn.textContent="Comprar acesso"; }
});

qs("#onboardingForm").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!currentPurchaseId) return toast("Compra não identificada.");
  const btn=e.submitter; btn.disabled=true; btn.textContent="Criando Grupo...";
  try{
    const values=Object.fromEntries(new FormData(e.target).entries());
    const j=await jsonFetch(`/api/public/purchases/${encodeURIComponent(currentPurchaseId)}/onboard`,{method:"POST",body:JSON.stringify(values)});
    qs("#onboardingForm").classList.add("hidden");
    const done=qs("#onboardingDone"); done.classList.remove("hidden");
    done.innerHTML=`<h3>${j.group.name} criado com sucesso.</h3><p>Seu <b>Código do Grupo</b> é <strong>${j.group.code}</strong>. Guarde este número. Entre com ele, o usuário e a senha do CEO.</p><a class="btn primary xl" href="${j.loginUrl}">Entrar no meu Grupo</a>`;
    localStorage.setItem("lastGroupCode",j.group.code);
    history.replaceState({},"",location.pathname);
    toast("Grupo e CEO criados.");
  }catch(err){ toast(err.message); }
  finally{ btn.disabled=false; btn.textContent="Criar meu Grupo"; }
});

(async()=>{
  await loadConfig();
  const params=new URLSearchParams(location.search);
  if(!currentPurchaseId) currentPurchaseId=localStorage.getItem("gestaoRuralPurchaseId")||"";
  if(params.get("checkout")==="success" && currentPurchaseId) await checkPurchase();
})();
