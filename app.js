const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const ROLE_NAMES = { ceo: "CEO", adm: "Administrador", contribuinte: "Contribuinte" };
const COFFEE_STOCK = ["Adubos", "Fertilizantes", "Defensivos", "Combustível", "Peças", "EPIs", "Sacaria", "Ferramentas", "Outros"];
const CATTLE_STOCK = ["Ração", "Sal mineral", "Medicamentos", "Vacinas", "Combustível", "Cercas", "Peças", "EPIs", "Ferramentas", "Outros"];
const COFFEE_FINANCE = ["Venda de café", "Adubos", "Fertilizantes", "Defensivos", "Combustível", "Manutenção", "Mão de obra", "Frete", "Impostos", "Serviços", "Outros"];
const CATTLE_FINANCE = ["Venda de gado", "Compra de gado", "Ração", "Sal mineral", "Medicamentos", "Vacinas", "Veterinário", "Combustível", "Manutenção", "Mão de obra", "Frete", "Impostos", "Serviços", "Outros"];
const STORAGE_KEY = "fazendaDataV7";

const ICONS = {
  grid: `<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>`,
  tractor: `<circle cx="7" cy="16.5" r="3.5"/><circle cx="18" cy="17.5" r="2.5"/><path d="M10.5 16.5h5M3.5 13V9h6l2 4h7v2.5M9.5 9V5.5H13"/>`,
  cattle: `<path d="M5 6C3.5 6 2.5 7 2.5 8.5S4 11 6 11M19 6c1.5 0 2.5 1 2.5 2.5S20 11 18 11"/><path d="M6 9c0-2 1.5-3.5 3-3.5h6c1.5 0 3 1.5 3 3.5v4c0 3-2 6-6 6s-6-3-6-6z"/><path d="M9.5 15.5h5"/>`,
  box: `<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>`,
  chart: `<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>`,
  receipt: `<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>`,
  wallet: `<path d="M3.5 7.5a2 2 0 0 1 2-2H18v3"/><rect x="3.5" y="8.5" width="17" height="11" rx="2"/><circle cx="16.5" cy="14" r="1"/>`,
  home: `<path d="M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5M10 20v-5h4v5"/>`,
  users: `<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5a3 3 0 0 1 0 6M18 14.8c2 .6 3.5 2.3 3.5 5.2"/>`,
  check: `<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.3 2.5 2.5 4.5-5"/>`,
  swap: `<path d="M7 4v14M3.5 14.5 7 18l3.5-3.5M17 20V6M13.5 9.5 17 6l3.5 3.5"/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>`,
  hash: `<path d="M9 4 7 20M17 4l-2 16M4 9h16M3.5 15h16"/>`,
  at: `<circle cx="12" cy="12" r="3.5"/><path d="M15.5 8.5v5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.5 6.9"/>`,
  up: `<path d="M7 17 17 7M8 7h9v9"/>`,
  down: `<path d="m7 7 10 10M17 8v9H8"/>`,
  bean: `<ellipse cx="12" cy="12" rx="6" ry="8.5" transform="rotate(35 12 12)"/><path d="M9 8.5c2.5 1 3.5 2.5 3 4.5s.5 3 3 3.5"/>`,
  logout: `<path d="M14 4h4.5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H14M10 8l-4 4 4 4M6 12h10"/>`
};
function ico(n) { return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`; }

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function newFarm(name, type = "coffee") {
  return {
    id: uid(),
    name,
    type,
    photo: "",
    tractors: [],
    implements: [],
    stock: [],
    finances: [],
    notes: [],
    assignments: [],
    cattle: { lots: [], weighings: [] }
  };
}

function defaultData() {
  const f1 = newFarm("Fazenda Santa Clara", "coffee");
  f1.tractors.push({ id: uid(), name: "John Deere 5078E", model: "5078E", plate: "TR-01", status: "Disponível" });
  f1.implements.push({ id: uid(), name: "Pulverizador Jacto", category: "Pulverização", status: "Disponível" });
  f1.stock.push(
    { id: uid(), item: "Adubo 20-05-20", category: "Adubos", quantity: 40, unit: "sacos", min: 15, unitCost: 165 },
    { id: uid(), item: "Diesel S10", category: "Combustível", quantity: 700, unit: "L", min: 250, unitCost: 6.25 }
  );
  return {
    version: 6,
    users: [
      { id: uid(), username: "jacquesMiari", password: "05091722", name: "Jacques Miari", role: "ceo", active: true, function: "CEO", pixKey: "" },
      { id: uid(), username: "adm", password: "ADM123", name: "Administrador", role: "adm", active: true, function: "Administração", pixKey: "" },
      { id: uid(), username: "campo", password: "CAFE123", name: "João Campo", role: "contribuinte", active: true, function: "Campo", pixKey: "" }
    ],
    pendingRegistrations: [],
    farms: [f1, newFarm("Fazenda Boa Vista", "coffee"), newFarm("Fazenda Monte Verde", "coffee"), newFarm("Fazenda São Bento", "coffee")],
    receipts: []
  };
}

function migrateData(raw) {
  const d = raw && typeof raw === "object" ? raw : defaultData();
  d.version = 6;
  d.users = Array.isArray(d.users) ? d.users : [];
  d.pendingRegistrations = Array.isArray(d.pendingRegistrations) ? d.pendingRegistrations : [];
  d.farms = Array.isArray(d.farms) && d.farms.length ? d.farms : defaultData().farms;
  d.receipts = Array.isArray(d.receipts) ? d.receipts : [];

  let ceo = d.users.find(u => String(u.username || "").toLowerCase() === "jacquesmiari") || d.users.find(u => u.role === "ceo");
  if (!ceo) {
    ceo = { id: uid(), role: "ceo", active: true };
    d.users.unshift(ceo);
  }
  ceo.username = "jacquesMiari";
  ceo.password = "05091722";
  ceo.name = ceo.name || "Jacques Miari";
  ceo.role = "ceo";
  ceo.active = true;
  ceo.function = ceo.function || "CEO";
  ceo.pixKey = ceo.pixKey || "";

  d.users.forEach(u => {
    u.id = u.id || uid();
    u.active = u.active !== false;
    u.function = u.function || "";
    u.pixKey = u.pixKey || "";
  });

  d.pendingRegistrations.forEach(r => {
    r.id = r.id || uid();
    r.role = ["adm", "contribuinte"].includes(r.role) ? r.role : "contribuinte";
    r.function = r.function || "";
    r.pixKey = r.pixKey || "";
  });

  d.farms.forEach(f => {
    f.id = f.id || uid();
    f.name = f.name || "Fazenda";
    f.type = f.type === "cattle" ? "cattle" : "coffee";
    f.photo = f.photo || "";
    f.tractors = Array.isArray(f.tractors) ? f.tractors : [];
    f.implements = Array.isArray(f.implements) ? f.implements : [];
    f.stock = Array.isArray(f.stock) ? f.stock : [];
    f.finances = Array.isArray(f.finances) ? f.finances : [];
    f.notes = Array.isArray(f.notes) ? f.notes : [];
    f.assignments = Array.isArray(f.assignments) ? f.assignments : [];
    f.cattle = f.cattle || {};
    f.cattle.lots = Array.isArray(f.cattle.lots) ? f.cattle.lots : [];
    f.cattle.weighings = Array.isArray(f.cattle.weighings) ? f.cattle.weighings : [];
    f.stock.forEach(s => {
      s.id = s.id || uid();
      s.category = s.category || "Outros";
      s.unitCost = Number(s.unitCost || 0);
    });
    f.notes.forEach(n => {
      n.fileData = n.fileData || "";
      n.fileName = n.fileName || "";
      n.fileType = n.fileType || "";
    });
  });
  return d;
}

function loadData() {
  for (const key of [STORAGE_KEY, "gfmRuralDataV6"]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const migrated = migrateData(JSON.parse(raw));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch (_) {}
  }
  const d = defaultData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  return d;
}

let data = loadData();
let currentUser = null;
let currentPage = "dashboard";
let activeFarmId = localStorage.getItem("fazendaAtiva") || data.farms[0]?.id || "";
let quote = null;

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem("fazendaAtiva", activeFarmId);
}

function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function compactMoney(v) {
  const n = Number(v || 0);
  if (Math.abs(n) >= 1e6) return `R$ ${(n / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (Math.abs(n) >= 1e3) return `R$ ${(n / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return money(n);
}

function escapeHTML(v = "") {
  return String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateBR(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => el.classList.remove("show"), 2600);
}

function isGeneralView() {
  return activeFarmId === "general-coffee" || activeFarmId === "general-cattle";
}

function selectedType() {
  if (activeFarmId === "general-cattle") return "cattle";
  if (activeFarmId === "general-coffee") return "coffee";
  return activeFarm()?.type === "cattle" ? "cattle" : "coffee";
}

function activeFarm() {
  return data.farms.find(f => f.id === activeFarmId) || data.farms[0] || null;
}

function farmsInContext() {
  return isGeneralView() ? data.farms.filter(f => f.type === selectedType()) : (activeFarm() ? [activeFarm()] : []);
}

function contextName() {
  if (activeFarmId === "general-coffee") return "Geral • Café";
  if (activeFarmId === "general-cattle") return "Geral • Gado";
  return activeFarm()?.name || "Fazenda";
}

function farmTypeLabel(f = activeFarm()) {
  if (!f) return selectedType() === "cattle" ? "Gado" : "Café";
  return f.type === "cattle" ? "Gado" : "Café";
}

function stockCategories() {
  return selectedType() === "cattle" ? CATTLE_STOCK : COFFEE_STOCK;
}

function financeCategories() {
  return selectedType() === "cattle" ? CATTLE_FINANCE : COFFEE_FINANCE;
}

function financialTotals(farm) {
  const finances = (farm?.finances || []);
  const income = finances.filter(x => x.type === "entrada").reduce((a, b) => a + Number(b.value || 0), 0);
  const expense = finances.filter(x => x.type === "saida").reduce((a, b) => a + Number(b.value || 0), 0);
  return { income, expense, profit: income - expense };
}

function contextFinances() {
  return farmsInContext().flatMap(f => (f.finances || []).map(fin => ({ ...fin, farmName: f.name, farmId: f.id, farmType: f.type })));
}

function contextNotes() {
  return farmsInContext().flatMap(f => (f.notes || []).map(note => ({ ...note, farmName: f.name, farmId: f.id, farmType: f.type })));
}

function contextStock() {
  return farmsInContext().flatMap(f => (f.stock || []).map(item => ({ ...item, farmName: f.name, farmId: f.id, farmType: f.type })));
}

function contextEquipment(type) {
  return farmsInContext().flatMap(f => ((type === "tractor" ? f.tractors : f.implements) || []).map(item => ({ ...item, farmName: f.name })));
}

function contextLots() {
  return farmsInContext().flatMap(f => (f.cattle?.lots || []).map(lot => ({ ...lot, farmName: f.name, farmId: f.id })));
}

function contextWeighings() {
  return farmsInContext().flatMap(f => (f.cattle?.weighings || []).map(w => ({ ...w, farmName: f.name, farmId: f.id })));
}

function login(username, password) {
  const normalized = username.trim().toLowerCase();
  const user = data.users.find(u => String(u.username || "").toLowerCase() === normalized && u.password === password && u.active !== false);
  if (!user) return false;
  currentUser = user;
  sessionStorage.setItem("fazendaSession", user.username);
  openApp();
  return true;
}

function restoreSession() {
  const username = sessionStorage.getItem("fazendaSession");
  const user = data.users.find(u => u.username === username && u.active !== false);
  if (user) {
    currentUser = user;
    openApp();
  }
}

function logout() {
  sessionStorage.removeItem("fazendaSession");
  currentUser = null;
  $("#appView").classList.add("hidden");
  $("#loginView").classList.remove("hidden");
  showAuthMode("login");
  $("#loginPassword").value = "";
}

function showAuthMode(mode) {
  $(".auth-switch").dataset.mode = mode;
  const loginVisible = mode === "login";
  $("#loginForm").classList.toggle("hidden", !loginVisible);
  $("#registerForm").classList.toggle("hidden", loginVisible);
  $("#showLoginBtn").classList.toggle("active", loginVisible);
  $("#showRegisterBtn").classList.toggle("active", !loginVisible);
}

function createPendingRegistration(values) {
  const name = String(values.name || "").trim();
  const username = String(values.username || "").trim();
  const password = String(values.password || "");
  if (!name) return toast("Informe o nome.");
  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) return toast("Usuário inválido. Use 3 a 30 caracteres.");
  if (password.length < 6) return toast("A senha precisa ter pelo menos 6 caracteres.");
  if (data.users.some(u => String(u.username).toLowerCase() === username.toLowerCase()) || data.pendingRegistrations.some(u => String(u.username).toLowerCase() === username.toLowerCase())) return toast("Esse usuário já existe ou está pendente.");
  data.pendingRegistrations.push({
    id: uid(),
    name,
    username,
    password,
    role: values.role === "adm" ? "adm" : "contribuinte",
    function: String(values.function || "").trim(),
    pixKey: String(values.pixKey || "").trim(),
    createdAt: new Date().toISOString()
  });
  saveData();
  toast("Solicitação enviada para aprovação do CEO.");
  $("#registerForm").reset();
  showAuthMode("login");
}

function createUser(values, after) {
  const name = String(values.name || "").trim();
  const username = String(values.username || "").trim();
  const password = String(values.password || "");
  if (!name) return toast("Informe o nome.");
  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) return toast("Usuário inválido. Use 3 a 30 caracteres.");
  if (password.length < 6) return toast("A senha precisa ter pelo menos 6 caracteres.");
  if (data.users.some(u => String(u.username).toLowerCase() === username.toLowerCase())) return toast("Esse usuário já existe.");
  data.users.push({
    id: uid(),
    name,
    username,
    password,
    role: values.role || "contribuinte",
    active: true,
    function: String(values.function || "").trim(),
    pixKey: String(values.pixKey || "").trim(),
    createdAt: new Date().toISOString(),
    createdBy: currentUser?.username || "sistema"
  });
  saveData();
  toast("Usuário criado com sucesso.");
  if (after) after();
}

function approveRegistration(id) {
  const reg = data.pendingRegistrations.find(r => r.id === id);
  if (!reg) return;
  createUser(reg);
  data.pendingRegistrations = data.pendingRegistrations.filter(r => r.id !== id);
  saveData();
  toast("Solicitação aprovada.");
  renderUsers();
}

function rejectRegistration(id) {
  data.pendingRegistrations = data.pendingRegistrations.filter(r => r.id !== id);
  saveData();
  toast("Solicitação recusada.");
  renderUsers();
}

function renderFarmSelector() {
  const select = $("#farmSelect");
  if (!select) return;
  const options = [];
  if (currentUser?.role === "ceo") {
    options.push(`<option value="general-coffee" ${activeFarmId === "general-coffee" ? "selected" : ""}>Geral • Café</option>`);
    options.push(`<option value="general-cattle" ${activeFarmId === "general-cattle" ? "selected" : ""}>Geral • Gado</option>`);
  }
  options.push(...data.farms.map(f => `<option value="${f.id}" ${f.id === activeFarmId ? "selected" : ""}>${escapeHTML(f.name)} • ${farmTypeLabel(f)}</option>`));
  if (!options.length) return;
  if (currentUser?.role !== "ceo" && isGeneralView()) activeFarmId = data.farms[0]?.id || "";
  if (!isGeneralView() && activeFarm() == null) activeFarmId = data.farms[0]?.id || "";
  select.innerHTML = options.join("");
  select.value = activeFarmId;
  select.onchange = () => {
    activeFarmId = select.value;
    saveData();
    currentPage = currentUser.role === "contribuinte"
      ? (selectedType() === "cattle" ? "gado-campo" : "meu-dia")
      : "dashboard";
    renderNav();
    renderPage();
    if (selectedType() === "coffee" && currentUser.role !== "contribuinte") refreshQuote(); else $("#quoteMini").classList.add("hidden");
  };
}

function navItems() {
  const cattle = selectedType() === "cattle";
  if (currentUser.role === "ceo") {
    return [
      ["dashboard", "grid", "Visão geral"],
      ...(cattle ? [["gado", "cattle", isGeneralView() ? "Gado geral" : "Gado"]] : [["equipamentos", "tractor", isGeneralView() ? "Equipamentos gerais" : "Equipamentos"]]),
      ["estoque", "box", isGeneralView() ? "Estoque geral" : "Estoque"],
      ["financeiro", "chart", isGeneralView() ? "Balanço geral" : "Balanço financeiro"],
      ["notas", "receipt", isGeneralView() ? "Notas gerais" : "Notas fiscais"],
      ["pagamentos", "wallet", "Pagamentos"],
      ["fazendas", "home", "Fazendas"],
      ["usuarios", "users", "Usuários"]
    ];
  }
  if (currentUser.role === "adm") {
    return [
      ["dashboard", "grid", "Visão geral"],
      ...(cattle ? [["gado", "cattle", "Gado"]] : [["equipamentos", "tractor", "Equipamentos"]]),
      ["estoque", "box", "Estoque"],
      ["lancamentos", "swap", "Lançar entradas/saídas"],
      ["notas", "receipt", "Notas fiscais"]
    ];
  }
  return selectedType() === "cattle"
    ? [["gado-campo", "cattle", "Gado"], ["meus-comprovantes", "receipt", "Meus comprovantes"]]
    : [["meu-dia", "check", "Meu trabalho hoje"], ["equipamentos-campo", "tractor", "Equipamentos disponíveis"], ["meus-comprovantes", "receipt", "Meus comprovantes"]];
}

function renderNav() {
  $("#navMenu").innerHTML = navItems().map(([id, icon, label]) => `<button class="nav-btn ${currentPage === id ? "active" : ""}" data-page="${id}"><span class="nav-label">${label}</span></button>`).join("");
  $$("#navMenu .nav-btn").forEach(btn => btn.onclick = () => { currentPage = btn.dataset.page; renderNav(); renderPage(); });
}

function setHeader(eyebrow, title) {
  $("#pageEyebrow").textContent = `${eyebrow} • ${contextName().toUpperCase()} • ${(selectedType() === "cattle" ? "GADO" : "CAFÉ")}`;
  $("#pageTitle").textContent = title;
}

function openApp() {
  $("#loginView").classList.add("hidden");
  $("#appView").classList.remove("hidden");
  $("#userName").textContent = currentUser.name;
  $("#userRole").textContent = ROLE_NAMES[currentUser.role] || currentUser.role;
  $("#userAvatar").textContent = currentUser.name?.[0]?.toUpperCase() || "U";
  if (currentUser.role !== "ceo" && isGeneralView()) activeFarmId = data.farms[0]?.id || "";
  currentPage = currentUser.role === "contribuinte" ? (selectedType() === "cattle" ? "gado-campo" : "meu-dia") : "dashboard";
  renderFarmSelector();
  renderNav();
  renderPage();
  if (selectedType() === "coffee" && currentUser.role !== "contribuinte") refreshQuote(); else $("#quoteMini").classList.add("hidden");
}

function renderPage() {
  renderFarmSelector();
  const allowed = navItems().map(n => n[0]);
  if (!allowed.includes(currentPage)) currentPage = allowed[0];
  const pages = {
    dashboard: renderDashboard,
    equipamentos: renderEquipmentAdmin,
    estoque: renderStock,
    financeiro: renderFinanceCEO,
    lancamentos: renderFinanceAdmin,
    notas: renderNotes,
    pagamentos: renderPayments,
    fazendas: renderFarms,
    usuarios: renderUsers,
    gado: renderCattle,
    "meu-dia": renderContributorDay,
    "equipamentos-campo": renderContributorEquipment,
    "meus-comprovantes": renderMyReceipts,
    "gado-campo": renderCattleReadOnly
  };
  pages[currentPage]();
}

async function refreshQuote() {
  if (selectedType() !== "coffee") return;
  $("#quoteMini").classList.remove("hidden");
  $("#quoteMini").classList.add("is-loading");
  try {
    const r = await fetch("/api/cotacao-cafe");
    if (!r.ok) throw new Error();
    quote = await r.json();
    $("#quoteMini").classList.remove("is-loading");
    $("#quoteMiniValue").textContent = money(quote.brlPerSaca);
    if (["dashboard", "financeiro", "lancamentos"].includes(currentPage)) renderPage();
  } catch (_) {
    quote = null;
    $("#quoteMini").classList.remove("is-loading");
    $("#quoteMini").classList.add("hidden");
  }
}

function contributorQuickForm() {
  if (currentUser.role !== "ceo") return "";
  return `<div class="section-head"><div><h2>Cadastro rápido de contribuinte</h2><p>Crie o colaborador e o login direto da página inicial.</p></div></div>
  <form id="quickContributorForm" class="form-card accent-card"><div class="form-grid">
    <label>Nome<input name="name" required placeholder="Nome completo"></label>
    <label>Função (opcional)<input name="function" placeholder="Ex.: tratorista, vaqueiro, colhedor"></label>
    <label>Chave PIX (opcional)<input name="pixKey" placeholder="CPF, telefone, e-mail ou chave aleatória"></label>
    <label>Usuário<input name="username" required placeholder="Ex.: joao.silva"></label>
    <label>Senha inicial<input name="password" type="password" minlength="6" required placeholder="Mínimo 6 caracteres"></label>
  </div><div class="form-actions"><button class="btn primary">Cadastrar contribuinte</button></div></form>`;
}

function bindQuickContributor() {
  const form = $("#quickContributorForm");
  if (!form) return;
  form.onsubmit = e => {
    e.preventDefault();
    const f = new FormData(form);
    createUser({
      name: f.get("name"),
      function: f.get("function"),
      pixKey: f.get("pixKey"),
      username: f.get("username"),
      password: f.get("password"),
      role: "contribuinte"
    }, renderDashboard);
  };
}

function renderCeoBalanceDonut(finances) {
  if (!currentUser || currentUser.role !== "ceo") return "";
  const income = finances.filter(x => x.type === "entrada").reduce((s, x) => s + Number(x.value || 0), 0);
  const expense = finances.filter(x => x.type === "saida").reduce((s, x) => s + Number(x.value || 0), 0);
  const result = income - expense;
  const total = income + expense;
  const incomePct = total > 0 ? (income / total) * 100 : 100;
  const expensePct = total > 0 ? 100 - incomePct : 0;
  const ring = total > 0
    ? `conic-gradient(var(--accent) 0 ${incomePct.toFixed(2)}%, var(--danger) ${incomePct.toFixed(2)}% 100%)`
    : `conic-gradient(var(--line) 0 100%)`;

  return `
    <div class="section-head ceo-donut-heading"><div><h2>Resumo financeiro</h2><p>Entradas, gastos e resultado da visão selecionada.</p></div><span class="badge green">Somente CEO</span></div>
    <div class="ceo-balance-card">
      <div class="ceo-donut-wrap">
        <div class="ceo-donut" style="background:${ring}" role="img" aria-label="Entradas ${incomePct.toFixed(1)}%, gastos ${expensePct.toFixed(1)}%">
          <div class="ceo-donut-center"><span>Resultado</span><strong class="${result >= 0 ? "text-green" : "text-red"}">${money(result)}</strong></div>
        </div>
      </div>
      <div class="ceo-donut-stats">
        <div class="ceo-donut-stat"><span class="ceo-dot income"></span><div><small>Entradas</small><strong>${money(income)}</strong></div></div>
        <div class="ceo-donut-stat"><span class="ceo-dot expense"></span><div><small>Gastos</small><strong>${money(expense)}</strong></div></div>
        <div class="ceo-donut-stat result"><span class="ceo-dot result"></span><div><small>Lucro / resultado</small><strong class="${result >= 0 ? "text-green" : "text-red"}">${money(result)}</strong></div></div>
      </div>
    </div>`;
}

function renderDashboard() {
  const farms = farmsInContext();
  const type = selectedType();
  const finances = contextFinances();
  const totals = {
    income: finances.filter(x => x.type === "entrada").reduce((s, x) => s + Number(x.value || 0), 0),
    expense: finances.filter(x => x.type === "saida").reduce((s, x) => s + Number(x.value || 0), 0)
  };
  totals.profit = totals.income - totals.expense;
  const stock = contextStock();
  const stockValue = stock.reduce((s, x) => s + Number(x.quantity || 0) * Number(x.unitCost || 0), 0);
  const lowStock = stock.filter(x => Number(x.quantity || 0) <= Number(x.min || 0));

  setHeader("OPERAÇÃO", isGeneralView() ? `Painel geral de ${type === "cattle" ? "gado" : "café"}` : "Visão geral");

  let modeCards = "";
  if (type === "coffee") {
    const tractors = contextEquipment("tractor");
    const implementsList = contextEquipment("implement");
    modeCards = `
      <div class="card"><div class="kpi-label"><span>Tratores</span><span class="kpi-icon">${ico("tractor")}</span></div><div class="kpi-value">${tractors.length}</div><div class="kpi-foot">${isGeneralView() ? "em todas as fazendas de café" : "cadastrados nesta fazenda"}</div></div>
      <div class="card"><div class="kpi-label"><span>Implementos</span><span class="kpi-icon">${ico("gear")}</span></div><div class="kpi-value">${implementsList.length}</div><div class="kpi-foot">equipamentos cadastrados</div></div>`;
  } else {
    const lots = contextLots();
    const weighings = contextWeighings();
    const heads = lots.reduce((s, l) => s + Number(l.heads || 0), 0);
    const avgArrobas = weighings.length ? weighings.reduce((s, w) => s + Number(w.avgArrobas || 0), 0) / weighings.length : 0;
    modeCards = `
      <div class="card"><div class="kpi-label"><span>Lotes</span><span class="kpi-icon">${ico("cattle")}</span></div><div class="kpi-value">${lots.length}</div><div class="kpi-foot">${isGeneralView() ? "em todas as fazendas de gado" : "lotes cadastrados"}</div></div>
      <div class="card"><div class="kpi-label"><span>Cabeças</span><span class="kpi-icon">${ico("hash")}</span></div><div class="kpi-value">${heads}</div><div class="kpi-foot">total informado nos lotes</div></div>
      <div class="card"><div class="kpi-label"><span>Média das pesagens</span><span class="kpi-icon">${ico("at")}</span></div><div class="kpi-value">${avgArrobas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}@</div><div class="kpi-foot">estimativa simples: kg ÷ 15</div></div>`;
  }

  const financeCard = currentUser.role === "ceo"
    ? `<div class="card"><div class="kpi-label"><span>Resultado acumulado</span><span class="kpi-icon">${ico("chart")}</span></div><div class="kpi-value ${totals.profit >= 0 ? "text-green" : "text-red"}">${money(totals.profit)}</div><div class="kpi-foot">${isGeneralView() ? "resultado consolidado" : "visível somente para CEO"}</div></div>`
    : `<div class="card"><div class="kpi-label"><span>Estoque</span><span class="kpi-icon">${ico("box")}</span></div><div class="kpi-value">${stock.length}</div><div class="kpi-foot">valor estimado ${money(stockValue)}</div></div>`;

  $("#pageContent").innerHTML = `
    <div class="hero-surface">
      <div><span class="eyebrow">CENTRO DE COMANDO</span><h2>${isGeneralView() ? `Visão consolidada • ${type === "cattle" ? "Gado" : "Café"}` : contextName()}</h2><p>${isGeneralView() ? "Aqui você acompanha o consolidado de todas as fazendas desse tipo." : "Acompanhe indicadores, estoques, operação e desempenho desta fazenda."}</p></div>
      <div class="hero-badges"><span class="badge ${type === "cattle" ? "gold" : "green"}">${type === "cattle" ? "Gado" : "Café"}</span>${currentUser.role === "ceo" ? `<span class="badge">Modo ${isGeneralView() ? "geral" : "individual"}</span>` : ""}</div>
    </div>
    <div class="grid kpis">${modeCards}${financeCard}${type === "coffee" ? `<div class="card ${quote ? "quote-card" : ""}"><div class="kpi-label"><span>Cotação estimada • saca 60 kg</span><span class="kpi-icon">${ico("bean")}</span></div><div class="kpi-value">${quote ? money(quote.brlPerSaca) : "Indisponível"}</div><div class="kpi-foot">referência Coffee C convertida para BRL</div></div>` : `<div class="card"><div class="kpi-label"><span>Valor em estoque</span><span class="kpi-icon">${ico("box")}</span></div><div class="kpi-value">${money(stockValue)}</div><div class="kpi-foot">baseado em quantidade × custo unitário</div></div>`}</div>
    ${contributorQuickForm()}
    <div class="section-head"><div><h2>Alertas de estoque</h2><p>Itens que chegaram ao mínimo.</p></div></div>
    ${lowStock.length ? `<div class="grid three">${lowStock.slice(0, 9).map(s => `<div class="card"><span class="badge red">Estoque baixo</span><h3 style="margin-top:12px">${escapeHTML(s.item)}</h3><p class="muted">${escapeHTML(s.category)} • ${s.quantity} ${escapeHTML(s.unit)}${isGeneralView() ? ` • <b>${escapeHTML(s.farmName)}</b>` : ""}</p></div>`).join("")}</div>` : `<div class="card empty">Nenhum item abaixo do mínimo.</div>`}
    ${renderCeoBalanceDonut(finances)}`;
  bindQuickContributor();
}

function renderEquipmentAdmin() {
  if (selectedType() !== "coffee") return renderCattle();
  setHeader("PATRIMÔNIO", isGeneralView() ? "Equipamentos gerais" : "Tratores e implementos");
  if (isGeneralView()) {
    const tractors = contextEquipment("tractor");
    const implementsList = contextEquipment("implement");
    $("#pageContent").innerHTML = `
      <div class="card soft"><span class="eyebrow dark">VISÃO GERAL DE CAFÉ</span><h2>${tractors.length + implementsList.length} ativos</h2><p class="muted">Modo geral apenas para consulta. Para cadastrar ou editar, escolha uma fazenda específica de café.</p></div>
      <div class="section-head"><h2>Tratores</h2></div>
      ${tractors.length ? `<div class="table-wrap"><table><thead><tr><th>Fazenda</th><th>Nome</th><th>Modelo</th><th>Status</th></tr></thead><tbody>${tractors.map(t => `<tr><td>${escapeHTML(t.farmName)}</td><td><b>${escapeHTML(t.name)}</b></td><td>${escapeHTML(t.model || "—")} • ${escapeHTML(t.plate || "—")}</td><td><span class="badge ${t.status === "Disponível" ? "green" : "gold"}">${escapeHTML(t.status)}</span></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum trator cadastrado.</div>`}
      <div class="section-head"><h2>Implementos</h2></div>
      ${implementsList.length ? `<div class="table-wrap"><table><thead><tr><th>Fazenda</th><th>Nome</th><th>Categoria</th><th>Status</th></tr></thead><tbody>${implementsList.map(i => `<tr><td>${escapeHTML(i.farmName)}</td><td><b>${escapeHTML(i.name)}</b></td><td>${escapeHTML(i.category || "—")}</td><td><span class="badge ${i.status === "Disponível" ? "green" : "gold"}">${escapeHTML(i.status)}</span></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum implemento cadastrado.</div>`}`;
    return;
  }

  const farm = activeFarm();
  $("#pageContent").innerHTML = `
    <div class="grid two">
      <form id="tractorForm" class="form-card"><h3>Novo trator</h3><div class="form-grid" style="margin-top:18px"><label>Nome<input name="name" required></label><label>Modelo<input name="model"></label><label>Identificação<input name="plate"></label><label>Status<select name="status"><option>Disponível</option><option>Manutenção</option><option>Parado</option></select></label></div><div class="form-actions"><button class="btn primary">Adicionar trator</button></div></form>
      <form id="implementForm" class="form-card"><h3>Novo implemento</h3><div class="form-grid" style="margin-top:18px"><label>Nome<input name="name" required></label><label>Categoria<input name="category"></label><label class="wide">Status<select name="status"><option>Disponível</option><option>Manutenção</option><option>Parado</option></select></label></div><div class="form-actions"><button class="btn primary">Adicionar implemento</button></div></form>
    </div>
    <div class="section-head"><h2>Tratores</h2></div>${equipmentTable("tractor")}
    <div class="section-head"><h2>Implementos</h2></div>${equipmentTable("implement")}`;

  $("#tractorForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    farm.tractors.push({ id: uid(), name: f.get("name"), model: f.get("model"), plate: f.get("plate"), status: f.get("status") });
    saveData(); renderEquipmentAdmin(); toast("Trator adicionado.");
  };
  $("#implementForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    farm.implements.push({ id: uid(), name: f.get("name"), category: f.get("category"), status: f.get("status") });
    saveData(); renderEquipmentAdmin(); toast("Implemento adicionado.");
  };
  $$(".delete-equipment").forEach(btn => btn.onclick = () => {
    if (btn.dataset.type === "tractor") farm.tractors = farm.tractors.filter(x => x.id !== btn.dataset.id);
    else farm.implements = farm.implements.filter(x => x.id !== btn.dataset.id);
    saveData(); renderEquipmentAdmin(); toast("Item removido.");
  });
}

function equipmentTable(type) {
  const arr = type === "tractor" ? activeFarm().tractors : activeFarm().implements;
  if (!arr.length) return `<div class="card empty">Nenhum item cadastrado.</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Nome</th><th>${type === "tractor" ? "Modelo / ID" : "Categoria"}</th><th>Status</th><th></th></tr></thead><tbody>${arr.map(x => `<tr><td><b>${escapeHTML(x.name)}</b></td><td>${type === "tractor" ? `${escapeHTML(x.model || "—")} • ${escapeHTML(x.plate || "—")}` : escapeHTML(x.category || "—")}</td><td><span class="badge ${x.status === "Disponível" ? "green" : "gold"}">${escapeHTML(x.status)}</span></td><td><button class="btn danger small delete-equipment" data-type="${type}" data-id="${x.id}">Excluir</button></td></tr>`).join("")}</tbody></table></div>`;
}

function renderStock() {
  const items = contextStock();
  const totalValue = items.reduce((s, x) => s + Number(x.quantity || 0) * Number(x.unitCost || 0), 0);
  setHeader("INSUMOS", isGeneralView() ? "Estoque geral" : "Estoque");

  if (isGeneralView()) {
    $("#pageContent").innerHTML = `
      <div class="card soft"><span class="eyebrow dark">VISÃO GERAL</span><h2>${items.length} itens</h2><p class="muted">Valor estimado total: <b>${money(totalValue)}</b>. Para cadastrar ou editar, escolha uma fazenda específica.</p></div>
      ${items.length ? `<div class="table-wrap" style="margin-top:18px"><table><thead><tr><th>Fazenda</th><th>Produto</th><th>Categoria</th><th>Qtd.</th><th>Unid.</th><th>Mínimo</th><th>Custo un.</th><th>Valor</th></tr></thead><tbody>${items.map(s => `<tr><td>${escapeHTML(s.farmName)}</td><td><b>${escapeHTML(s.item)}</b></td><td>${escapeHTML(s.category)}</td><td>${s.quantity}</td><td>${escapeHTML(s.unit)}</td><td>${s.min}</td><td>${money(s.unitCost)}</td><td>${money(Number(s.quantity || 0) * Number(s.unitCost || 0))}</td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum item de estoque.</div>`}`;
    return;
  }

  const farm = activeFarm();
  const cats = stockCategories();
  $("#pageContent").innerHTML = `
    <div class="grid two">
      <form id="stockForm" class="form-card"><div class="inline"><h3>Adicionar item</h3><span class="badge green right">CEO / ADM</span></div><div class="form-grid" style="margin-top:18px"><label>Produto<input name="item" required></label><label>Categoria<select name="category">${cats.map(c => `<option>${c}</option>`).join("")}</select></label><label>Quantidade<input name="quantity" type="number" min="0" step="0.01" required></label><label>Unidade<input name="unit" required placeholder="kg, L, sacos..."></label><label>Estoque mínimo<input name="min" type="number" min="0" step="0.01" value="0"></label><label>Custo unitário<input name="unitCost" type="number" min="0" step="0.01" value="0"></label></div><div class="form-actions"><button class="btn primary">Salvar item</button></div></form>
      <div class="card soft"><span class="eyebrow dark">ESTOQUE</span><h2>${farm.stock.length} itens</h2><p class="muted">Valor estimado: <b>${money(totalValue)}</b></p></div>
    </div>
    <div class="section-head"><div><h2>Itens salvos</h2><p>Quantidade pode ser atualizada diretamente.</p></div></div>
    ${farm.stock.length ? `<div class="table-wrap"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Qtd.</th><th>Unidade</th><th>Mínimo</th><th>Custo un.</th><th>Valor</th><th></th></tr></thead><tbody>${farm.stock.map(s => `<tr><td><b>${escapeHTML(s.item)}</b></td><td>${escapeHTML(s.category)}</td><td><input class="stock-q" data-id="${s.id}" type="number" min="0" step="0.01" value="${Number(s.quantity || 0)}" style="width:90px"></td><td>${escapeHTML(s.unit)}</td><td>${s.min}</td><td>${money(s.unitCost)}</td><td>${money(Number(s.quantity || 0) * Number(s.unitCost || 0))}</td><td><button class="btn danger small stock-del" data-id="${s.id}">Excluir</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Estoque vazio.</div>`}`;

  $("#stockForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    farm.stock.push({ id: uid(), item: f.get("item"), category: f.get("category"), quantity: Number(f.get("quantity")), unit: f.get("unit"), min: Number(f.get("min")), unitCost: Number(f.get("unitCost")) });
    saveData(); renderStock(); toast("Item salvo.");
  };
  $$(".stock-q").forEach(inp => inp.onchange = () => {
    const item = farm.stock.find(x => x.id === inp.dataset.id);
    if (!item) return;
    item.quantity = Number(inp.value);
    saveData(); renderStock();
  });
  $$(".stock-del").forEach(btn => btn.onclick = () => {
    farm.stock = farm.stock.filter(x => x.id !== btn.dataset.id);
    saveData(); renderStock();
  });
}

function financeForm(admin = false) {
  const coffee = selectedType() === "coffee";
  const cats = financeCategories();
  return `<form id="financeForm" class="form-card"><div class="inline"><h3>Novo lançamento</h3>${admin ? `<span class="badge gold right">ADM não vê o balanço</span>` : ""}</div><div class="form-grid" style="margin-top:18px"><label>Tipo<select name="type" id="financeType"><option value="entrada">Entrada</option><option value="saida">Despesa / saída</option></select></label><label>Categoria<select name="category" id="financeCategory">${cats.map(c => `<option>${c}</option>`).join("")}</select></label><label class="wide">Descrição<input name="description" required></label><label>Data<input name="date" type="date" value="${todayISO()}" required></label><label>Valor manual (R$)<input name="value" type="number" min="0" step="0.01"></label>${coffee ? `<div id="coffeeFields" class="wide card soft"><b>Venda por sacas de café (60 kg)</b><div class="form-grid" style="margin-top:12px"><label>Sacas<input id="bagsInput" name="bags" type="number" min="0" step="0.01"></label><label>Cotação R$/saca<input id="quoteInput" name="quote" type="number" min="0" step="0.01" value="${quote ? quote.brlPerSaca.toFixed(2) : ""}"></label></div><p class="subtle">Valor calculado: <b id="coffeeCalc">${money(0)}</b></p></div>` : ""}</div><div class="form-actions">${coffee ? `<button type="button" id="refreshQuoteBtn" class="btn">Atualizar cotação</button>` : ""}<button class="btn primary">Registrar</button></div></form>`;
}

function bindFinanceForm(after) {
  const coffee = selectedType() === "coffee";
  if (coffee) {
    const sync = () => {
      const visible = $("#financeType").value === "entrada" && $("#financeCategory").value === "Venda de café";
      $("#coffeeFields").classList.toggle("hidden", !visible);
      const bags = Number($("#bagsInput").value || 0);
      const q = Number($("#quoteInput").value || 0);
      $("#coffeeCalc").textContent = money(bags * q);
    };
    $("#financeType").onchange = sync;
    $("#financeCategory").onchange = sync;
    $("#bagsInput").oninput = sync;
    $("#quoteInput").oninput = sync;
    sync();
    $("#refreshQuoteBtn").onclick = async () => { await refreshQuote(); if (quote) { $("#quoteInput").value = quote.brlPerSaca.toFixed(2); sync(); } };
  }
  $("#financeForm").onsubmit = e => {
    e.preventDefault();
    const farm = activeFarm();
    if (!farm) return toast("Selecione uma fazenda específica para lançar.");
    const f = new FormData(e.target);
    let value = Number(f.get("value") || 0);
    const bags = Number(f.get("bags") || 0);
    const q = Number(f.get("quote") || 0);
    if (coffee && f.get("type") === "entrada" && f.get("category") === "Venda de café" && bags > 0 && q > 0) value = bags * q;
    if (value <= 0) return toast("Informe um valor válido.");
    farm.finances.push({ id: uid(), type: f.get("type"), category: f.get("category"), description: f.get("description"), date: f.get("date"), value, bags: coffee ? bags : 0, quoteUsed: coffee ? q : 0, createdBy: currentUser.name, createdAt: new Date().toISOString() });
    saveData(); toast("Lançamento registrado."); after();
  };
}

function monthSeries(finances) {
  const out = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const items = finances.filter(x => String(x.date || "").startsWith(key));
    const income = items.filter(x => x.type === "entrada").reduce((s, x) => s + Number(x.value || 0), 0);
    const expense = items.filter(x => x.type === "saida").reduce((s, x) => s + Number(x.value || 0), 0);
    out.push({ label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), income, expense, profit: income - expense });
  }
  return out;
}

function renderFinancialChart(finances) {
  const rows = monthSeries(finances);
  const max = Math.max(1, ...rows.flatMap(r => [r.income, r.expense, Math.abs(r.profit)]));
  return `<div class="chart-legend"><span class="legend-item"><i class="legend-dot legend-income"></i>Entradas</span><span class="legend-item"><i class="legend-dot legend-expense"></i>Gastos</span><span class="legend-item"><i class="legend-dot legend-profit"></i>Resultado</span></div><div class="finance-chart">${rows.map(r => `<div class="month-group"><div class="month-bars"><div class="bar income" style="height:${Math.max(2, r.income / max * 190)}px"><span class="bar-value">${compactMoney(r.income)}</span></div><div class="bar expense" style="height:${Math.max(2, r.expense / max * 190)}px"><span class="bar-value">${compactMoney(r.expense)}</span></div><div class="bar ${r.profit >= 0 ? "profit" : "loss"}" style="height:${Math.max(2, Math.abs(r.profit) / max * 190)}px"><span class="bar-value">${compactMoney(r.profit)}</span></div></div><div class="month-label">${r.label}</div></div>`).join("")}</div>`;
}

function renderFinanceAdmin() {
  setHeader("FINANCEIRO", "Registrar entradas e despesas");
  $("#pageContent").innerHTML = `<div class="grid two">${financeForm(true)}<div class="card soft"><span class="eyebrow dark">PERMISSÃO DO ADM</span><h2>Registrar sem visualizar o balanço.</h2><p class="muted">O saldo consolidado e o histórico completo são exclusivos do CEO.</p></div></div>`;
  bindFinanceForm(renderFinanceAdmin);
}

function renderFinanceCEO() {
  const finances = contextFinances();
  const income = finances.filter(x => x.type === "entrada").reduce((s, x) => s + Number(x.value || 0), 0);
  const expense = finances.filter(x => x.type === "saida").reduce((s, x) => s + Number(x.value || 0), 0);
  const profit = income - expense;
  setHeader("FINANCEIRO", isGeneralView() ? "Balanço geral" : "Balanço financeiro");
  $("#pageContent").innerHTML = `
    <div class="grid kpis"><div class="card"><div class="kpi-label"><span>Entradas</span><span class="kpi-icon">${ico("up")}</span></div><div class="kpi-value text-green">${money(income)}</div></div><div class="card"><div class="kpi-label"><span>Gastos</span><span class="kpi-icon">${ico("down")}</span></div><div class="kpi-value text-red">${money(expense)}</div></div><div class="card"><div class="kpi-label"><span>Resultado</span><span class="kpi-icon">${ico("chart")}</span></div><div class="kpi-value ${profit >= 0 ? "text-green" : "text-red"}">${money(profit)}</div></div><div class="card"><div class="kpi-label"><span>Escopo</span><span class="kpi-icon">${selectedType() === "cattle" ? ico("cattle") : ico("bean")}</span></div><div class="kpi-value" style="font-size:24px">${isGeneralView() ? "Geral" : contextName()}</div></div></div>
    <div class="section-head"><div><h2>Entradas, gastos e lucro</h2><p>Últimos 6 meses.</p></div></div>
    <div class="card chart-card">${renderFinancialChart(finances)}</div>
    ${isGeneralView() ? `<div class="card soft" style="margin-top:18px"><b>Modo geral</b><p class="muted" style="margin-bottom:0">No modo geral você consulta o consolidado de todas as fazendas. Para adicionar um novo lançamento, escolha uma fazenda específica.</p></div>` : `<div class="section-head"><h2>Novo lançamento</h2></div>${financeForm(false)}`}
    <div class="section-head"><h2>Histórico completo</h2></div>
    ${finances.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Fazenda</th><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Lançado por</th></tr></thead><tbody>${[...finances].reverse().map(x => `<tr><td>${dateBR(x.date)}</td><td>${escapeHTML(x.farmName || "—")}</td><td><span class="badge ${x.type === "entrada" ? "green" : "red"}">${x.type === "entrada" ? "Entrada" : "Saída"}</span></td><td>${escapeHTML(x.description)}</td><td>${escapeHTML(x.category)}</td><td><b>${money(x.value)}</b></td><td>${escapeHTML(x.createdBy || "—")}</td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum lançamento ainda.</div>`}`;
  if (!isGeneralView()) bindFinanceForm(renderFinanceCEO);
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function renderNotes() {
  setHeader("DOCUMENTOS", isGeneralView() ? "Notas gerais" : "Notas fiscais");
  const notes = contextNotes();
  if (isGeneralView()) {
    $("#pageContent").innerHTML = `
      <div class="card soft"><span class="eyebrow dark">VISÃO GERAL</span><h2>${notes.length} notas</h2><p class="muted">Consulta consolidada de todas as fazendas desse tipo. Para lançar uma nota, escolha uma fazenda específica.</p></div>
      <div class="section-head"><h2>Notas salvas</h2></div>
      ${notes.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Fazenda</th><th>Nº</th><th>Tipo</th><th>Parte</th><th>Categoria</th><th>Valor</th><th>Anexo</th></tr></thead><tbody>${[...notes].reverse().map(n => `<tr><td>${dateBR(n.date)}</td><td>${escapeHTML(n.farmName)}</td><td>${escapeHTML(n.number)}</td><td>${n.noteType === "venda" ? "Venda" : "Compra"}</td><td>${escapeHTML(n.party)}</td><td>${escapeHTML(n.category)}</td><td>${money(n.value)}</td><td>${n.fileData ? `<a class="btn small" href="${n.fileData}" download="${escapeHTML(n.fileName || "anexo")}">Abrir</a>` : "Sem anexo"}</td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma nota.</div>`}`;
    return;
  }

  const farm = activeFarm();
  $("#pageContent").innerHTML = `
    <div class="grid two"><form id="noteForm" class="form-card"><h3>Lançar nota</h3><div class="form-grid" style="margin-top:18px"><label>Tipo<select name="noteType"><option value="compra">Compra / despesa</option><option value="venda">Venda / entrada</option></select></label><label>Número<input name="number" required></label><label>Fornecedor / cliente<input name="party" required></label><label>Categoria<select name="category">${financeCategories().map(c => `<option>${c}</option>`).join("")}</select></label><label>Data<input name="date" type="date" value="${todayISO()}" required></label><label>Valor<input name="value" type="number" min="0" step="0.01" required></label><label class="wide">Observação<textarea name="description" rows="3"></textarea></label><label class="wide">Foto ou arquivo da nota (imagem/PDF até 1 MB)<input name="file" type="file" accept="image/*,application/pdf"></label><label class="wide" style="display:flex;grid-template-columns:auto 1fr;align-items:center;gap:10px"><input name="postFinance" type="checkbox" checked style="width:auto">Lançar automaticamente no financeiro</label></div><div class="form-actions"><button class="btn primary">Salvar nota</button></div></form><div class="card soft"><span class="eyebrow dark">ARQUIVO</span><h2>${farm.notes.length} notas</h2><p class="muted">Dados salvos no navegador e separados por fazenda.</p></div></div>
    <div class="section-head"><h2>Notas salvas</h2></div>
    ${farm.notes.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Nº</th><th>Tipo</th><th>Parte</th><th>Categoria</th><th>Valor</th><th>Anexo</th><th></th></tr></thead><tbody>${[...farm.notes].reverse().map(n => `<tr><td>${dateBR(n.date)}</td><td>${escapeHTML(n.number)}</td><td>${n.noteType === "venda" ? "Venda" : "Compra"}</td><td>${escapeHTML(n.party)}</td><td>${escapeHTML(n.category)}</td><td>${money(n.value)}</td><td>${n.fileData ? `<a class="btn small" href="${n.fileData}" download="${escapeHTML(n.fileName || "anexo")}">Abrir</a>` : "Sem anexo"}</td><td><button class="btn danger small note-del" data-id="${n.id}">Excluir</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma nota.</div>`}`;

  $("#noteForm").onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const value = Number(f.get("value") || 0);
    if (value <= 0) return toast("Informe o valor.");
    const file = e.target.elements.file.files[0];
    let fileData = "", fileName = "", fileType = "";
    if (file) {
      if (file.size > 1024 * 1024) return toast("O anexo precisa ter no máximo 1 MB neste protótipo.");
      try {
        fileData = await fileToDataURL(file);
        fileName = file.name;
        fileType = file.type;
      } catch (_) {
        return toast("Não foi possível ler o arquivo.");
      }
    }
    const note = { id: uid(), noteType: f.get("noteType"), number: f.get("number"), party: f.get("party"), category: f.get("category"), date: f.get("date"), value, description: f.get("description"), fileData, fileName, fileType, createdBy: currentUser.name };
    farm.notes.push(note);
    if (f.get("postFinance")) {
      farm.finances.push({ id: uid(), type: note.noteType === "venda" ? "entrada" : "saida", category: note.category, description: `Nota ${note.number} • ${note.party}`, date: note.date, value, noteId: note.id, createdBy: currentUser.name });
    }
    saveData(); renderNotes(); toast("Nota salva.");
  };

  $$(".note-del").forEach(btn => btn.onclick = () => {
    farm.notes = farm.notes.filter(n => n.id !== btn.dataset.id);
    farm.finances = farm.finances.filter(fin => fin.noteId !== btn.dataset.id);
    saveData(); renderNotes();
  });
}

function renderFarms() {
  if (currentUser.role !== "ceo") return;
  setHeader("ESTRUTURA", "Fazendas");
  $("#pageContent").innerHTML = `
    <div class="grid two"><form id="newFarmForm" class="form-card"><div class="inline"><h3>Criar nova fazenda</h3><span class="badge gold right">Somente CEO</span></div><div class="form-grid" style="margin-top:18px"><label>Nome<input name="name" required placeholder="Nome da fazenda"></label><label>Atividade<select name="type"><option value="coffee">Café</option><option value="cattle">Gado</option></select></label></div><div class="form-actions"><button class="btn primary">Criar fazenda</button></div></form><div class="card soft"><span class="eyebrow dark">ESTRUTURA</span><h2>${data.farms.length} fazendas</h2><p class="muted">Você pode criar quantas precisar e alternar entre café e gado. A troca do tipo não apaga os dados anteriores.</p></div></div>
    <div class="section-head"><h2>Fazendas cadastradas</h2></div>
    <div class="grid two">${data.farms.map(f => `<form class="form-card farm-edit" data-id="${f.id}"><div class="inline"><span class="badge ${f.type === "cattle" ? "gold" : "green"}">${farmTypeLabel(f)}</span>${f.id === activeFarmId ? `<span class="badge">Ativa</span>` : ""}</div><label>Nome<input name="name" value="${escapeHTML(f.name)}" required></label><label>Atividade<select name="type"><option value="coffee" ${f.type === "coffee" ? "selected" : ""}>Café</option><option value="cattle" ${f.type === "cattle" ? "selected" : ""}>Gado</option></select></label><div class="form-actions"><button type="button" class="btn danger farm-delete" data-id="${f.id}">Excluir</button><button class="btn primary">Salvar alterações</button></div></form>`).join("")}</div>`;

  $("#newFarmForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const farm = newFarm(String(f.get("name")).trim(), f.get("type") === "cattle" ? "cattle" : "coffee");
    data.farms.push(farm);
    activeFarmId = farm.id;
    saveData(); renderFarmSelector(); renderFarms(); toast("Fazenda criada.");
  };
  $$(".farm-edit").forEach(form => form.onsubmit = e => {
    e.preventDefault();
    const farm = data.farms.find(x => x.id === form.dataset.id);
    const f = new FormData(form);
    farm.name = String(f.get("name")).trim();
    farm.type = f.get("type") === "cattle" ? "cattle" : "coffee";
    saveData(); renderFarmSelector(); renderFarms(); toast("Fazenda atualizada.");
  });
  $$(".farm-delete").forEach(btn => btn.onclick = () => {
    if (data.farms.length <= 1) return toast("É necessário manter pelo menos uma fazenda.");
    const farm = data.farms.find(x => x.id === btn.dataset.id);
    if (!confirm(`Excluir ${farm.name}? Os dados desta fazenda serão apagados deste navegador.`)) return;
    data.farms = data.farms.filter(x => x.id !== farm.id);
    data.receipts = data.receipts.filter(r => r.farmId !== farm.id);
    if (activeFarmId === farm.id) activeFarmId = data.farms[0].id;
    saveData(); renderFarmSelector(); renderFarms(); toast("Fazenda excluída.");
  });
}

function renderUsers() {
  if (currentUser.role !== "ceo") return;
  setHeader("ACESSOS", "Usuários e solicitações");
  $("#pageContent").innerHTML = `
    <div class="grid two"><form id="userForm" class="form-card"><div class="inline"><h3>Criar login</h3><span class="badge gold right">Somente CEO</span></div><div class="form-grid" style="margin-top:18px"><label>Nome<input name="name" required></label><label>Função (opcional)<input name="function"></label><label>Chave PIX (opcional)<input name="pixKey"></label><label>Usuário<input name="username" required></label><label>Senha inicial<input name="password" type="password" minlength="6" required></label><label>Perfil<select name="role"><option value="contribuinte">Contribuinte</option><option value="adm">Administrador</option><option value="ceo">CEO</option></select></label></div><div class="form-actions"><button class="btn primary">Criar login</button></div></form><div class="card soft"><span class="eyebrow dark">ACESSOS</span><h2>${data.users.filter(u => u.active !== false).length} ativos</h2><p class="muted">Aqui o CEO pode criar, aceitar, bloquear e excluir acessos.</p></div></div>
    <div class="section-head"><h2>Solicitações pendentes</h2></div>
    ${data.pendingRegistrations.length ? `<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Usuário</th><th>Perfil</th><th>Função</th><th>PIX</th><th>Pedido em</th><th>Ações</th></tr></thead><tbody>${data.pendingRegistrations.map(r => `<tr><td><b>${escapeHTML(r.name)}</b></td><td>${escapeHTML(r.username)}</td><td>${ROLE_NAMES[r.role]}</td><td>${escapeHTML(r.function || "—")}</td><td>${escapeHTML(r.pixKey || "—")}</td><td>${new Date(r.createdAt).toLocaleString("pt-BR")}</td><td><div class="inline"><button class="btn small reg-approve" data-id="${r.id}">Aceitar</button><button class="btn danger small reg-reject" data-id="${r.id}">Recusar</button></div></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma solicitação pendente.</div>`}
    <div class="section-head"><h2>Usuários cadastrados</h2></div>
    <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Usuário</th><th>Perfil</th><th>Função</th><th>PIX</th><th>Status</th><th>Ações</th></tr></thead><tbody>${data.users.map(u => `<tr><td><b>${escapeHTML(u.name)}</b>${u.id === currentUser.id ? ' <span class="badge gold">Você</span>' : ""}</td><td>${escapeHTML(u.username)}</td><td>${ROLE_NAMES[u.role]}</td><td>${escapeHTML(u.function || "—")}</td><td>${escapeHTML(u.pixKey || "—")}</td><td><span class="badge ${u.active !== false ? "green" : "red"}">${u.active !== false ? "Ativo" : "Bloqueado"}</span></td><td><div class="inline"><button class="btn small user-pass" data-id="${u.id}">Senha</button><button class="btn small user-toggle" data-id="${u.id}">${u.active !== false ? "Desativar" : "Ativar"}</button><button class="btn danger small user-del" data-id="${u.id}">Excluir</button></div></td></tr>`).join("")}</tbody></table></div>`;

  $("#userForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    createUser(Object.fromEntries(f.entries()), renderUsers);
  };
  $$(".reg-approve").forEach(btn => btn.onclick = () => approveRegistration(btn.dataset.id));
  $$(".reg-reject").forEach(btn => btn.onclick = () => rejectRegistration(btn.dataset.id));
  $$(".user-pass").forEach(btn => btn.onclick = () => {
    const user = data.users.find(x => x.id === btn.dataset.id);
    const p = prompt(`Nova senha para ${user.username}:`);
    if (p === null) return;
    if (p.length < 6) return toast("Mínimo 6 caracteres.");
    user.password = p;
    saveData(); toast("Senha alterada.");
  });
  $$(".user-toggle").forEach(btn => btn.onclick = () => {
    const user = data.users.find(x => x.id === btn.dataset.id);
    if (user.id === currentUser.id) return toast("Você não pode desativar seu próprio acesso.");
    if (user.role === "ceo" && user.active !== false && data.users.filter(x => x.role === "ceo" && x.active !== false).length <= 1) return toast("Mantenha pelo menos um CEO ativo.");
    user.active = user.active === false;
    saveData(); renderUsers();
  });
  $$(".user-del").forEach(btn => btn.onclick = () => {
    const user = data.users.find(x => x.id === btn.dataset.id);
    if (user.id === currentUser.id) return toast("Você não pode excluir seu próprio acesso.");
    if (user.role === "ceo" && user.active !== false && data.users.filter(x => x.role === "ceo" && x.active !== false).length <= 1) return toast("Mantenha pelo menos um CEO ativo.");
    if (!confirm(`Excluir ${user.name}?`)) return;
    data.users = data.users.filter(x => x.id !== user.id);
    data.receipts = data.receipts.filter(r => r.userId !== user.id);
    saveData(); renderUsers();
  });
}

function renderPayments() {
  if (currentUser.role !== "ceo") return;
  setHeader("PAGAMENTOS", "Comprovantes por usuário");
  const contributors = data.users.filter(u => u.role === "contribuinte" && u.active !== false);
  $("#pageContent").innerHTML = `
    <div class="grid two"><form id="paymentForm" class="form-card"><div class="inline"><h3>Enviar comprovante</h3><span class="badge gold right">Somente CEO</span></div><div class="form-grid" style="margin-top:18px"><label>Nome do recebedor<input name="recipientName" id="paymentRecipientName" required placeholder="Digite o nome"></label><label>Usuário cadastrado (opcional)<select name="userId" id="paymentUser"><option value="">Não vincular a um usuário</option>${contributors.map(u => `<option value="${u.id}">${escapeHTML(u.name)} • ${escapeHTML(u.function || "Contribuinte")}</option>`).join("")}</select></label><label>Fazenda<select name="farmId">${data.farms.map(f => `<option value="${f.id}" ${f.id === activeFarm()?.id ? "selected" : ""}>${escapeHTML(f.name)}</option>`).join("")}</select></label><label>Data<input name="date" type="date" value="${todayISO()}" required></label><label>Valor (R$)<input name="amount" type="number" min="0" step="0.01" required></label><label class="wide">Descrição<input name="description" required placeholder="Ex.: pagamento semanal, diária, serviço..."></label><div id="paymentRecipientInfo" class="wide card soft"><b>Dados do recebedor</b><p class="subtle" style="margin-bottom:0">Você pode apenas escrever o nome ou vincular a um usuário. Se vincular, o comprovante aparece na conta dele.</p></div><label class="wide">Comprovante (PDF ou imagem, até 1 MB)<input name="file" type="file" accept="application/pdf,image/*"></label></div><div class="form-actions"><button class="btn primary">Salvar comprovante</button></div></form><div class="card soft"><span class="eyebrow dark">PRIVACIDADE</span><h2>${data.receipts.length} comprovantes</h2><p class="muted">Com usuário vinculado, o contribuinte recebe o comprovante na conta. Sem usuário, o registro fica apenas para o CEO.</p></div></div>
    <div class="section-head"><h2>Comprovantes enviados</h2></div>
    ${data.receipts.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Recebedor</th><th>Usuário vinculado</th><th>Fazenda</th><th>Descrição</th><th>Valor</th><th>Arquivo</th><th></th></tr></thead><tbody>${[...data.receipts].reverse().map(r => { const u = data.users.find(x => x.id === r.userId); const f = data.farms.find(x => x.id === r.farmId); const recipient = r.recipientName || u?.name || "—"; return `<tr><td>${dateBR(r.date)}</td><td><b>${escapeHTML(recipient)}</b></td><td>${u ? escapeHTML(u.username) : "Não vinculado"}</td><td>${escapeHTML(f?.name || "—")}</td><td>${escapeHTML(r.description)}</td><td>${money(r.amount)}</td><td>${r.fileData ? `<a class="btn small" href="${r.fileData}" download="${escapeHTML(r.fileName || "comprovante")}">Abrir / baixar</a>` : "Sem arquivo"}</td><td><button class="btn danger small receipt-del" data-id="${r.id}">Excluir</button></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum comprovante enviado.</div>`}`;

  const paymentUser = $("#paymentUser");
  const paymentRecipientName = $("#paymentRecipientName");
  const syncRecipient = () => {
    const u = data.users.find(x => x.id === paymentUser.value);
    if (u) {
      paymentRecipientName.value = u.name;
      $("#paymentRecipientInfo").innerHTML = `<b>${escapeHTML(u.name)}</b><p class="subtle" style="margin:6px 0 0">Função: ${escapeHTML(u.function || "Não informada")} • PIX: ${escapeHTML(u.pixKey || "Não informado")} • O comprovante será enviado para este usuário.</p>`;
    } else {
      $("#paymentRecipientInfo").innerHTML = `<b>Recebedor manual</b><p class="subtle" style="margin:6px 0 0">Digite o nome acima. Sem um usuário vinculado, o comprovante ficará salvo somente no painel do CEO.</p>`;
    }
  };
  paymentUser.onchange = syncRecipient;
  syncRecipient();

  $("#paymentForm").onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const file = e.target.elements.file.files[0];
    let fileData = "", fileName = "", fileType = "";
    if (file) {
      if (file.size > 1024 * 1024) return toast("O arquivo precisa ter no máximo 1 MB neste protótipo.");
      try {
        fileData = await fileToDataURL(file);
        fileName = file.name;
        fileType = file.type;
      } catch (_) { return toast("Não foi possível ler o arquivo."); }
    }
    const amount = Number(f.get("amount") || 0);
    const recipientName = String(f.get("recipientName") || "").trim();
    const userId = String(f.get("userId") || "");
    if (!recipientName) return toast("Informe o nome do recebedor.");
    if (amount <= 0) return toast("Informe o valor.");
    data.receipts.push({ id: uid(), recipientName, userId, farmId: f.get("farmId"), date: f.get("date"), amount, description: f.get("description"), fileData, fileName, fileType, createdAt: new Date().toISOString(), createdBy: currentUser.id });
    saveData(); renderPayments(); toast(userId ? "Comprovante salvo e enviado ao usuário." : "Comprovante salvo pelo nome do recebedor.");
  };
  $$(".receipt-del").forEach(btn => btn.onclick = () => { data.receipts = data.receipts.filter(r => r.id !== btn.dataset.id); saveData(); renderPayments(); });
}

function renderMyReceipts() {
  const list = data.receipts.filter(r => r.userId === currentUser.id);
  setHeader("PAGAMENTOS", "Meus comprovantes");
  $("#pageContent").innerHTML = `
    <div class="card soft"><span class="eyebrow dark">ÁREA PRIVADA</span><h2>${list.length} comprovantes</h2><p class="muted">Somente os comprovantes enviados para o seu usuário aparecem aqui.</p>${currentUser.pixKey ? `<p><b>PIX cadastrado:</b> ${escapeHTML(currentUser.pixKey)}</p>` : ""}</div>
    <div class="section-head"><h2>Histórico</h2></div>
    ${list.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Fazenda</th><th>Descrição</th><th>Valor</th><th>Arquivo</th></tr></thead><tbody>${[...list].reverse().map(r => { const f = data.farms.find(x => x.id === r.farmId); return `<tr><td>${dateBR(r.date)}</td><td>${escapeHTML(f?.name || "—")}</td><td>${escapeHTML(r.description)}</td><td><b>${money(r.amount)}</b></td><td>${r.fileData ? `<a class="btn small" href="${r.fileData}" download="${escapeHTML(r.fileName || "comprovante")}">Abrir / baixar</a>` : "Sem arquivo"}</td></tr>`; }).join("")}</tbody></table></div>` : `<div class="card empty">Você ainda não recebeu comprovantes.</div>`}`;
}

function renderCattle() {
  if (selectedType() !== "cattle") return renderEquipmentAdmin();
  setHeader("PECUÁRIA", isGeneralView() ? "Gado geral" : "Lotes e pesagens");
  if (isGeneralView()) {
    const lots = contextLots();
    const weighings = contextWeighings();
    const heads = lots.reduce((s, l) => s + Number(l.heads || 0), 0);
    $("#pageContent").innerHTML = `
      <div class="grid kpis"><div class="card"><div class="kpi-label"><span>Fazendas</span><span class="kpi-icon">${ico("home")}</span></div><div class="kpi-value">${farmsInContext().length}</div></div><div class="card"><div class="kpi-label"><span>Lotes</span><span class="kpi-icon">${ico("cattle")}</span></div><div class="kpi-value">${lots.length}</div></div><div class="card"><div class="kpi-label"><span>Cabeças</span><span class="kpi-icon">${ico("hash")}</span></div><div class="kpi-value">${heads}</div></div><div class="card"><div class="kpi-label"><span>Pesagens</span><span class="kpi-icon">${ico("at")}</span></div><div class="kpi-value">${weighings.length}</div></div></div>
      <div class="card soft" style="margin-top:18px"><b>Modo geral</b><p class="muted" style="margin-bottom:0">A consulta abaixo reúne todos os lotes e pesagens das fazendas de gado.</p></div>
      <div class="section-head"><h2>Lotes</h2></div>
      ${lots.length ? `<div class="table-wrap"><table><thead><tr><th>Fazenda</th><th>Lote</th><th>Categoria</th><th>Cabeças</th><th>Entrada</th></tr></thead><tbody>${lots.map(l => `<tr><td>${escapeHTML(l.farmName)}</td><td><b>${escapeHTML(l.name)}</b></td><td>${escapeHTML(l.category || "—")}</td><td>${l.heads}</td><td>${dateBR(l.entryDate)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum lote cadastrado.</div>`}
      <div class="section-head"><h2>Pesagens</h2></div>
      ${weighings.length ? `<div class="table-wrap"><table><thead><tr><th>Fazenda</th><th>Data</th><th>Animais</th><th>Peso total</th><th>Média kg</th><th>Média @</th></tr></thead><tbody>${[...weighings].reverse().map(w => `<tr><td>${escapeHTML(w.farmName)}</td><td>${dateBR(w.date)}</td><td>${w.heads}</td><td>${Number(w.totalKg).toLocaleString("pt-BR")} kg</td><td>${Number(w.avgKg).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg</td><td><b>${Number(w.avgArrobas).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}@</b></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma pesagem registrada.</div>`}`;
    return;
  }

  const farm = activeFarm();
  const lots = farm.cattle.lots;
  const ws = farm.cattle.weighings;
  $("#pageContent").innerHTML = `
    <div class="grid two"><form id="lotForm" class="form-card"><div class="inline"><h3>Novo lote</h3><span class="badge gold right">Gado</span></div><div class="form-grid" style="margin-top:18px"><label>Nome do lote<input name="name" required placeholder="Ex.: Lote 01"></label><label>Cabeças<input name="heads" type="number" min="1" step="1" required></label><label>Categoria<input name="category" placeholder="Ex.: garrotes, vacas, novilhas"></label><label>Data de entrada<input name="entryDate" type="date" value="${todayISO()}"></label><label class="wide">Observação<textarea name="notes" rows="2"></textarea></label></div><div class="form-actions"><button class="btn primary">Salvar lote</button></div></form><form id="weighForm" class="form-card"><h3>Nova pesagem</h3><div class="form-grid" style="margin-top:18px"><label>Lote<select name="lotId" required><option value="">Selecione</option>${lots.map(l => `<option value="${l.id}">${escapeHTML(l.name)}</option>`).join("")}</select></label><label>Data<input name="date" type="date" value="${todayISO()}" required></label><label>Animais pesados<input name="heads" type="number" min="1" step="1" required></label><label>Peso total (kg)<input name="totalKg" type="number" min="0.01" step="0.01" required></label><label class="wide">Observação<input name="notes"></label></div><p class="subtle">O sistema calcula média em kg, arrobas totais e média de @ por animal usando kg ÷ 15.</p><div class="form-actions"><button class="btn primary">Salvar pesagem</button></div></form></div>
    <div class="section-head"><h2>Lotes</h2></div>
    ${lots.length ? `<div class="table-wrap"><table><thead><tr><th>Lote</th><th>Categoria</th><th>Cabeças</th><th>Entrada</th><th>Observação</th><th></th></tr></thead><tbody>${lots.map(l => `<tr><td><b>${escapeHTML(l.name)}</b></td><td>${escapeHTML(l.category || "—")}</td><td>${l.heads}</td><td>${dateBR(l.entryDate)}</td><td>${escapeHTML(l.notes || "—")}</td><td><button class="btn danger small lot-del" data-id="${l.id}">Excluir</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum lote cadastrado.</div>`}
    <div class="section-head"><h2>Histórico de pesagens</h2></div>
    ${ws.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Lote</th><th>Animais</th><th>Peso total</th><th>Média kg</th><th>@ total</th><th>Média @/animal</th><th></th></tr></thead><tbody>${[...ws].reverse().map(w => { const l = lots.find(x => x.id === w.lotId); return `<tr><td>${dateBR(w.date)}</td><td><b>${escapeHTML(l?.name || "Lote removido")}</b></td><td>${w.heads}</td><td>${Number(w.totalKg).toLocaleString("pt-BR")} kg</td><td>${Number(w.avgKg).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg</td><td>${Number(w.totalArrobas).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}@</td><td><b>${Number(w.avgArrobas).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}@</b></td><td><button class="btn danger small weigh-del" data-id="${w.id}">Excluir</button></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma pesagem registrada.</div>`}`;

  $("#lotForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    lots.push({ id: uid(), name: f.get("name"), heads: Number(f.get("heads")), category: f.get("category"), entryDate: f.get("entryDate"), notes: f.get("notes") });
    saveData(); renderCattle();
  };
  $("#weighForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const heads = Number(f.get("heads"));
    const totalKg = Number(f.get("totalKg"));
    if (!f.get("lotId") || heads <= 0 || totalKg <= 0) return toast("Preencha lote, animais e peso.");
    ws.push({ id: uid(), lotId: f.get("lotId"), date: f.get("date"), heads, totalKg, avgKg: totalKg / heads, totalArrobas: totalKg / 15, avgArrobas: (totalKg / heads) / 15, notes: f.get("notes") });
    saveData(); renderCattle();
  };
  $$(".lot-del").forEach(btn => btn.onclick = () => {
    if (!confirm("Excluir este lote? As pesagens vinculadas também serão removidas.")) return;
    farm.cattle.lots = farm.cattle.lots.filter(l => l.id !== btn.dataset.id);
    farm.cattle.weighings = farm.cattle.weighings.filter(w => w.lotId !== btn.dataset.id);
    saveData(); renderCattle();
  });
  $$(".weigh-del").forEach(btn => btn.onclick = () => {
    farm.cattle.weighings = farm.cattle.weighings.filter(w => w.id !== btn.dataset.id);
    saveData(); renderCattle();
  });
}

function renderCattleReadOnly() {
  const farm = activeFarm();
  setHeader("PECUÁRIA", "Lotes e pesagens");
  const lots = farm.cattle.lots;
  const ws = farm.cattle.weighings;
  $("#pageContent").innerHTML = `<div class="card soft"><span class="eyebrow dark">VISÃO DO CONTRIBUINTE</span><h2>${lots.reduce((s, l) => s + Number(l.heads || 0), 0)} cabeças</h2><p class="muted">Dados operacionais da fazenda. Financeiro e estoque permanecem restritos.</p></div><div class="section-head"><h2>Lotes</h2></div><div class="grid three">${lots.map(l => `<div class="card"><span class="badge gold">${escapeHTML(l.category || "Gado")}</span><h3 style="margin-top:12px">${escapeHTML(l.name)}</h3><p class="muted">${l.heads} cabeças</p></div>`).join("") || `<div class="card empty">Nenhum lote cadastrado.</div>`}</div><div class="section-head"><h2>Últimas pesagens</h2></div>${ws.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Lote</th><th>Média kg</th><th>Média @</th></tr></thead><tbody>${[...ws].reverse().slice(0, 20).map(w => `<tr><td>${dateBR(w.date)}</td><td>${escapeHTML(lots.find(l => l.id === w.lotId)?.name || "—")}</td><td>${Number(w.avgKg).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg</td><td><b>${Number(w.avgArrobas).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}@</b></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma pesagem.</div>`}`;
}

function todayAssignment() {
  return activeFarm().assignments.find(a => a.user === currentUser.username && a.date === todayISO());
}

function renderContributorDay() {
  const farm = activeFarm();
  if (farm.type !== "coffee") return renderCattleReadOnly();
  setHeader("CAMPO", "Meu trabalho hoje");
  const existing = todayAssignment();
  const busyT = new Set(farm.assignments.filter(a => a.date === todayISO() && a.user !== currentUser.username).map(a => a.tractorId));
  const busyI = new Set(farm.assignments.filter(a => a.date === todayISO() && a.user !== currentUser.username).map(a => a.implementId));
  const tractors = farm.tractors.filter(t => t.status === "Disponível" && !busyT.has(t.id));
  const implementsList = farm.implements.filter(i => i.status === "Disponível" && !busyI.has(i.id));
  $("#pageContent").innerHTML = `<div class="assignment-hero"><div><span class="eyebrow">RESPONSABILIDADE DO DIA</span><h2>${existing ? "Equipamentos reservados." : "Escolha seus equipamentos."}</h2><p>O registro identifica o responsável durante o dia.</p></div><div class="assignment-status"><strong>${dateBR(todayISO())}</strong></div></div>${existing ? `<div class="grid two" style="margin-top:18px"><div class="card"><h3>Trator</h3><h2>${escapeHTML(existing.tractorName)}</h2></div><div class="card"><h3>Implemento</h3><h2>${escapeHTML(existing.implementName)}</h2></div></div><div class="card" style="margin-top:18px"><b>Atividade:</b> ${escapeHTML(existing.activity)}<div class="form-actions"><button id="changeAssignment" class="btn">Alterar</button></div></div>` : `<form id="assignmentForm"><div class="form-card"><label style="margin:0">Atividade<input name="activity" required></label></div><div class="section-head"><h2>Trator</h2></div><div class="grid two">${tractors.map(t => `<label class="equipment-pick"><span class="icon">${ico("tractor")}</span><span><strong>${escapeHTML(t.name)}</strong><span>${escapeHTML(t.model || "")}</span></span><input type="radio" name="tractor" value="${t.id}" required></label>`).join("") || `<div class="card empty">Nenhum trator disponível.</div>`}</div><div class="section-head"><h2>Implemento</h2></div><div class="grid two">${implementsList.map(i => `<label class="equipment-pick"><span class="icon">${ico("gear")}</span><span><strong>${escapeHTML(i.name)}</strong><span>${escapeHTML(i.category || "")}</span></span><input type="radio" name="implement" value="${i.id}" required></label>`).join("") || `<div class="card empty">Nenhum implemento disponível.</div>`}</div><div class="form-actions"><button class="btn primary">Confirmar responsabilidade</button></div></form>`}`;
  if (existing) {
    $("#changeAssignment").onclick = () => {
      farm.assignments = farm.assignments.filter(a => !(a.user === currentUser.username && a.date === todayISO()));
      saveData(); renderContributorDay();
    };
  } else if ($("#assignmentForm")) {
    $("#assignmentForm").onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const tractor = farm.tractors.find(x => x.id === f.get("tractor"));
      const implemento = farm.implements.find(x => x.id === f.get("implement"));
      if (!tractor || !implemento) return toast("Escolha um trator e um implemento.");
      farm.assignments.push({ id: uid(), date: todayISO(), user: currentUser.username, userName: currentUser.name, activity: f.get("activity"), tractorId: tractor.id, tractorName: tractor.name, implementId: implemento.id, implementName: implemento.name });
      saveData(); renderContributorDay();
    };
  }
}

function renderContributorEquipment() {
  const farm = activeFarm();
  setHeader("CAMPO", "Equipamentos disponíveis");
  $("#pageContent").innerHTML = `<div class="section-head" style="margin-top:0"><h2>Tratores</h2></div><div class="grid three">${farm.tractors.filter(x => x.status === "Disponível").map(t => `<div class="card"><span class="badge green">Disponível</span><h3 style="margin-top:12px">${escapeHTML(t.name)}</h3><p class="muted">${escapeHTML(t.model || "")}</p></div>`).join("") || `<div class="card empty">Nenhum.</div>`}</div><div class="section-head"><h2>Implementos</h2></div><div class="grid three">${farm.implements.filter(x => x.status === "Disponível").map(i => `<div class="card"><span class="badge green">Disponível</span><h3 style="margin-top:12px">${escapeHTML(i.name)}</h3><p class="muted">${escapeHTML(i.category || "")}</p></div>`).join("") || `<div class="card empty">Nenhum.</div>`}</div>`;
}

$("#showLoginBtn").onclick = () => showAuthMode("login");
$("#showRegisterBtn").onclick = () => showAuthMode("register");
$("#loginForm").onsubmit = e => {
  e.preventDefault();
  if (!login($("#loginUser").value, $("#loginPassword").value)) toast("Usuário ou senha incorretos.");
};
$("#registerForm").onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  createPendingRegistration(Object.fromEntries(f.entries()));
};
$("#logoutBtn").onclick = logout;
$("#logoutTop").innerHTML = ico("logout");
$("#logoutTop").onclick = logout;
{
  const pc = $("#pageContent");
  let lastKey = "";
  new MutationObserver(() => {
    const key = currentPage + "|" + activeFarmId;
    if (key === lastKey) return;
    lastKey = key;
    [...pc.children].forEach((el, i) => el.style.setProperty("--i", i));
    pc.querySelectorAll(".grid").forEach(g => [...g.children].forEach((el, i) => el.style.setProperty("--i", i + 1)));
    pc.setAttribute("data-enter", "");
    clearTimeout(window.__enter);
    window.__enter = setTimeout(() => pc.removeAttribute("data-enter"), 1400);
  }).observe(pc, { childList: true });
}
showAuthMode("login");
restoreSession();
