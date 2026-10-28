const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const ROLE_NAMES = { ceo: "CEO", adm: "Administrador", contribuinte: "Contribuinte" };
const COFFEE_STOCK = ["Adubos", "Fertilizantes", "Defensivos", "Combustível", "Peças", "EPIs", "Sacaria", "Ferramentas", "Outros"];
const CATTLE_STOCK = ["Ração", "Sal mineral", "Medicamentos", "Vacinas", "Combustível", "Cercas", "Peças", "EPIs", "Ferramentas", "Outros"];
const COFFEE_FINANCE = ["Venda de café", "Adubos", "Fertilizantes", "Defensivos", "Combustível", "Manutenção", "Mão de obra", "Frete", "Impostos", "Serviços", "Outros"];
const CATTLE_FINANCE = ["Venda de gado", "Compra de gado", "Ração", "Sal mineral", "Medicamentos", "Vacinas", "Veterinário", "Combustível", "Manutenção", "Mão de obra", "Frete", "Impostos", "Serviços", "Outros"];
const STORAGE_KEY = "fazendaCloudCacheV21";
function cacheStorageKey(slug = "") { return `${STORAGE_KEY}:${slug || localStorage.getItem("lastGroupSlug") || "default"}`; }

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

function newFarm(name) {
  return {
    id: uid(),
    name,
    type: "mixed",
    photo: "",
    tractors: [],
    implements: [],
    stock: [],
    finances: [],
    notes: [],
    assignments: [],
    equipmentLogs: [],
    talhoes: [],
    banho: { products: [], orders: [] },
    cattle: { lots: [], weighings: [] }
  };
}

function defaultData() {
  return {
    version: 21,
    interfaceMode: "coffee",
    users: [],
    pendingRegistrations: [],
    farms: [
      newFarm("Fazenda Santa Clara"),
      newFarm("Fazenda Boa Vista"),
      newFarm("Fazenda Monte Verde"),
      newFarm("Fazenda São Bento")
    ],
    receipts: []
  };
}

function dataUserFunctionFallback(users, username) {
  const u = (users || []).find(x => x.username === username);
  return u?.function || "Campo";
}

function migrateData(raw) {
  const d = raw && typeof raw === "object" ? raw : defaultData();
  d.version = 21;
  d.interfaceMode = d.interfaceMode === "cattle" ? "cattle" : "coffee";
  d.users = Array.isArray(d.users) ? d.users : [];
  d.pendingRegistrations = Array.isArray(d.pendingRegistrations) ? d.pendingRegistrations : [];
  d.farms = Array.isArray(d.farms) && d.farms.length ? d.farms : defaultData().farms;
  d.receipts = Array.isArray(d.receipts) ? d.receipts : [];

  d.users.forEach(u => {
    u.id = u.id || uid();
    u.active = u.active !== false;
    u.function = u.function || "";
    u.pixKey = u.pixKey || "";
    if (u.role === "contribuinte") {
      u.function = ["Tratorista", "Campo"].includes(u.function) ? u.function : "Campo";
      const validFarm = d.farms.some(f => f.id === u.allowedFarmId);
      u.allowedFarmId = validFarm ? u.allowedFarmId : (d.farms[0]?.id || "");
      u.allowedActivity = ["coffee", "cattle", "both"].includes(u.allowedActivity) ? u.allowedActivity : "both";
    } else {
      if (u.role === "adm" && (!u.function || ["Tratorista", "Campo"].includes(u.function))) u.function = "Administração";
      if (u.role === "ceo" && !u.function) u.function = "CEO";
      u.allowedFarmId = "";
      u.allowedActivity = "both";
    }
  });

  d.pendingRegistrations.forEach(r => {
    r.id = r.id || uid();
    r.role = ["adm", "contribuinte"].includes(r.role) ? r.role : "contribuinte";
    if (r.role === "contribuinte") {
      r.function = ["Tratorista", "Campo"].includes(r.function) ? r.function : "Campo";
      r.allowedActivity = ["coffee", "cattle", "both"].includes(r.allowedActivity) ? r.allowedActivity : "both";
    } else {
      r.function = "Administração";
      r.allowedActivity = "both";
    }
    r.pixKey = r.pixKey || "";
  });

  d.farms.forEach(f => {
    f.id = f.id || uid();
    f.name = f.name || "Fazenda";
    const legacyActivity = f.type === "cattle" ? "cattle" : "coffee";
    f.type = "mixed";
    f.photo = f.photo || "";
    f.tractors = Array.isArray(f.tractors) ? f.tractors : [];
    f.implements = Array.isArray(f.implements) ? f.implements : [];
    f.stock = Array.isArray(f.stock) ? f.stock : [];
    f.finances = Array.isArray(f.finances) ? f.finances : [];
    f.notes = Array.isArray(f.notes) ? f.notes : [];
    f.assignments = Array.isArray(f.assignments) ? f.assignments : [];
    f.talhoes = Array.isArray(f.talhoes) ? f.talhoes : [];
    f.talhoes.forEach(t => { t.id = t.id || uid(); t.name = t.name || "Talhão"; });
    f.banho = f.banho && typeof f.banho === "object" ? f.banho : {};
    f.banho.products = Array.isArray(f.banho.products) ? f.banho.products : [];
    f.banho.orders = Array.isArray(f.banho.orders) ? f.banho.orders : [];
    f.banho.products.forEach(p => {
      p.id = p.id || uid(); p.name = p.name || "Produto"; p.unit = p.unit === "kg" ? "kg" : "L"; p.active = p.active !== false;
    });
    f.banho.orders.forEach(o => {
      o.id = o.id || uid(); o.title = o.title || "Banho";
      o.talhaoIds = Array.isArray(o.talhaoIds) ? o.talhaoIds : [];
      o.talhaoNames = Array.isArray(o.talhaoNames) ? o.talhaoNames : [];
      o.products = Array.isArray(o.products) ? o.products : [];
      o.status = ["draft", "released", "completed", "cancelled"].includes(o.status) ? o.status : "draft";
      o.notes = o.notes || "";
    });
    f.equipmentLogs = Array.isArray(f.equipmentLogs) ? f.equipmentLogs : f.assignments.map(a => ({
      id: uid(), date: a.date, loggedAt: a.loggedAt || `${a.date || todayISO()}T12:00:00`,
      user: a.user, userName: a.userName, activity: a.activity, tractorId: a.tractorId, tractorName: a.tractorName,
      implementId: a.implementId, implementName: a.implementName,
      talhaoIds: Array.isArray(a.talhaoIds) ? a.talhaoIds : [], talhaoNames: Array.isArray(a.talhaoNames) ? a.talhaoNames : []
    }));
    f.equipmentLogs.forEach(log => {
      log.talhaoIds = Array.isArray(log.talhaoIds) ? log.talhaoIds : [];
      log.talhaoNames = Array.isArray(log.talhaoNames) ? log.talhaoNames : [];
      log.userFunction = log.userFunction || dataUserFunctionFallback(d.users, log.user);
    });
    f.cattle = f.cattle || {};
    f.cattle.lots = Array.isArray(f.cattle.lots) ? f.cattle.lots : [];
    f.cattle.weighings = Array.isArray(f.cattle.weighings) ? f.cattle.weighings : [];
    f.stock.forEach(s => {
      s.id = s.id || uid(); s.category = s.category || "Outros"; s.unitCost = Number(s.unitCost || 0);
      s.activity = s.activity === "cattle" ? "cattle" : (s.activity === "coffee" ? "coffee" : legacyActivity);
    });
    f.finances.forEach(fin => { fin.activity = fin.activity === "cattle" ? "cattle" : (fin.activity === "coffee" ? "coffee" : legacyActivity); });
    f.notes.forEach(n => {
      n.fileData = n.fileData || ""; n.fileName = n.fileName || ""; n.fileType = n.fileType || "";
      n.activity = n.activity === "cattle" ? "cattle" : (n.activity === "coffee" ? "coffee" : legacyActivity);
    });
  });
  return d;
}

function findLegacyLocalData() {
  for (const key of ["fazendaDataV20", "fazendaDataV19", "fazendaDataV18", "fazendaDataV17", "fazendaDataV16", "fazendaDataV15"]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try { return { key, state: migrateData(JSON.parse(raw)) }; } catch (_) {}
  }
  return null;
}

function loadData() {
  const raw = localStorage.getItem(cacheStorageKey());
  if (raw) {
    try { return migrateData(JSON.parse(raw)); } catch (_) {}
  }
  return defaultData();
}

let data = loadData();
let currentUser = null;
let currentPage = "dashboard";
let activeFarmId = data.farms[0]?.id || "";
let quote = null;
let marketRefreshTimer = null;
let cloudToken = sessionStorage.getItem("gestaoRuralToken") || "";
let currentGroup = null;
let cloudSaveTimer = null;
let cloudSyncTimer = null;
let cloudSaving = false;
let cloudSaveAgain = false;

function modeStorageKey(user = currentUser) {
  const group = currentGroup?.slug || localStorage.getItem("lastGroupSlug") || "grupo";
  return `fazendaModo:${group}:${user?.username || "usuario"}`;
}

function safeLocalState(state = data) {
  const copy = JSON.parse(JSON.stringify(state));
  (copy.users || []).forEach(u => { delete u.password; delete u.passwordHash; });
  (copy.pendingRegistrations || []).forEach(r => { delete r.password; delete r.passwordHash; });
  return copy;
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (cloudToken) headers.Authorization = `Bearer ${cloudToken}`;
  const response = await fetch(path, { ...options, headers });
  let payload = null;
  try { payload = await response.json(); } catch (_) {}
  if (!response.ok) {
    const error = new Error(payload?.error || `Erro ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function selectedType() {
  if (currentUser?.role === "contribuinte") {
    const permission = ["coffee", "cattle", "both"].includes(currentUser.allowedActivity) ? currentUser.allowedActivity : "both";
    if (permission === "coffee" || permission === "cattle") return permission;
  }
  const personalMode = localStorage.getItem(modeStorageKey());
  if (personalMode === "coffee" || personalMode === "cattle") return personalMode;
  return data.interfaceMode === "cattle" ? "cattle" : "coffee";
}

function switchInterfaceMode() {
  if (!currentUser) return;
  const contributorCanSwitch = currentUser.role === "contribuinte" && currentUser.allowedActivity === "both";
  if (!["ceo", "adm"].includes(currentUser.role) && !contributorCanSwitch) return;

  const nextMode = selectedType() === "coffee" ? "cattle" : "coffee";
  localStorage.setItem(modeStorageKey(), nextMode);
  if (currentUser.role === "ceo" && isGeneralView()) activeFarmId = nextMode === "coffee" ? "general-coffee" : "general-cattle";

  currentPage = currentUser.role === "contribuinte" ? (nextMode === "cattle" ? "gado-campo" : "meu-dia") : "dashboard";
  saveData();
  renderFarmSelector();
  renderNav();
  renderPage();
  if (selectedType() === "coffee" && currentUser.role !== "contribuinte") refreshQuote(); else { quote = null; $("#quoteMini").classList.add("hidden"); }
  toast(`Interface alterada para ${selectedType() === "coffee" ? "Café" : "Gado"}.`);
}


function activeFarmStorageKey(user = currentUser) {
  return user?.username ? `fazendaAtiva:${user.username}` : "fazendaAtiva";
}

function preferredFarmForUser(user) {
  if (!user) return data.farms[0]?.id || "";
  if (user.role === "contribuinte") {
    const allowed = data.farms.find(f => f.id === user.allowedFarmId);
    return allowed?.id || data.farms[0]?.id || "";
  }
  const stored = localStorage.getItem(activeFarmStorageKey(user));
  const expectedGeneral = selectedType() === "cattle" ? "general-cattle" : "general-coffee";
  if (user.role === "ceo" && stored === expectedGeneral) return stored;
  if (data.farms.some(f => f.id === stored)) return stored;
  // Sem seleção salva, o CEO entra na primeira fazenda para ver os formulários de cadastro.
  if (user.role === "ceo") return data.farms[0]?.id || expectedGeneral;
  return data.farms[0]?.id || "";
}


function saveData() {
  localStorage.setItem(cacheStorageKey(currentGroup?.slug || ""), JSON.stringify(safeLocalState(data)));
  if (currentUser) localStorage.setItem(activeFarmStorageKey(currentUser), activeFarmId);
  if (!currentUser || !cloudToken) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(pushStateToServer, 220);
}

async function pushStateToServer() {
  if (!currentUser || !cloudToken) return;
  if (cloudSaving) { cloudSaveAgain = true; return; }
  cloudSaving = true;
  try {
    await api("/api/state", { method: "PUT", body: JSON.stringify({ state: data }) });
  } catch (error) {
    if (error.status === 401 || error.status === 403) return logout(true);
    console.error("Falha ao sincronizar:", error);
    toast("Sem conexão com o servidor. Alterações mantidas neste aparelho por enquanto.");
  } finally {
    cloudSaving = false;
    if (cloudSaveAgain) { cloudSaveAgain = false; pushStateToServer(); }
  }
}

async function pullStateFromServer({ rerender = true } = {}) {
  if (!cloudToken) return false;
  try {
    const payload = await api("/api/state");
    data = migrateData(payload.state);
    currentGroup = payload.group;
    const previousUsername = currentUser?.username;
    currentUser = data.users.find(u => u.id === payload.userId) || data.users.find(u => u.username === previousUsername) || null;
    localStorage.setItem(cacheStorageKey(currentGroup?.slug || ""), JSON.stringify(safeLocalState(data)));
    updateGroupBrand();
    if (!currentUser) throw Object.assign(new Error("Usuário não encontrado"), { status: 401 });
    if (rerender && !$("#appView").classList.contains("hidden")) {
      if (currentUser.role === "contribuinte") activeFarmId = preferredFarmForUser(currentUser);
      else if (!isGeneralView() && !data.farms.some(f => f.id === activeFarmId)) activeFarmId = preferredFarmForUser(currentUser);
      renderFarmSelector(); renderNav(); renderPage();
    }
    return payload;
  } catch (error) {
    if (error.status === 401 || error.status === 403) logout(true);
    return false;
  }
}

function startCloudSync() {
  clearInterval(cloudSyncTimer);
  cloudSyncTimer = setInterval(() => pullStateFromServer({ rerender: true }), 12000);
}

function updateGroupBrand() {
  const name = currentGroup?.name || "Gestão Rural";
  if ($("#groupBrandName")) $("#groupBrandName").textContent = name;
  if ($("#loginBrandPill") && currentGroup?.name) $("#loginBrandPill").textContent = currentGroup.name;
  document.title = currentGroup?.name ? `${currentGroup.name} • Gestão Rural` : "Gestão Rural • Acesso";
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

function activeFarm() {
  return data.farms.find(f => f.id === activeFarmId) || data.farms[0] || null;
}

function farmsInContext() {
  return isGeneralView() ? data.farms : (activeFarm() ? [activeFarm()] : []);
}

function contextName() {
  if (activeFarmId === "general-coffee") return "Geral • Café";
  if (activeFarmId === "general-cattle") return "Geral • Gado";
  return activeFarm()?.name || "Fazenda";
}

function farmTypeLabel() {
  return selectedType() === "cattle" ? "Gado" : "Café";
}

function stockCategories() {
  return selectedType() === "cattle" ? CATTLE_STOCK : COFFEE_STOCK;
}

function financeCategories() {
  return selectedType() === "cattle" ? CATTLE_FINANCE : COFFEE_FINANCE;
}

function financialTotals(farm) {
  const finances = (farm?.finances || []).filter(x => (x.activity || "coffee") === selectedType());
  const income = finances.filter(x => x.type === "entrada").reduce((a, b) => a + Number(b.value || 0), 0);
  const expense = finances.filter(x => x.type === "saida").reduce((a, b) => a + Number(b.value || 0), 0);
  return { income, expense, profit: income - expense };
}

function contextFinances() {
  return farmsInContext().flatMap(f => (f.finances || []).filter(fin => (fin.activity || "coffee") === selectedType()).map(fin => ({ ...fin, farmName: f.name, farmId: f.id, farmType: selectedType() })));
}

function contextNotes() {
  return farmsInContext().flatMap(f => (f.notes || []).filter(note => (note.activity || "coffee") === selectedType()).map(note => ({ ...note, farmName: f.name, farmId: f.id, farmType: selectedType() })));
}

function contextStock() {
  return farmsInContext().flatMap(f => (f.stock || []).filter(item => (item.activity || "coffee") === selectedType()).map(item => ({ ...item, farmName: f.name, farmId: f.id, farmType: selectedType() })));
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

async function login(groupCode, username, password) {
  try {
    const payload = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ groupCode, username, password })
    });
    cloudToken = payload.token;
    currentGroup = payload.group;
    sessionStorage.setItem("gestaoRuralToken", cloudToken);
    localStorage.setItem("lastGroupCode", currentGroup.code || groupCode);
    localStorage.setItem("lastGroupSlug", currentGroup.slug || "");
    if ($("#loginGroup")) $("#loginGroup").value = currentGroup.code || groupCode;
    if ($("#registerGroup")) $("#registerGroup").value = currentGroup.code || groupCode;

    let statePayload = await pullStateFromServer({ rerender: false });
    if (!statePayload) return false;

    const legacy = findLegacyLocalData();
    if (currentUser?.role === "ceo" && currentGroup?.cloudInitialized === false && legacy?.state?.users?.length) {
      const shouldImport = confirm("Encontramos dados da v20 neste navegador. Deseja importar esses dados para a nuvem deste Grupo agora?");
      if (shouldImport) {
        try {
          const imported = await api("/api/state/import-local", { method: "POST", body: JSON.stringify({ state: legacy.state }) });
          data = migrateData(imported.state);
          currentGroup = { ...currentGroup, ...imported.group, cloudInitialized: true };
          currentUser = data.users.find(u => String(u.username || "").toLowerCase() === String(username || "").toLowerCase()) || data.users.find(u => u.role === "ceo");
          localStorage.setItem(cacheStorageKey(currentGroup?.slug || ""), JSON.stringify(safeLocalState(data)));
          toast("Dados da v20 importados para a nuvem.");
        } catch (error) {
          console.error(error);
          toast(error.message || "Não foi possível importar os dados locais.");
        }
      }
    }

    activeFarmId = preferredFarmForUser(currentUser);
    openApp();
    startCloudSync();
    return true;
  } catch (error) {
    console.error(error);
    toast(error.message || "Código do Grupo, usuário ou senha incorretos.");
    return false;
  }
}

async function restoreSession() {
  cloudToken = sessionStorage.getItem("gestaoRuralToken") || "";
  const urlGroup = new URLSearchParams(location.search).get("grupo");
  const lastGroup = urlGroup || localStorage.getItem("lastGroupCode") || "1001";
  if ($("#loginGroup")) $("#loginGroup").value = lastGroup;
  if ($("#registerGroup")) $("#registerGroup").value = lastGroup;
  if (!cloudToken) return;
  const payload = await pullStateFromServer({ rerender: false });
  if (payload && currentUser) {
    activeFarmId = preferredFarmForUser(currentUser);
    openApp();
    startCloudSync();
  }
}

async function logout(silent = false) {
  const tokenBefore = cloudToken;
  cloudToken = "";
  clearInterval(cloudSyncTimer);
  clearTimeout(cloudSaveTimer);
  sessionStorage.removeItem("gestaoRuralToken");
  currentUser = null;
  currentGroup = null;
  $("#appView").classList.add("hidden");
  $("#loginView").classList.remove("hidden");
  showAuthMode("login");
  $("#loginPassword").value = "";
  updateGroupBrand();
  if (tokenBefore && !silent) {
    try { await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${tokenBefore}` } }); } catch (_) {}
  }
}

let passwordResetContext = null;
function showAuthMode(mode) {
  $(".auth-switch").classList.remove("hidden");
  $(".auth-switch").dataset.mode = mode;
  const loginVisible = mode === "login";
  $("#loginForm").classList.toggle("hidden", !loginVisible);
  $("#registerForm").classList.toggle("hidden", loginVisible);
  $("#forgotForm").classList.add("hidden");
  $("#resetForm").classList.add("hidden");
  $("#showLoginBtn").classList.toggle("active", loginVisible);
  $("#showRegisterBtn").classList.toggle("active", !loginVisible);
  const urlGroup = new URLSearchParams(location.search).get("grupo");
  const lastGroup = urlGroup || localStorage.getItem("lastGroupCode") || "1001";
  if ($("#loginGroup") && !$("#loginGroup").value) $("#loginGroup").value = lastGroup;
  if ($("#registerGroup") && !$("#registerGroup").value) $("#registerGroup").value = lastGroup;
}
function showPasswordRecovery(stage = "request") {
  $(".auth-switch").classList.add("hidden");
  $("#loginForm").classList.add("hidden");
  $("#registerForm").classList.add("hidden");
  $("#forgotForm").classList.toggle("hidden", stage !== "request");
  $("#resetForm").classList.toggle("hidden", stage !== "confirm");
  if (stage === "request") {
    $("#forgotGroup").value = $("#loginGroup").value || localStorage.getItem("lastGroupCode") || "1001";
    $("#forgotUser").value = $("#loginUser").value || "";
  }
}

async function createPendingRegistration(values) {
  try {
    const groupCode = String(values.groupCode || $("#registerGroup")?.value || "").replace(/\D/g, "").trim();
    await api("/api/auth/register-request", { method: "POST", body: JSON.stringify({ ...values, groupCode }) });
    localStorage.setItem("lastGroupCode", groupCode);
    toast("Solicitação enviada para aprovação do CEO.");
    $("#registerForm").reset();
    $("#loginGroup").value = groupCode;
    $("#registerGroup").value = groupCode;
    showAuthMode("login");
    return true;
  } catch (error) {
    toast(error.message || "Não foi possível enviar a solicitação.");
    return false;
  }
}

async function createUser(values, after) {
  try {
    const payload = await api("/api/users", { method: "POST", body: JSON.stringify(values) });
    data = migrateData(payload.state);
    currentUser = data.users.find(u => u.id === currentUser?.id) || currentUser;
    localStorage.setItem(cacheStorageKey(currentGroup?.slug || ""), JSON.stringify(safeLocalState(data)));
    toast("Usuário criado com sucesso.");
    if (after) after();
    return true;
  } catch (error) {
    toast(error.message || "Não foi possível criar o usuário.");
    return false;
  }
}

async function approveRegistration(id, allowedFarmId = "", allowedActivity = "both") {
  try {
    const payload = await api(`/api/registrations/${encodeURIComponent(id)}/approve`, {
      method: "POST",
      body: JSON.stringify({ allowedFarmId, allowedActivity })
    });
    data = migrateData(payload.state);
    currentUser = data.users.find(u => u.id === currentUser?.id) || currentUser;
    localStorage.setItem(cacheStorageKey(currentGroup?.slug || ""), JSON.stringify(safeLocalState(data)));
    toast("Solicitação aprovada.");
    renderUsers();
  } catch (error) { toast(error.message || "Não foi possível aprovar."); }
}

async function rejectRegistration(id) {
  try {
    const payload = await api(`/api/registrations/${encodeURIComponent(id)}/reject`, { method: "POST", body: "{}" });
    data = migrateData(payload.state);
    currentUser = data.users.find(u => u.id === currentUser?.id) || currentUser;
    localStorage.setItem(cacheStorageKey(currentGroup?.slug || ""), JSON.stringify(safeLocalState(data)));
    toast("Solicitação recusada.");
    renderUsers();
  } catch (error) { toast(error.message || "Não foi possível recusar."); }
}

function renderFarmSelector() {
  const select = $("#farmSelect");
  if (!select || !currentUser) return;

  let visibleFarms = data.farms;
  if (currentUser.role === "contribuinte") {
    const allowed = data.farms.find(f => f.id === currentUser.allowedFarmId);
    visibleFarms = allowed ? [allowed] : [];
    if (allowed) activeFarmId = allowed.id;
  } else if (!isGeneralView() && !data.farms.some(f => f.id === activeFarmId)) {
    activeFarmId = preferredFarmForUser(currentUser);
  }

  const options = [];
  if (currentUser.role === "ceo") {
    const generalId = selectedType() === "cattle" ? "general-cattle" : "general-coffee";
    const generalLabel = selectedType() === "cattle" ? "Geral • Gado" : "Geral • Café";
    options.push(`<option value="${generalId}">${generalLabel}</option>`);
  }
  options.push(...visibleFarms.map(f => `<option value="${f.id}">${escapeHTML(f.name)} • ${farmTypeLabel()}</option>`));

  if (!options.length) {
    select.innerHTML = `<option value="">Nenhuma fazenda liberada</option>`;
    select.disabled = true;
    return;
  }

  const expectedGeneral = selectedType() === "cattle" ? "general-cattle" : "general-coffee";
  if (isGeneralView() && activeFarmId !== expectedGeneral) activeFarmId = expectedGeneral;

  select.innerHTML = options.join("");
  select.value = activeFarmId;
  if (!select.value) {
    activeFarmId = currentUser.role === "ceo" ? expectedGeneral : (visibleFarms[0]?.id || data.farms[0]?.id || "");
    select.value = activeFarmId;
  }

  select.disabled = currentUser.role === "contribuinte";
  select.title = currentUser.role === "contribuinte" ? "Fazenda definida pelo CEO no perfil" : "Selecionar fazenda";
  if (currentUser) localStorage.setItem(activeFarmStorageKey(currentUser), activeFarmId);

  select.onchange = () => {
    activeFarmId = select.value;
    localStorage.setItem(activeFarmStorageKey(currentUser), activeFarmId);
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
      ["mercado", "chart", "Mercado"],
      ...(cattle ? [["gado", "cattle", isGeneralView() ? "Gado geral" : "Gado"]] : [["equipamentos", "tractor", isGeneralView() ? "Equipamentos gerais" : "Equipamentos"], ["talhoes", "hash", isGeneralView() ? "Talhões gerais" : "Talhões"], ["banho", "receipt", isGeneralView() ? "Banhos gerais" : "Banho"]]),
      ["estoque", "box", isGeneralView() ? "Estoque geral" : "Estoque"],
      ["financeiro", "chart", isGeneralView() ? "Balanço geral" : "Balanço financeiro"],
      ["notas", "receipt", isGeneralView() ? "Notas gerais" : "Notas fiscais"],
      ["pagamentos", "wallet", "Pagamentos"],
      ["fazendas", "home", "Fazendas"],
      ["usuarios", "users", "Usuários"],
      ["log-equipamentos", "receipt", "Log equipamentos"],
      ["perfil", "users", "Perfil"]
    ];
  }
  if (currentUser.role === "adm") {
    return [
      ["dashboard", "grid", "Visão geral"],
      ["mercado", "chart", "Mercado"],
      ...(cattle ? [["gado", "cattle", "Gado"]] : [["equipamentos", "tractor", "Equipamentos"], ["banho", "receipt", "Banho"]]),
      ["estoque", "box", "Estoque"],
      ["lancamentos", "swap", "Lançar entradas/saídas"],
      ["notas", "receipt", "Notas fiscais"],
      ["perfil", "users", "Perfil"]
    ];
  }
  if (selectedType() === "cattle") {
    return [["gado-campo", "cattle", "Gado"], ["meus-comprovantes", "receipt", "Meus comprovantes"], ["perfil", "users", "Perfil"]];
  }
  const coffeeItems = [["meu-dia", "check", "Meu trabalho hoje"]];
  if (currentUser.function === "Tratorista") coffeeItems.push(["banho", "receipt", "Banhos liberados"]);
  coffeeItems.push(["equipamentos-campo", "tractor", "Equipamentos disponíveis"], ["meus-comprovantes", "receipt", "Meus comprovantes"], ["perfil", "users", "Perfil"]);
  return coffeeItems;
}

function renderNav() {
  const items = navItems();
  const menu = items.map(([id, icon, label]) => `<button class="nav-btn ${currentPage === id ? "active" : ""}" data-page="${id}"><span class="nav-label">${label}</span></button>`).join("");
  const canSwitchMode = ["ceo", "adm"].includes(currentUser.role) || (currentUser.role === "contribuinte" && currentUser.allowedActivity === "both");
  const modeSwitch = canSwitchMode
    ? `<button class="nav-btn mode-switch-btn" id="modeSwitchBtn" type="button"><span class="nav-label">${selectedType() === "coffee" ? "Mudar para Gado" : "Mudar para Café"}</span></button>`
    : "";
  $("#navMenu").innerHTML = menu + modeSwitch;
  $$("#navMenu .nav-btn[data-page]").forEach(btn => btn.onclick = () => { currentPage = btn.dataset.page; renderNav(); renderPage(); });
  const modeBtn = $("#modeSwitchBtn");
  if (modeBtn) modeBtn.onclick = switchInterfaceMode;
}

function setHeader(eyebrow, title) {
  $("#pageEyebrow").textContent = `${eyebrow} • ${contextName().toUpperCase()} • ${(selectedType() === "cattle" ? "GADO" : "CAFÉ")}`;
  $("#pageTitle").textContent = title;
}

function openApp() {
  updateGroupBrand();
  $("#loginView").classList.add("hidden");
  $("#appView").classList.remove("hidden");
  $("#userName").textContent = currentUser.name;
  $("#userRole").textContent = ROLE_NAMES[currentUser.role] || currentUser.role;
  $("#userAvatar").textContent = currentUser.name?.[0]?.toUpperCase() || "U";
  activeFarmId = preferredFarmForUser(currentUser);
  if (currentUser.role === "contribuinte") {
    currentUser.allowedActivity = ["coffee", "cattle", "both"].includes(currentUser.allowedActivity) ? currentUser.allowedActivity : "both";
    const allowed = data.farms.find(f => f.id === currentUser.allowedFarmId);
    if (!allowed && data.farms[0]) {
      currentUser.allowedFarmId = data.farms[0].id;
      activeFarmId = data.farms[0].id;
      saveData();
    }
    if (currentUser.allowedActivity === "coffee" || currentUser.allowedActivity === "cattle") {
      localStorage.setItem(modeStorageKey(), currentUser.allowedActivity);
    }
  }
  currentPage = currentUser.role === "contribuinte" ? (selectedType() === "cattle" ? "gado-campo" : "meu-dia") : "dashboard";
  renderFarmSelector();
  renderNav();
  renderPage();
  if (selectedType() === "coffee" && currentUser.role !== "contribuinte") refreshQuote(); else $("#quoteMini").classList.add("hidden");
}

function renderPage() {
  if (currentPage !== "mercado" && marketRefreshTimer) { clearInterval(marketRefreshTimer); marketRefreshTimer = null; }
  renderFarmSelector();
  const allowed = navItems().map(n => n[0]);
  const financeDetailPages = currentUser?.role === "ceo" ? ["finance-entradas", "finance-gastos"] : [];
  if (![...allowed, ...financeDetailPages].includes(currentPage)) currentPage = allowed[0];
  const pages = {
    dashboard: renderDashboard,
    mercado: renderMarket,
    equipamentos: renderEquipmentAdmin,
    talhoes: renderTalhoes,
    banho: renderBanho,
    estoque: renderStock,
    financeiro: renderFinanceCEO,
    "finance-entradas": () => renderFinanceFiltered("entrada"),
    "finance-gastos": () => renderFinanceFiltered("saida"),
    lancamentos: renderFinanceAdmin,
    notas: renderNotes,
    pagamentos: renderPayments,
    fazendas: renderFarms,
    usuarios: renderUsers,
    "log-equipamentos": renderEquipmentLog,
    perfil: renderProfile,
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


function marketNumber(v, digits = 2) {
  return Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function marketVariation(item) {
  if (!item || typeof item.changePct !== "number") return `<span class="market-var neutral">—</span>`;
  const cls = item.changePct > 0 ? "up" : (item.changePct < 0 ? "down" : "neutral");
  const sign = item.changePct > 0 ? "+" : "";
  return `<span class="market-var ${cls}">${sign}${marketNumber(item.changePct, 2)}%</span>`;
}

function marketTime(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("pt-BR"); } catch (_) { return "—"; }
}

async function loadMarketPanel() {
  const host = $("#marketContent");
  if (!host) return;
  try {
    const r = await fetch("/api/mercado", { cache: "no-store" });
    if (!r.ok) throw new Error("Falha ao carregar mercado");
    const m = await r.json();
    const front = m.coffee?.front;
    const local = m.cattle?.localMG;
    const live = m.cattle?.liveCattle;
    const feeder = m.cattle?.feederCattle;
    const contracts = m.coffee?.contracts || [];

    const tickerItems = [
      front?.available ? `Coffee C ${marketNumber(front.price)} ¢/lb` : null,
      front?.brlPerSaca ? `Saca estimada ${money(front.brlPerSaca)}` : null,
      local?.value ? `Boi MG ${money(local.value)}/@` : null,
      live?.brlPerArroba ? `Live Cattle EUA ≈ ${money(live.brlPerArroba)}/@` : null,
      m.usdBrl?.price ? `USD/BRL ${marketNumber(m.usdBrl.price, 4)}` : null
    ].filter(Boolean);

    host.innerHTML = `
      <div class="market-livebar">
        <span class="market-live-dot"></span>
        <strong>Atualização automática</strong>
        <span>•</span>
        <span>última consulta ${marketTime(m.updatedAt)}</span>
        <button class="btn small right" id="marketRefreshNow">Atualizar agora</button>
      </div>

      <div class="market-ticker"><div class="market-ticker-track">${[...tickerItems, ...tickerItems].map(x => `<span>${escapeHTML(x)}</span>`).join("")}</div></div>

      <div class="section-head"><div><h2>Café • ICE Coffee C</h2><p>Contratos listados e estimativa em reais por saca de 60 kg.</p></div><span class="badge green">ICE</span></div>
      <div class="grid three market-main-grid">
        <div class="card market-highlight">
          <span class="eyebrow dark">COFFEE C • CONTÍNUO</span>
          <div class="market-price">${front?.available ? `${marketNumber(front.price)} <small>¢/lb</small>` : "Indisponível"}</div>
          <div class="inline">${marketVariation(front)}<span class="subtle">${front?.timestamp ? marketTime(front.timestamp) : ""}</span></div>
          <div class="market-conversion"><span>Estimativa por saca</span><strong>${front?.brlPerSaca ? money(front.brlPerSaca) : "—"}</strong></div>
        </div>
        <div class="card">
          <span class="eyebrow dark">DÓLAR</span>
          <div class="market-price">${m.usdBrl?.price ? marketNumber(m.usdBrl.price, 4) : "—"}</div>
          <div class="inline">${marketVariation(m.usdBrl)}<span class="subtle">USD/BRL usado nas conversões</span></div>
        </div>
        <div class="card soft">
          <span class="eyebrow dark">REFERÊNCIA</span>
          <h2 style="font-size:22px;margin-top:10px">Coffee C</h2>
          <p class="muted">Benchmark internacional do café arábica. A estimativa em R$/saca é apenas conversão matemática da bolsa e do câmbio.</p>
        </div>
      </div>

      <div class="section-head"><div><h2>Contratos Coffee C</h2><p>Vencimentos atualmente listados no painel.</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Vencimento</th><th>Código</th><th>Preço</th><th>Variação</th><th>Estimativa R$/saca</th><th>Atualização</th></tr></thead><tbody>
        ${contracts.map(c => `<tr><td><b>${escapeHTML(c.label || c.ice || "—")}</b></td><td>${escapeHTML(c.symbol || "—")}</td><td>${c.available ? `${marketNumber(c.price)} ¢/lb` : "Indisponível"}</td><td>${marketVariation(c)}</td><td>${c.brlPerSaca ? `<b>${money(c.brlPerSaca)}</b>` : "—"}</td><td>${c.timestamp ? marketTime(c.timestamp) : "—"}</td></tr>`).join("")}
      </tbody></table></div>

      <div class="section-head"><div><h2>Gado • arroba e bolsa</h2><p>Referência local e futuros internacionais de gado.</p></div><span class="badge gold">@</span></div>
      <div class="grid three">
        <div class="card market-highlight cattle">
          <span class="eyebrow dark">BOI GORDO • MG</span>
          <div class="market-price">${local?.value ? `${money(local.value)}<small>/@</small>` : "Indisponível"}</div>
          <p class="subtle">Última referência local disponível${local?.date ? ` • ${dateBR(local.date)}` : ""}</p>
          <div class="market-source">Fonte reportada: ${escapeHTML(local?.source || "—")}</div>
        </div>
        <div class="card">
          <span class="eyebrow dark">LIVE CATTLE • EUA</span>
          <div class="market-price">${live?.price ? `${marketNumber(live.price)} <small>¢/lb</small>` : "—"}</div>
          <div class="inline">${marketVariation(live)}</div>
          <div class="market-conversion"><span>Conversão indicativa</span><strong>${live?.brlPerArroba ? `${money(live.brlPerArroba)}/@` : "—"}</strong></div>
        </div>
        <div class="card">
          <span class="eyebrow dark">FEEDER CATTLE • EUA</span>
          <div class="market-price">${feeder?.price ? `${marketNumber(feeder.price)} <small>¢/lb</small>` : "—"}</div>
          <div class="inline">${marketVariation(feeder)}</div>
          <div class="market-conversion"><span>Conversão indicativa</span><strong>${feeder?.brlPerArroba ? `${money(feeder.brlPerArroba)}/@` : "—"}</strong></div>
        </div>
      </div>

      <div class="card market-warning">
        <b>Importante sobre “ao vivo”</b>
        <p>${escapeHTML(m.coffee?.note || "")}</p>
        <p>${escapeHTML(m.cattle?.note || "")}</p>
        <p style="margin-bottom:0">Para cotação realmente em tempo real do BGI/B3, é necessário contratar um feed de mercado/licença. Este painel atualiza automaticamente as fontes públicas disponíveis.</p>
      </div>`;

    const btn = $("#marketRefreshNow");
    if (btn) btn.onclick = loadMarketPanel;
  } catch (err) {
    host.innerHTML = `<div class="card empty"><b>Não foi possível carregar as cotações agora.</b><p class="muted">Tente atualizar novamente em alguns instantes.</p><button class="btn" id="marketRetry">Tentar novamente</button></div>`;
    const retry = $("#marketRetry"); if (retry) retry.onclick = loadMarketPanel;
  }
}

function renderMarket() {
  setHeader("MERCADO", "Bolsa de café e gado");
  $("#pageContent").innerHTML = `
    <div class="hero-surface market-hero"><div><span class="eyebrow">MERCADO</span><h2>Café, gado e câmbio em um só lugar.</h2><p>Cotações com atualização automática, contratos Coffee C e referências de arroba.</p></div><div class="hero-badges"><span class="badge green">Café</span><span class="badge gold">Gado</span></div></div>
    <div id="marketContent"><div class="card empty"><span class="market-loader"></span><p>Carregando mercado...</p></div></div>`;
  loadMarketPanel();
  if (marketRefreshTimer) clearInterval(marketRefreshTimer);
  marketRefreshTimer = setInterval(() => { if (currentPage === "mercado") loadMarketPanel(); }, 30_000);
}

function contributorQuickForm() {
  if (currentUser.role !== "ceo") return "";
  return `<div class="section-head"><div><h2>Cadastro rápido de contribuinte</h2><p>Crie o colaborador e o login direto da página inicial.</p></div></div>
  <form id="quickContributorForm" class="form-card accent-card"><div class="form-grid">
    <label>Nome<input name="name" required placeholder="Nome completo"></label>
    <label>Função<select name="function" required><option value="">Selecione</option><option value="Tratorista">Tratorista</option><option value="Campo">Campo</option></select></label>
    <label>Chave PIX (opcional)<input name="pixKey" placeholder="CPF, telefone, e-mail ou chave aleatória"></label>
    <label>Fazenda permitida<select name="allowedFarmId" required>${data.farms.map(f => `<option value="${f.id}">${escapeHTML(f.name)} • Café + Gado</option>`).join("")}</select></label>
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
      allowedFarmId: f.get("allowedFarmId"),
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

function renderTalhoes() {
  if (currentUser.role !== "ceo") return;
  if (selectedType() !== "coffee") {
    setHeader("TALHÕES", "Talhões");
    $("#pageContent").innerHTML = `<div class="card soft"><h2>Talhões disponíveis para café</h2><p class="muted">Selecione uma fazenda de café para cadastrar os talhões.</p></div>`;
    return;
  }
  setHeader("TALHÕES", isGeneralView() ? "Talhões gerais" : "Talhões");
  if (isGeneralView()) {
    const all = data.farms.flatMap(f => (f.talhoes || []).map(t => ({ ...t, farmName: f.name })));
    $("#pageContent").innerHTML = `<div class="card soft"><span class="eyebrow dark">VISÃO GERAL</span><h2>${all.length} talhões</h2><p class="muted">Para criar ou apagar talhões, escolha uma fazenda específica de café.</p></div><div class="section-head"><h2>Talhões cadastrados</h2></div>${all.length ? `<div class="table-wrap"><table><thead><tr><th>Fazenda</th><th>Talhão</th></tr></thead><tbody>${all.map(t => `<tr><td>${escapeHTML(t.farmName)}</td><td><b>${escapeHTML(t.name)}</b></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum talhão cadastrado.</div>`}`;
    return;
  }
  const farm = activeFarm();
  farm.talhoes = Array.isArray(farm.talhoes) ? farm.talhoes : [];
  $("#pageContent").innerHTML = `<div class="grid two"><form id="plotForm" class="form-card"><div class="inline"><h3>Novo talhão</h3><span class="badge gold right">Somente CEO</span></div><label>Nome do talhão<input name="name" required placeholder="Ex.: Talhão 01, Baixada, Chapadão"></label><div class="form-actions"><button class="btn primary">Adicionar talhão</button></div></form><div class="card soft"><span class="eyebrow dark">${escapeHTML(farm.name)}</span><h2>${farm.talhoes.length} talhões</h2><p class="muted">Os contribuidores poderão selecionar um ou vários talhões no trabalho do dia.</p></div></div><div class="section-head"><h2>Talhões cadastrados</h2></div><div class="grid three">${farm.talhoes.map(t => `<div class="card"><div class="inline"><h3>${escapeHTML(t.name)}</h3><button class="btn danger small plot-del right" data-id="${t.id}">Excluir</button></div></div>`).join("") || `<div class="card empty">Nenhum talhão cadastrado.</div>`}</div>`;
  $("#plotForm").onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); const name = String(f.get("name") || "").trim(); if (!name) return; if (farm.talhoes.some(t => t.name.toLowerCase() === name.toLowerCase())) return toast("Esse talhão já existe."); farm.talhoes.push({ id: uid(), name }); saveData(); renderTalhoes(); toast("Talhão adicionado."); };
  $$(".plot-del").forEach(btn => btn.onclick = () => { const plot = farm.talhoes.find(t => t.id === btn.dataset.id); if (!plot) return; if (!confirm(`Excluir ${plot.name}?`)) return; farm.talhoes = farm.talhoes.filter(t => t.id !== plot.id); saveData(); renderTalhoes(); toast("Talhão excluído."); });
}


function banhoStatusLabel(status) {
  return ({ draft: "Rascunho", released: "Liberado", completed: "Concluído", cancelled: "Cancelado" })[status] || status;
}

function banhoStatusClass(status) {
  if (status === "completed") return "green";
  if (status === "released") return "gold";
  if (status === "cancelled") return "red";
  return "";
}

function renderBanho() {
  if (selectedType() !== "coffee") {
    currentPage = currentUser.role === "contribuinte" ? "gado-campo" : "dashboard";
    renderNav();
    return renderPage();
  }

  if (currentUser.role === "contribuinte" && currentUser.function !== "Tratorista") {
    currentPage = "meu-dia";
    renderNav();
    return renderContributorDay();
  }

  setHeader("APLICAÇÃO", isGeneralView() ? "Banhos gerais" : (currentUser.role === "contribuinte" ? "Banhos liberados" : "Banho"));

  if (isGeneralView()) {
    const orders = data.farms.flatMap(f => (f.banho?.orders || []).map(o => ({ ...o, farmName: f.name })));
    $("#pageContent").innerHTML = `
      <div class="card soft"><span class="eyebrow dark">VISÃO GERAL DE CAFÉ</span><h2>${orders.length} ordens de banho</h2><p class="muted">Consulta consolidada. Para criar produtos ou liberar um banho, escolha uma fazenda específica.</p></div>
      <div class="section-head"><h2>Ordens</h2></div>
      ${orders.length ? `<div class="table-wrap"><table><thead><tr><th>Fazenda</th><th>Ordem</th><th>Talhões</th><th>Produtos</th><th>Status</th><th>Criado por</th></tr></thead><tbody>${[...orders].reverse().map(o => `<tr><td>${escapeHTML(o.farmName)}</td><td><b>${escapeHTML(o.title || "Banho")}</b></td><td>${escapeHTML((o.talhaoNames || []).join(", ") || "—")}</td><td>${escapeHTML((o.products || []).map(p => `${p.name}: ${Number(p.quantity).toLocaleString("pt-BR")} ${p.unit}`).join(" • ") || "—")}</td><td><span class="badge ${banhoStatusClass(o.status)}">${banhoStatusLabel(o.status)}</span></td><td>${escapeHTML(o.createdByName || o.createdBy || "—")}</td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma ordem de banho cadastrada.</div>`}`;
    return;
  }

  const farm = activeFarm();
  farm.banho = farm.banho || { products: [], orders: [] };
  farm.banho.products = Array.isArray(farm.banho.products) ? farm.banho.products : [];
  farm.banho.orders = Array.isArray(farm.banho.orders) ? farm.banho.orders : [];

  if (currentUser.role === "contribuinte") {
    const released = farm.banho.orders.filter(o => o.status === "released");
    const completedByMe = farm.banho.orders.filter(o => o.status === "completed" && o.completedBy === currentUser.username).slice().reverse().slice(0, 20);
    $("#pageContent").innerHTML = `
      <div class="assignment-hero"><div><span class="eyebrow">ORDENS LIBERADAS • TRATORISTA</span><h2>${released.length ? `${released.length} banho(s) aguardando` : "Nenhum banho liberado"}</h2><p>Confira os talhões, produtos e quantidades antes de iniciar a aplicação.</p></div><div class="assignment-status"><strong>${dateBR(todayISO())}</strong></div></div>
      <div class="section-head"><div><h2>Para executar</h2><p>Somente ordens liberadas por CEO ou ADM aparecem aqui.</p></div></div>
      ${released.length ? `<div class="grid two">${released.map(o => `<div class="card"><div class="inline"><span class="badge gold">Liberado</span><span class="subtle right">${o.releasedAt ? new Date(o.releasedAt).toLocaleString("pt-BR") : ""}</span></div><h2 style="font-size:24px;margin-top:14px">${escapeHTML(o.title || "Banho")}</h2><p class="muted"><b>Talhão(ões):</b> ${escapeHTML((o.talhaoNames || []).join(", ") || "—")}</p><div class="card soft" style="margin-top:12px"><b>Produtos e quantidades</b><div style="display:grid;gap:8px;margin-top:10px">${(o.products || []).map(p => `<div class="inline"><span>${escapeHTML(p.name)}</span><b class="right">${Number(p.quantity).toLocaleString("pt-BR")} ${escapeHTML(p.unit)}</b></div>`).join("") || `<span class="muted">Nenhum produto informado.</span>`}</div></div>${o.notes ? `<p class="muted"><b>Observação:</b> ${escapeHTML(o.notes)}</p>` : ""}<div class="form-actions"><button class="btn primary bath-complete" data-id="${o.id}">Marcar como concluído</button></div></div>`).join("")}</div>` : `<div class="card empty">Quando CEO ou ADM liberar um banho para esta fazenda, ele aparecerá aqui.</div>`}
      <div class="section-head"><h2>Concluídos por você</h2></div>
      ${completedByMe.length ? `<div class="table-wrap"><table><thead><tr><th>Ordem</th><th>Talhões</th><th>Produtos</th><th>Concluído em</th></tr></thead><tbody>${completedByMe.map(o => `<tr><td><b>${escapeHTML(o.title || "Banho")}</b></td><td>${escapeHTML((o.talhaoNames || []).join(", ") || "—")}</td><td>${escapeHTML((o.products || []).map(p => `${p.name} ${Number(p.quantity).toLocaleString("pt-BR")} ${p.unit}`).join(" • "))}</td><td>${o.completedAt ? new Date(o.completedAt).toLocaleString("pt-BR") : "—"}</td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum banho concluído por você ainda.</div>`}`;

    $$(".bath-complete").forEach(btn => btn.onclick = () => {
      const order = farm.banho.orders.find(o => o.id === btn.dataset.id);
      if (!order || order.status !== "released") return;
      if (!confirm(`Marcar "${order.title || "Banho"}" como concluído?`)) return;
      order.status = "completed";
      order.completedAt = new Date().toISOString();
      order.completedBy = currentUser.username;
      order.completedByName = currentUser.name;
      saveData();
      renderBanho();
      toast("Banho concluído.");
    });
    return;
  }

  const activeProducts = farm.banho.products.filter(p => p.active !== false);
  const orders = farm.banho.orders.slice().reverse();
  const canCreateOrder = farm.talhoes.length > 0 && activeProducts.length > 0;
  $("#pageContent").innerHTML = `
    <div class="grid two">
      <form id="bathProductForm" class="form-card"><div class="inline"><h3>Produtos para banho</h3><span class="badge gold right">CEO / ADM</span></div><div class="form-grid" style="margin-top:18px"><label>Produto<input name="name" required placeholder="Ex.: Produto A"></label><label>Unidade<select name="unit"><option value="L">Litros (L)</option><option value="kg">Quilos (kg)</option></select></label></div><div class="form-actions"><button class="btn primary">Adicionar produto</button></div></form>
      <div class="card soft"><span class="eyebrow dark">PREPARO</span><h2>${activeProducts.length} produtos ativos</h2><p class="muted">Cadastre previamente os produtos que poderão ser selecionados nas ordens de banho.</p></div>
    </div>

    <div class="section-head"><h2>Produtos cadastrados</h2></div>
    ${farm.banho.products.length ? `<div class="table-wrap"><table><thead><tr><th>Produto</th><th>Unidade</th><th>Status</th><th>Ações</th></tr></thead><tbody>${farm.banho.products.map(p => `<tr><td><b>${escapeHTML(p.name)}</b></td><td>${escapeHTML(p.unit)}</td><td><span class="badge ${p.active !== false ? "green" : "red"}">${p.active !== false ? "Ativo" : "Inativo"}</span></td><td><div class="inline"><button class="btn small bath-product-toggle" data-id="${p.id}">${p.active !== false ? "Desativar" : "Ativar"}</button><button class="btn danger small bath-product-delete" data-id="${p.id}">Excluir</button></div></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum produto cadastrado.</div>`}

    <div class="section-head"><div><h2>Montar novo banho</h2><p>Selecione os talhões e informe a quantidade de cada produto antes de liberar.</p></div></div>
    ${canCreateOrder ? `<form id="bathOrderForm" class="form-card"><div class="form-grid"><label>Nome da ordem<input name="title" placeholder="Ex.: Banho Talhão 01" value="Banho ${dateBR(todayISO())}"></label><label class="wide">Observação<input name="notes" placeholder="Opcional"></label></div><div class="section-head"><h2>Talhões</h2></div><div class="grid three">${farm.talhoes.map(t => `<label class="equipment-pick"><span><strong>${escapeHTML(t.name)}</strong><span>Selecionar talhão</span></span><input type="checkbox" name="bathTalhoes" value="${t.id}"></label>`).join("")}</div><div class="section-head"><h2>Produtos e quantidades</h2></div><div class="grid two">${activeProducts.map(p => `<div class="card soft"><label style="margin:0;display:flex;grid-template-columns:auto 1fr;align-items:center;gap:10px"><input type="checkbox" name="bathProducts" value="${p.id}" style="width:auto"><b>${escapeHTML(p.name)}</b></label><label>Quantidade (${escapeHTML(p.unit)})<input type="number" min="0" step="0.01" name="bathQty_${p.id}" placeholder="0"></label></div>`).join("")}</div><div class="form-actions"><button class="btn primary">Salvar rascunho</button></div></form>` : `<div class="card empty">Para montar um banho, cadastre pelo menos <b>1 talhão</b> e <b>1 produto ativo</b>.</div>`}

    <div class="section-head"><div><h2>Ordens de banho</h2><p>Salve como rascunho, confira e depois clique em Liberar.</p></div></div>
    ${orders.length ? `<div class="table-wrap"><table><thead><tr><th>Ordem</th><th>Talhões</th><th>Produtos</th><th>Status</th><th>Responsável</th><th>Ações</th></tr></thead><tbody>${orders.map(o => `<tr><td><b>${escapeHTML(o.title || "Banho")}</b><div class="subtle">${o.createdAt ? new Date(o.createdAt).toLocaleString("pt-BR") : ""}</div></td><td>${escapeHTML((o.talhaoNames || []).join(", ") || "—")}</td><td>${escapeHTML((o.products || []).map(p => `${p.name}: ${Number(p.quantity).toLocaleString("pt-BR")} ${p.unit}`).join(" • ") || "—")}</td><td><span class="badge ${banhoStatusClass(o.status)}">${banhoStatusLabel(o.status)}</span></td><td>${o.completedByName ? escapeHTML(o.completedByName) : "—"}</td><td><div class="inline">${o.status === "draft" ? `<button class="btn primary small bath-release" data-id="${o.id}">Liberar</button><button class="btn danger small bath-delete" data-id="${o.id}">Excluir</button>` : ""}${o.status === "released" ? `<button class="btn danger small bath-cancel" data-id="${o.id}">Cancelar</button>` : ""}</div></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma ordem de banho criada.</div>`}`;

  $("#bathProductForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const name = String(f.get("name") || "").trim();
    if (!name) return;
    if (farm.banho.products.some(p => p.name.toLowerCase() === name.toLowerCase())) return toast("Esse produto já está cadastrado.");
    farm.banho.products.push({ id: uid(), name, unit: f.get("unit") === "kg" ? "kg" : "L", active: true });
    saveData(); renderBanho(); toast("Produto adicionado.");
  };

  $$(".bath-product-toggle").forEach(btn => btn.onclick = () => {
    const product = farm.banho.products.find(p => p.id === btn.dataset.id);
    if (!product) return;
    product.active = product.active === false;
    saveData(); renderBanho();
  });

  $$(".bath-product-delete").forEach(btn => btn.onclick = () => {
    const product = farm.banho.products.find(p => p.id === btn.dataset.id);
    if (!product) return;
    if (!confirm(`Excluir o produto ${product.name}? Ordens antigas continuarão com o nome e quantidade salvos.`)) return;
    farm.banho.products = farm.banho.products.filter(p => p.id !== product.id);
    saveData(); renderBanho();
  });

  const orderForm = $("#bathOrderForm");
  if (orderForm) orderForm.onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const talhaoIds = f.getAll("bathTalhoes");
    const productIds = f.getAll("bathProducts");
    if (!talhaoIds.length) return toast("Escolha pelo menos um talhão.");
    if (!productIds.length) return toast("Escolha pelo menos um produto.");
    const selectedProducts = [];
    for (const productId of productIds) {
      const product = farm.banho.products.find(p => p.id === productId);
      const quantity = Number(f.get(`bathQty_${productId}`) || 0);
      if (!product || quantity <= 0) return toast(`Informe uma quantidade maior que zero para ${product?.name || "o produto selecionado"}.`);
      selectedProducts.push({ productId: product.id, name: product.name, unit: product.unit, quantity });
    }
    const talhaoNames = talhaoIds.map(id => farm.talhoes.find(t => t.id === id)?.name).filter(Boolean);
    farm.banho.orders.push({
      id: uid(),
      title: String(f.get("title") || "").trim() || `Banho ${dateBR(todayISO())}`,
      notes: String(f.get("notes") || "").trim(),
      talhaoIds,
      talhaoNames,
      products: selectedProducts,
      status: "draft",
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username,
      createdByName: currentUser.name
    });
    saveData(); renderBanho(); toast("Rascunho do banho salvo.");
  };

  $$(".bath-release").forEach(btn => btn.onclick = () => {
    const order = farm.banho.orders.find(o => o.id === btn.dataset.id);
    if (!order || order.status !== "draft") return;
    order.status = "released";
    order.releasedAt = new Date().toISOString();
    order.releasedBy = currentUser.username;
    order.releasedByName = currentUser.name;
    saveData(); renderBanho(); toast("Banho liberado para os tratoristas.");
  });

  $$(".bath-cancel").forEach(btn => btn.onclick = () => {
    const order = farm.banho.orders.find(o => o.id === btn.dataset.id);
    if (!order || order.status !== "released") return;
    if (!confirm("Cancelar este banho liberado?")) return;
    order.status = "cancelled";
    order.cancelledAt = new Date().toISOString();
    order.cancelledBy = currentUser.username;
    saveData(); renderBanho(); toast("Banho cancelado.");
  });

  $$(".bath-delete").forEach(btn => btn.onclick = () => {
    const order = farm.banho.orders.find(o => o.id === btn.dataset.id);
    if (!order || order.status !== "draft") return;
    if (!confirm("Excluir este rascunho?")) return;
    farm.banho.orders = farm.banho.orders.filter(o => o.id !== order.id);
    saveData(); renderBanho();
  });
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
      <div class="card soft"><span class="eyebrow dark">ESTOQUE • ${selectedType() === "cattle" ? "GADO" : "CAFÉ"}</span><h2>${items.length} itens</h2><p class="muted">Valor estimado: <b>${money(totalValue)}</b></p></div>
    </div>
    <div class="section-head"><div><h2>Itens salvos</h2><p>Quantidade pode ser atualizada diretamente.</p></div></div>
    ${items.length ? `<div class="table-wrap"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Qtd.</th><th>Unidade</th><th>Mínimo</th><th>Custo un.</th><th>Valor</th><th></th></tr></thead><tbody>${items.map(s => `<tr><td><b>${escapeHTML(s.item)}</b></td><td>${escapeHTML(s.category)}</td><td><input class="stock-q" data-id="${s.id}" type="number" min="0" step="0.01" value="${Number(s.quantity || 0)}" style="width:90px"></td><td>${escapeHTML(s.unit)}</td><td>${s.min}</td><td>${money(s.unitCost)}</td><td>${money(Number(s.quantity || 0) * Number(s.unitCost || 0))}</td><td><button class="btn danger small stock-del" data-id="${s.id}">Excluir</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Estoque vazio.</div>`}`;

  $("#stockForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    farm.stock.push({ id: uid(), activity: selectedType(), item: f.get("item"), category: f.get("category"), quantity: Number(f.get("quantity")), unit: f.get("unit"), min: Number(f.get("min")), unitCost: Number(f.get("unitCost")) });
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
    farm.finances.push({ id: uid(), activity: selectedType(), type: f.get("type"), category: f.get("category"), description: f.get("description"), date: f.get("date"), value, bags: coffee ? bags : 0, quoteUsed: coffee ? q : 0, createdBy: currentUser.name, createdAt: new Date().toISOString() });
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
  return `<div class="chart-legend"><span class="legend-item"><i class="legend-dot legend-income"></i>Entradas</span><span class="legend-item"><i class="legend-dot legend-expense"></i>Gastos</span><span class="legend-item"><i class="legend-dot legend-profit"></i>Resultado</span></div><div class="finance-chart">${rows.map(r => `<div class="month-group"><div class="month-total ${r.profit >= 0 ? "up" : "down"}" data-v="${r.profit}">${compactMoney(r.profit)}</div><div class="month-bars"><div class="bar income" style="height:${Math.max(2, r.income / max * 190)}px"><span class="bar-value">${compactMoney(r.income)}</span></div><div class="bar expense" style="height:${Math.max(2, r.expense / max * 190)}px"><span class="bar-value">${compactMoney(r.expense)}</span></div><div class="bar ${r.profit >= 0 ? "profit" : "loss"}" style="height:${Math.max(2, Math.abs(r.profit) / max * 190)}px"><span class="bar-value">${compactMoney(r.profit)}</span></div></div><div class="month-label">${r.label}</div></div>`).join("")}</div>`;
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
    <div class="grid kpis"><button type="button" class="card finance-kpi-link" id="openFinanceEntradas"><div class="kpi-label"><span>Entradas</span><span class="kpi-icon">${ico("up")}</span></div><div class="kpi-value text-green">${money(income)}</div><div class="kpi-foot">Clique para ver somente as entradas</div></button><button type="button" class="card finance-kpi-link" id="openFinanceGastos"><div class="kpi-label"><span>Gastos</span><span class="kpi-icon">${ico("down")}</span></div><div class="kpi-value text-red">${money(expense)}</div><div class="kpi-foot">Clique para ver somente os gastos</div></button><div class="card"><div class="kpi-label"><span>Resultado</span><span class="kpi-icon">${ico("chart")}</span></div><div class="kpi-value ${profit >= 0 ? "text-green" : "text-red"}">${money(profit)}</div></div><div class="card"><div class="kpi-label"><span>Escopo</span><span class="kpi-icon">${selectedType() === "cattle" ? ico("cattle") : ico("bean")}</span></div><div class="kpi-value" style="font-size:24px">${isGeneralView() ? "Geral" : contextName()}</div></div></div>
    <div class="section-head"><div><h2>Entradas, gastos e lucro</h2><p>Últimos 6 meses.</p></div></div>
    <div class="card chart-card">${renderFinancialChart(finances)}</div>
    ${isGeneralView() ? `<div class="card soft" style="margin-top:18px"><b>Modo geral</b><p class="muted" style="margin-bottom:0">No modo geral você consulta o consolidado de todas as fazendas. Para adicionar um novo lançamento, escolha uma fazenda específica.</p></div>` : `<div class="section-head"><h2>Novo lançamento</h2></div>${financeForm(false)}`}
    <div class="section-head"><h2>Histórico completo</h2></div>
    ${finances.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Fazenda</th><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Lançado por</th></tr></thead><tbody>${[...finances].reverse().map(x => `<tr><td>${dateBR(x.date)}</td><td>${escapeHTML(x.farmName || "—")}</td><td><span class="badge ${x.type === "entrada" ? "green" : "red"}">${x.type === "entrada" ? "Entrada" : "Saída"}</span></td><td>${escapeHTML(x.description)}</td><td>${escapeHTML(x.category)}</td><td><b>${money(x.value)}</b></td><td>${escapeHTML(x.createdBy || "—")}</td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum lançamento ainda.</div>`}`;
  $("#openFinanceEntradas").onclick = () => { currentPage = "finance-entradas"; renderPage(); };
  $("#openFinanceGastos").onclick = () => { currentPage = "finance-gastos"; renderPage(); };
  if (!isGeneralView()) bindFinanceForm(renderFinanceCEO);
}

function renderFinanceFiltered(type) {
  if (currentUser.role !== "ceo") {
    currentPage = "dashboard";
    return renderPage();
  }

  const isIncome = type === "entrada";
  const finances = contextFinances()
    .filter(x => x.type === type)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const total = finances.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const title = isIncome ? "Entradas financeiras" : "Gastos financeiros";
  const eyebrow = isIncome ? "ENTRADAS" : "GASTOS";

  setHeader(eyebrow, title);
  $("#pageContent").innerHTML = `
    <div class="finance-filter-head">
      <button type="button" class="btn" id="backFinance">← Voltar ao balanço</button>
      <span class="badge ${isIncome ? "green" : "red"}">${isIncome ? "Somente entradas" : "Somente gastos"}</span>
    </div>

    <div class="grid two finance-filter-summary">
      <div class="card">
        <div class="kpi-label"><span>${isIncome ? "Total de entradas" : "Total de gastos"}</span><span class="kpi-icon">${ico(isIncome ? "up" : "down")}</span></div>
        <div class="kpi-value ${isIncome ? "text-green" : "text-red"}">${money(total)}</div>
        <div class="kpi-foot">${finances.length} lançamento${finances.length === 1 ? "" : "s"}</div>
      </div>
      <div class="card soft">
        <span class="eyebrow dark">ESCOPO</span>
        <h2>${escapeHTML(contextName())}</h2>
        <p class="muted">${isGeneralView() ? "Valores consolidados de todas as fazendas desta atividade." : "Valores da fazenda selecionada."}</p>
      </div>
    </div>

    <div class="section-head"><div><h2>${isIncome ? "Histórico de entradas" : "Histórico de gastos"}</h2><p>${isIncome ? "Receitas e vendas registradas." : "Despesas e saídas registradas."}</p></div></div>
    ${finances.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Fazenda</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Lançado por</th></tr></thead><tbody>${finances.map(x => `<tr><td>${dateBR(x.date)}</td><td>${escapeHTML(x.farmName || "—")}</td><td><b>${escapeHTML(x.description || "—")}</b></td><td>${escapeHTML(x.category || "—")}</td><td class="${isIncome ? "text-green" : "text-red"}"><b>${money(x.value)}</b></td><td>${escapeHTML(x.createdBy || "—")}</td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum ${isIncome ? "lançamento de entrada" : "gasto"} registrado neste escopo.</div>`}
  `;

  $("#backFinance").onclick = () => {
    currentPage = "financeiro";
    renderPage();
  };
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
    <div class="grid two"><form id="noteForm" class="form-card"><h3>Lançar nota</h3><div class="form-grid" style="margin-top:18px"><label>Tipo<select name="noteType"><option value="compra">Compra / despesa</option><option value="venda">Venda / entrada</option></select></label><label>Número<input name="number" required></label><label>Fornecedor / cliente<input name="party" required></label><label>Categoria<select name="category">${financeCategories().map(c => `<option>${c}</option>`).join("")}</select></label><label>Data<input name="date" type="date" value="${todayISO()}" required></label><label>Valor<input name="value" type="number" min="0" step="0.01" required></label><label class="wide">Observação<textarea name="description" rows="3"></textarea></label><label class="wide">Foto ou arquivo da nota (imagem/PDF até 1 MB)<input name="file" type="file" accept="image/*,application/pdf"></label><label class="wide" style="display:flex;grid-template-columns:auto 1fr;align-items:center;gap:10px"><input name="postFinance" type="checkbox" checked style="width:auto">Lançar automaticamente no financeiro</label></div><div class="form-actions"><button class="btn primary">Salvar nota</button></div></form><div class="card soft"><span class="eyebrow dark">ARQUIVO • ${selectedType() === "cattle" ? "GADO" : "CAFÉ"}</span><h2>${notes.length} notas</h2><p class="muted">Dados sincronizados no servidor e separados por fazenda e atividade.</p></div></div>
    <div class="section-head"><h2>Notas salvas</h2></div>
    ${notes.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Nº</th><th>Tipo</th><th>Parte</th><th>Categoria</th><th>Valor</th><th>Anexo</th><th></th></tr></thead><tbody>${[...notes].reverse().map(n => `<tr><td>${dateBR(n.date)}</td><td>${escapeHTML(n.number)}</td><td>${n.noteType === "venda" ? "Venda" : "Compra"}</td><td>${escapeHTML(n.party)}</td><td>${escapeHTML(n.category)}</td><td>${money(n.value)}</td><td>${n.fileData ? `<a class="btn small" href="${n.fileData}" download="${escapeHTML(n.fileName || "anexo")}">Abrir</a>` : "Sem anexo"}</td><td><button class="btn danger small note-del" data-id="${n.id}">Excluir</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma nota.</div>`}`;

  $("#noteForm").onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const value = Number(f.get("value") || 0);
    if (value <= 0) return toast("Informe o valor.");
    const file = e.target.elements.file.files[0];
    let fileData = "", fileName = "", fileType = "";
    if (file) {
      if (file.size > 1024 * 1024) return toast("O anexo precisa ter no máximo 1 MB neste sistema.");
      try {
        fileData = await fileToDataURL(file);
        fileName = file.name;
        fileType = file.type;
      } catch (_) {
        return toast("Não foi possível ler o arquivo.");
      }
    }
    const note = { id: uid(), activity: selectedType(), noteType: f.get("noteType"), number: f.get("number"), party: f.get("party"), category: f.get("category"), date: f.get("date"), value, description: f.get("description"), fileData, fileName, fileType, createdBy: currentUser.name };
    farm.notes.push(note);
    if (f.get("postFinance")) {
      farm.finances.push({ id: uid(), activity: selectedType(), type: note.noteType === "venda" ? "entrada" : "saida", category: note.category, description: `Nota ${note.number} • ${note.party}`, date: note.date, value, noteId: note.id, createdBy: currentUser.name });
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
  const modeName = selectedType() === "cattle" ? "Gado" : "Café";
  $("#pageContent").innerHTML = `
    <div class="grid two"><form id="newFarmForm" class="form-card"><div class="inline"><h3>Criar nova fazenda</h3><span class="badge gold right">Somente CEO</span></div><div class="form-grid" style="margin-top:18px"><label class="wide">Nome<input name="name" required placeholder="Nome da fazenda"></label></div><div class="form-actions"><button class="btn primary">Criar fazenda</button></div></form><div class="card soft"><span class="eyebrow dark">ESTRUTURA</span><h2>${data.farms.length} fazendas</h2><p class="muted">Todas as fazendas possuem os dois módulos: Café e Gado. O botão do menu alterna qual operação está visível.</p><div class="inline" style="margin-top:14px"><span class="badge green">Café</span><span class="badge gold">Gado</span><span class="badge">Interface atual: ${modeName}</span></div></div></div>
    <div class="section-head"><h2>Fazendas cadastradas</h2></div>
    <div class="grid two">${data.farms.map(f => `<form class="form-card farm-edit" data-id="${f.id}"><div class="inline"><span class="badge green">Café</span><span class="badge gold">Gado</span>${f.id === activeFarmId ? `<span class="badge">Ativa</span>` : ""}</div><label>Nome<input name="name" value="${escapeHTML(f.name)}" required></label><div class="form-actions">${selectedType() === "coffee" ? `<button type="button" class="btn farm-plots" data-id="${f.id}">Gerenciar talhões</button>` : ""}<button type="button" class="btn danger farm-delete" data-id="${f.id}">Excluir</button><button class="btn primary">Salvar alterações</button></div></form>`).join("")}</div>`;

  $("#newFarmForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const name = String(f.get("name") || "").trim();
    if (!name) return toast("Informe o nome da fazenda.");
    const farm = newFarm(name);
    data.farms.push(farm);
    activeFarmId = farm.id;
    saveData(); renderFarmSelector(); renderFarms(); toast("Fazenda criada.");
  };
  $$(".farm-edit").forEach(form => form.onsubmit = e => {
    e.preventDefault();
    const farm = data.farms.find(x => x.id === form.dataset.id);
    if (!farm) return;
    const f = new FormData(form);
    farm.name = String(f.get("name") || "").trim() || farm.name;
    saveData(); renderFarmSelector(); renderFarms(); toast("Fazenda atualizada.");
  });
  $$(".farm-plots").forEach(btn => btn.onclick = () => {
    const farm = data.farms.find(f => f.id === btn.dataset.id);
    if (!farm || selectedType() !== "coffee") return;
    activeFarmId = farm.id;
    localStorage.setItem(activeFarmStorageKey(currentUser), activeFarmId);
    currentPage = "talhoes";
    renderFarmSelector();
    renderNav();
    renderPage();
  });
  $$(".farm-delete").forEach(btn => btn.onclick = () => {
    if (data.farms.length <= 1) return toast("É necessário manter pelo menos uma fazenda.");
    const farm = data.farms.find(x => x.id === btn.dataset.id);
    if (!farm) return;
    if (!confirm(`Excluir ${farm.name}? Os dados de Café e Gado desta fazenda serão apagados do Grupo.`)) return;
    data.farms = data.farms.filter(x => x.id !== farm.id);
    data.receipts = data.receipts.filter(r => r.farmId !== farm.id);
    data.users.forEach(u => { if (u.role === "contribuinte" && u.allowedFarmId === farm.id) u.allowedFarmId = data.farms[0]?.id || ""; });
    if (activeFarmId === farm.id) activeFarmId = data.farms[0].id;
    saveData(); renderFarmSelector(); renderFarms(); toast("Fazenda excluída.");
  });
}

function renderUsers() {
  if (currentUser.role !== "ceo") return;
  setHeader("ACESSOS", "Usuários e perfis");
  const farmOptions = (selected = "") => data.farms.map(f => `<option value="${f.id}" ${f.id === selected ? "selected" : ""}>${escapeHTML(f.name)} • Café + Gado</option>`).join("");
  const functionOptions = (selected = "Campo") => `<option value="Tratorista" ${selected === "Tratorista" ? "selected" : ""}>Tratorista</option><option value="Campo" ${selected === "Campo" ? "selected" : ""}>Campo</option>`;
  const activityOptions = (selected = "both") => `<option value="coffee" ${selected === "coffee" ? "selected" : ""}>Café</option><option value="cattle" ${selected === "cattle" ? "selected" : ""}>Gado</option><option value="both" ${selected === "both" ? "selected" : ""}>Café + Gado</option>`;
  $("#pageContent").innerHTML = `
    <div class="grid two"><form id="userForm" class="form-card"><div class="inline"><h3>Criar login</h3><span class="badge gold right">Somente CEO</span></div><div class="form-grid" style="margin-top:18px"><label>Nome<input name="name" required></label><label>E-mail<input name="email" type="email" required></label><label id="newUserFunctionWrap">Função<select name="function" id="newUserFunction" required><option value="">Selecione</option><option value="Tratorista">Tratorista</option><option value="Campo">Campo</option></select></label><label>Chave PIX (opcional)<input name="pixKey"></label><label>Usuário<input name="username" required></label><label>Senha inicial<input name="password" type="password" minlength="6" required></label><label>Perfil<select name="role" id="newUserRole"><option value="contribuinte">Contribuinte</option><option value="adm">Administrador</option><option value="ceo">CEO</option></select></label><label id="newUserFarmWrap">Fazenda permitida<select name="allowedFarmId">${farmOptions(data.farms[0]?.id || "")}</select></label><label id="newUserActivityWrap">Atividade permitida<select name="allowedActivity" id="newUserActivity"><option value="coffee">Café</option><option value="cattle">Gado</option><option value="both" selected>Café + Gado</option></select></label></div><div class="form-actions"><button class="btn primary">Criar login</button></div></form><div class="card soft"><span class="eyebrow dark">PERFIL DE ACESSO</span><h2>${data.users.filter(u => u.active !== false).length} ativos</h2><p class="muted">Para contribuinte, a função é obrigatória: Tratorista ou Campo. Cada contribuinte fica vinculado a uma única fazenda.</p></div></div>
    <div class="section-head"><h2>Solicitações pendentes</h2></div>
    ${data.pendingRegistrations.length ? `<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Função</th><th>PIX</th><th>Fazenda ao aprovar</th><th>Atividade</th><th>Ações</th></tr></thead><tbody>${data.pendingRegistrations.map(r => `<tr><td><b>${escapeHTML(r.name)}</b></td><td>${escapeHTML(r.username)}</td><td>${escapeHTML(r.email || "—")}</td><td>${ROLE_NAMES[r.role]}</td><td>${escapeHTML(r.function || "—")}</td><td>${escapeHTML(r.pixKey || "—")}</td><td>${r.role === "contribuinte" ? `<select class="reg-farm" data-id="${r.id}" style="min-width:180px">${farmOptions(data.farms[0]?.id || "")}</select>` : "Todas"}</td><td>${r.role === "contribuinte" ? `<select class="reg-activity" data-id="${r.id}" style="min-width:130px">${activityOptions(r.allowedActivity || "both")}</select>` : "Café + Gado"}</td><td><div class="inline"><button class="btn small reg-approve" data-id="${r.id}">Aceitar</button><button class="btn danger small reg-reject" data-id="${r.id}">Recusar</button></div></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhuma solicitação pendente.</div>`}
    <div class="section-head"><div><h2>Usuários cadastrados</h2><p>Altere a função e a fazenda dos contribuidores diretamente aqui.</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Função</th><th>PIX</th><th>Atividade</th><th>Fazenda do perfil</th><th>Status</th><th>Ações</th></tr></thead><tbody>${data.users.map(u => `<tr><td><b>${escapeHTML(u.name)}</b>${u.id === currentUser.id ? ' <span class="badge gold">Você</span>' : ""}</td><td>${escapeHTML(u.username)}</td><td>${escapeHTML(u.email || "—")}</td><td>${ROLE_NAMES[u.role]}</td><td>${u.role === "contribuinte" ? `<select class="user-function" data-id="${u.id}" style="min-width:130px">${functionOptions(u.function)}</select>` : escapeHTML(u.function || "—")}</td><td>${escapeHTML(u.pixKey || "—")}</td><td>${u.role === "contribuinte" ? `<select class="user-activity" data-id="${u.id}" style="min-width:130px">${activityOptions(u.allowedActivity || "both")}</select>` : "Café + Gado"}</td><td>${u.role === "contribuinte" ? `<select class="user-farm" data-id="${u.id}" style="min-width:180px">${farmOptions(u.allowedFarmId)}</select>` : '<span class="badge">Todas as fazendas</span>'}</td><td><span class="badge ${u.active !== false ? "green" : "red"}">${u.active !== false ? "Ativo" : "Bloqueado"}</span></td><td><div class="inline"><button class="btn small user-pass" data-id="${u.id}">Senha</button><button class="btn small user-toggle" data-id="${u.id}">${u.active !== false ? "Desativar" : "Ativar"}</button><button class="btn danger small user-del" data-id="${u.id}">Excluir</button></div></td></tr>`).join("")}</tbody></table></div>`;

  const roleSelect = $("#newUserRole");
  const farmWrap = $("#newUserFarmWrap");
  const activityWrap = $("#newUserActivityWrap");
  const functionWrap = $("#newUserFunctionWrap");
  const functionSelect = $("#newUserFunction");
  const syncNewUserFields = () => {
    const contributor = roleSelect.value === "contribuinte";
    farmWrap.classList.toggle("hidden", !contributor);
    activityWrap.classList.toggle("hidden", !contributor);
    functionWrap.classList.toggle("hidden", !contributor);
    functionSelect.disabled = !contributor;
    functionSelect.required = contributor;
  };
  roleSelect.onchange = syncNewUserFields; syncNewUserFields();

  $("#userForm").onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); createUser(Object.fromEntries(f.entries()), renderUsers); };
  $$(".reg-approve").forEach(btn => btn.onclick = () => { const farmSelect = document.querySelector(`.reg-farm[data-id="${btn.dataset.id}"]`); const activitySelect = document.querySelector(`.reg-activity[data-id="${btn.dataset.id}"]`); approveRegistration(btn.dataset.id, farmSelect?.value || "", activitySelect?.value || "both"); });
  $$(".reg-reject").forEach(btn => btn.onclick = () => rejectRegistration(btn.dataset.id));
  $$(".user-function").forEach(sel => sel.onchange = () => { const user = data.users.find(x => x.id === sel.dataset.id); if (!user || user.role !== "contribuinte") return; user.function = sel.value; saveData(); toast("Função atualizada."); });
  $$(".user-activity").forEach(sel => sel.onchange = () => { const user = data.users.find(x => x.id === sel.dataset.id); if (!user || user.role !== "contribuinte") return; user.allowedActivity = sel.value; localStorage.setItem(`fazendaModo:${currentGroup?.slug || "grupo"}:${user.username}`, sel.value === "cattle" ? "cattle" : "coffee"); saveData(); toast("Atividade do perfil atualizada."); });
  $$(".user-farm").forEach(sel => sel.onchange = () => { const user = data.users.find(x => x.id === sel.dataset.id); if (!user || user.role !== "contribuinte") return; user.allowedFarmId = sel.value; saveData(); toast("Fazenda do perfil atualizada."); });
  $$(".user-pass").forEach(btn => btn.onclick = () => { const user = data.users.find(x => x.id === btn.dataset.id); const p = prompt(`Nova senha para ${user.username}:`); if (p === null) return; if (p.length < 6) return toast("Mínimo 6 caracteres."); user.password = p; saveData(); toast("Senha alterada."); });
  $$(".user-toggle").forEach(btn => btn.onclick = () => { const user = data.users.find(x => x.id === btn.dataset.id); if (user.id === currentUser.id) return toast("Você não pode desativar seu próprio acesso."); if (user.role === "ceo" && user.active !== false && data.users.filter(x => x.role === "ceo" && x.active !== false).length <= 1) return toast("Mantenha pelo menos um CEO ativo."); user.active = user.active === false; saveData(); renderUsers(); });
  $$(".user-del").forEach(btn => btn.onclick = () => { const user = data.users.find(x => x.id === btn.dataset.id); if (user.id === currentUser.id) return toast("Você não pode excluir seu próprio acesso."); if (user.role === "ceo" && user.active !== false && data.users.filter(x => x.role === "ceo" && x.active !== false).length <= 1) return toast("Mantenha pelo menos um CEO ativo."); if (!confirm(`Excluir ${user.name}?`)) return; data.users = data.users.filter(x => x.id !== user.id); data.receipts = data.receipts.filter(r => r.userId !== user.id); saveData(); renderUsers(); });
}

function equipmentLogsInContext() {
  if (activeFarmId === "general-coffee") {
    return data.farms.flatMap(f => (f.equipmentLogs || []).map(log => ({ ...log, farmName: f.name, farmId: f.id })));
  }
  const farm = activeFarm();
  if (!farm) return [];
  return (farm.equipmentLogs || []).map(log => ({ ...log, farmName: farm.name, farmId: farm.id }));
}

function renderEquipmentLog() {
  if (currentUser.role !== "ceo") return;
  setHeader("HISTÓRICO", "Log equipamentos");
  const logs = equipmentLogsInContext().sort((a, b) => String(b.loggedAt || b.date || "").localeCompare(String(a.loggedAt || a.date || "")));
  const coffeeFarms = data.farms;
  if (selectedType() === "cattle") {
    $("#pageContent").innerHTML = `<div class="card soft"><span class="eyebrow dark">LOG DE EQUIPAMENTOS</span><h2>Disponível para fazendas de café</h2><p class="muted">Selecione uma fazenda de café ou a opção Geral • Café para consultar o histórico de responsáveis.</p></div>`;
    return;
  }
  $("#pageContent").innerHTML = `
    <div class="grid kpis"><div class="card"><div class="kpi-label"><span>Registros</span></div><div class="kpi-value">${logs.length}</div><div class="kpi-foot">responsabilidades salvas</div></div><div class="card"><div class="kpi-label"><span>Contribuintes</span></div><div class="kpi-value">${new Set(logs.map(l => l.user)).size}</div><div class="kpi-foot">pessoas no histórico</div></div><div class="card"><div class="kpi-label"><span>Fazendas de café</span></div><div class="kpi-value">${coffeeFarms.length}</div><div class="kpi-foot">disponíveis no sistema</div></div></div>
    <div class="section-head"><div><h2>Histórico de responsabilidade</h2><p>Cada confirmação ou troca gera um registro permanente, incluindo os talhões selecionados.</p></div></div>
    ${logs.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Fazenda</th><th>Contribuinte</th><th>Função</th><th>Atividade</th><th>Talhão(ões)</th><th>Trator</th><th>Implemento</th><th>Registrado em</th></tr></thead><tbody>${logs.map(log => { const fn = log.userFunction || data.users.find(u => u.username === log.user)?.function || "Campo"; const plots = (log.talhaoNames || []).join(", ") || "—"; return `<tr><td>${dateBR(log.date)}</td><td>${escapeHTML(log.farmName || "—")}</td><td><b>${escapeHTML(log.userName || log.user || "—")}</b></td><td>${escapeHTML(fn)}</td><td>${escapeHTML(log.activity || "—")}</td><td>${escapeHTML(plots)}</td><td>${escapeHTML(log.tractorName || "—")}</td><td>${escapeHTML(log.implementName || "—")}</td><td>${log.loggedAt ? new Date(log.loggedAt).toLocaleString("pt-BR") : "—"}</td></tr>`; }).join("")}</tbody></table></div>` : `<div class="card empty">Ainda não há registros. Eles aparecerão quando um contribuinte confirmar o trabalho do dia.</div>`}`;
}

function renderProfile() {
  setHeader("CONTA", "Perfil");
  const assignedFarm = currentUser.role === "contribuinte" ? data.farms.find(f => f.id === currentUser.allowedFarmId) : null;
  const farmOptions = (selected = "") => data.farms.map(f => `<option value="${f.id}" ${f.id === selected ? "selected" : ""}>${escapeHTML(f.name)} • Café + Gado</option>`).join("");
  const functionOptions = (selected = "Campo") => `<option value="Tratorista" ${selected === "Tratorista" ? "selected" : ""}>Tratorista</option><option value="Campo" ${selected === "Campo" ? "selected" : ""}>Campo</option>`;
  const activityOptions = (selected = "both") => `<option value="coffee" ${selected === "coffee" ? "selected" : ""}>Café</option><option value="cattle" ${selected === "cattle" ? "selected" : ""}>Gado</option><option value="both" ${selected === "both" ? "selected" : ""}>Café + Gado</option>`;
  const contributors = data.users.filter(u => u.role === "contribuinte");
  const ceoAccessManager = currentUser.role === "ceo" ? `
    <div class="section-head"><div><h2>Perfis dos contribuidores</h2><p>Defina a função e a única fazenda que cada contribuinte poderá visualizar.</p></div></div>
    ${contributors.length ? `<div class="table-wrap"><table><thead><tr><th>Contribuinte</th><th>Usuário</th><th>Função</th><th>Atividade</th><th>Fazenda liberada</th><th>Status</th></tr></thead><tbody>${contributors.map(u => `<tr><td><b>${escapeHTML(u.name)}</b></td><td>${escapeHTML(u.username)}</td><td><select class="profile-user-function" data-id="${u.id}" style="min-width:135px">${functionOptions(u.function)}</select></td><td><select class="profile-user-activity" data-id="${u.id}" style="min-width:135px">${activityOptions(u.allowedActivity || "both")}</select></td><td><select class="profile-user-farm" data-id="${u.id}" style="min-width:210px">${farmOptions(u.allowedFarmId)}</select></td><td><span class="badge ${u.active !== false ? "green" : "red"}">${u.active !== false ? "Ativo" : "Bloqueado"}</span></td></tr>`).join("")}</tbody></table></div>` : `<div class="card empty">Nenhum contribuinte cadastrado.</div>`}` : "";

  const functionField = currentUser.role === "contribuinte"
    ? `<label>Função<select name="function" required>${functionOptions(currentUser.function)}</select></label>`
    : `<label>Função<input name="function" value="${escapeHTML(currentUser.function || "")}"></label>`;

  $("#pageContent").innerHTML = `
    <div class="grid two"><form id="profileForm" class="form-card"><div class="inline"><h3>Meus dados</h3><span class="badge right">${ROLE_NAMES[currentUser.role]}</span></div><div class="form-grid" style="margin-top:18px"><label>Nome<input name="name" value="${escapeHTML(currentUser.name || "")}" required></label><label>E-mail<input name="email" type="email" value="${escapeHTML(currentUser.email || "")}" required></label><label>Usuário<input value="${escapeHTML(currentUser.username || "")}" disabled></label>${functionField}<label>Chave PIX<input name="pixKey" value="${escapeHTML(currentUser.pixKey || "")}" placeholder="Opcional"></label>${currentUser.role === "contribuinte" ? `<label>Atividade permitida<input value="${currentUser.allowedActivity === "coffee" ? "Café" : currentUser.allowedActivity === "cattle" ? "Gado" : "Café + Gado"}" disabled></label><label>Fazenda liberada<input value="${escapeHTML(assignedFarm?.name || "Nenhuma fazenda definida")}" disabled></label>` : `<label class="wide">Acesso às fazendas<input value="Todas as fazendas" disabled></label>`}</div><div class="form-actions"><button class="btn primary">Salvar perfil</button></div></form><div class="card soft"><span class="eyebrow dark">ACESSO</span><h2>${currentUser.role === "contribuinte" ? escapeHTML(assignedFarm?.name || "Sem fazenda") : "Acesso geral"}</h2><p class="muted">${currentUser.role === "contribuinte" ? "A fazenda do seu acesso só pode ser alterada pelo CEO." : "Seu perfil pode acessar as fazendas conforme as permissões do cargo."}</p></div></div>
    ${ceoAccessManager}`;

  $("#profileForm").onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const fn = String(f.get("function") || "").trim();
    if (currentUser.role === "contribuinte" && !["Tratorista", "Campo"].includes(fn)) return toast("Selecione Tratorista ou Campo.");
    currentUser.name = String(f.get("name") || "").trim();
    currentUser.email = String(f.get("email") || "").trim().toLowerCase();
    currentUser.function = fn;
    currentUser.pixKey = String(f.get("pixKey") || "").trim();
    saveData();
    $("#userName").textContent = currentUser.name;
    $("#userAvatar").textContent = currentUser.name?.[0]?.toUpperCase() || "U";
    toast("Perfil atualizado.");
    renderProfile();
  };
  $$(".profile-user-function").forEach(sel => sel.onchange = () => { const user = data.users.find(u => u.id === sel.dataset.id); if (!user || user.role !== "contribuinte") return; user.function = sel.value; saveData(); toast(`Função de ${user.name} atualizada.`); });
  $$(".profile-user-activity").forEach(sel => sel.onchange = () => { const user = data.users.find(u => u.id === sel.dataset.id); if (!user || user.role !== "contribuinte") return; user.allowedActivity = sel.value; localStorage.setItem(`fazendaModo:${currentGroup?.slug || "grupo"}:${user.username}`, sel.value === "cattle" ? "cattle" : "coffee"); saveData(); toast(`Atividade de ${user.name} atualizada.`); });
  $$(".profile-user-farm").forEach(sel => sel.onchange = () => { const user = data.users.find(u => u.id === sel.dataset.id); if (!user || user.role !== "contribuinte") return; user.allowedFarmId = sel.value; saveData(); toast(`Fazenda de ${user.name} atualizada.`); });
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
      if (file.size > 1024 * 1024) return toast("O arquivo precisa ter no máximo 1 MB neste sistema.");
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
  if (selectedType() !== "coffee") return renderCattleReadOnly();
  setHeader("CAMPO", "Meu trabalho hoje");
  farm.talhoes = Array.isArray(farm.talhoes) ? farm.talhoes : [];
  const existing = todayAssignment();
  const busyT = new Set(farm.assignments.filter(a => a.date === todayISO() && a.user !== currentUser.username).map(a => a.tractorId).filter(Boolean));
  const busyI = new Set(farm.assignments.filter(a => a.date === todayISO() && a.user !== currentUser.username).map(a => a.implementId).filter(Boolean));
  const tractors = farm.tractors.filter(t => t.status === "Disponível" && !busyT.has(t.id));
  const implementsList = farm.implements.filter(i => i.status === "Disponível" && !busyI.has(i.id));
  const requiresEquipment = currentUser.function === "Tratorista";
  const selectedPlots = existing?.talhaoNames || [];
  $("#pageContent").innerHTML = `<div class="assignment-hero"><div><span class="eyebrow">RESPONSABILIDADE DO DIA • ${escapeHTML(currentUser.function || "Campo")}</span><h2>${existing ? "Trabalho do dia confirmado." : "Escolha seu trabalho do dia."}</h2><p>Selecione a atividade, um ou mais talhões e os equipamentos sob sua responsabilidade.</p></div><div class="assignment-status"><strong>${dateBR(todayISO())}</strong></div></div>${existing ? `<div class="grid two" style="margin-top:18px"><div class="card"><h3>Talhão(ões)</h3><h2 style="font-size:22px">${escapeHTML(selectedPlots.join(", ") || "—")}</h2></div><div class="card"><h3>Função</h3><h2 style="font-size:22px">${escapeHTML(existing.userFunction || currentUser.function || "Campo")}</h2></div><div class="card"><h3>Trator</h3><h2>${escapeHTML(existing.tractorName || "Não selecionado")}</h2></div><div class="card"><h3>Implemento</h3><h2>${escapeHTML(existing.implementName || "Não selecionado")}</h2></div></div><div class="card" style="margin-top:18px"><b>Atividade:</b> ${escapeHTML(existing.activity)}<div class="form-actions"><button id="changeAssignment" class="btn">Alterar</button></div></div>` : `<form id="assignmentForm"><div class="form-card"><label style="margin:0">Atividade<input name="activity" required placeholder="Ex.: roçada, aplicação, colheita, limpeza..."></label></div><div class="section-head"><div><h2>Talhão</h2><p>Escolha um ou mais talhões.</p></div></div><div class="grid three">${farm.talhoes.length ? farm.talhoes.map(t => `<label class="equipment-pick"><span><strong>${escapeHTML(t.name)}</strong><span>Selecionar talhão</span></span><input type="checkbox" name="talhoes" value="${t.id}"></label>`).join("") : `<div class="card empty">Nenhum talhão cadastrado. Peça ao CEO para cadastrar os talhões desta fazenda.</div>`}</div><div class="section-head"><div><h2>Trator</h2><p>${requiresEquipment ? "Obrigatório para Tratorista." : "Opcional para função Campo."}</p></div></div><div class="grid two">${tractors.map(t => `<label class="equipment-pick"><span><strong>${escapeHTML(t.name)}</strong><span>${escapeHTML(t.model || "")}</span></span><input type="radio" name="tractor" value="${t.id}" ${requiresEquipment ? "required" : ""}></label>`).join("") || `<div class="card empty">Nenhum trator disponível.</div>`}</div><div class="section-head"><div><h2>Implemento</h2><p>${requiresEquipment ? "Obrigatório para Tratorista." : "Opcional para função Campo."}</p></div></div><div class="grid two">${implementsList.map(i => `<label class="equipment-pick"><span><strong>${escapeHTML(i.name)}</strong><span>${escapeHTML(i.category || "")}</span></span><input type="radio" name="implement" value="${i.id}" ${requiresEquipment ? "required" : ""}></label>`).join("") || `<div class="card empty">Nenhum implemento disponível.</div>`}</div><div class="form-actions"><button class="btn primary">Confirmar responsabilidade</button></div></form>`}`;
  if (existing) {
    $("#changeAssignment").onclick = () => { farm.assignments = farm.assignments.filter(a => !(a.user === currentUser.username && a.date === todayISO())); saveData(); renderContributorDay(); };
  } else if ($("#assignmentForm")) {
    $("#assignmentForm").onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const talhaoIds = f.getAll("talhoes");
      if (!talhaoIds.length) return toast("Escolha pelo menos um talhão.");
      const talhaoNames = talhaoIds.map(id => farm.talhoes.find(t => t.id === id)?.name).filter(Boolean);
      const tractor = farm.tractors.find(x => x.id === f.get("tractor"));
      const implemento = farm.implements.find(x => x.id === f.get("implement"));
      if (requiresEquipment && (!tractor || !implemento)) return toast("Tratorista precisa escolher um trator e um implemento.");
      const assignment = { id: uid(), date: todayISO(), user: currentUser.username, userName: currentUser.name, userFunction: currentUser.function || "Campo", activity: f.get("activity"), talhaoIds, talhaoNames, tractorId: tractor?.id || "", tractorName: tractor?.name || "", implementId: implemento?.id || "", implementName: implemento?.name || "" };
      farm.assignments.push(assignment);
      farm.equipmentLogs = Array.isArray(farm.equipmentLogs) ? farm.equipmentLogs : [];
      farm.equipmentLogs.push({ ...assignment, id: uid(), assignmentId: assignment.id, loggedAt: new Date().toISOString() });
      saveData(); renderContributorDay();
    };
  }
}

function renderContributorEquipment() {
  const farm = activeFarm();
  setHeader("CAMPO", "Equipamentos disponíveis");
  $("#pageContent").innerHTML = `<div class="section-head" style="margin-top:0"><h2>Tratores</h2></div><div class="grid three">${farm.tractors.filter(x => x.status === "Disponível").map(t => `<div class="card"><span class="badge green">Disponível</span><h3 style="margin-top:12px">${escapeHTML(t.name)}</h3><p class="muted">${escapeHTML(t.model || "")}</p></div>`).join("") || `<div class="card empty">Nenhum.</div>`}</div><div class="section-head"><h2>Implementos</h2></div><div class="grid three">${farm.implements.filter(x => x.status === "Disponível").map(i => `<div class="card"><span class="badge green">Disponível</span><h3 style="margin-top:12px">${escapeHTML(i.name)}</h3><p class="muted">${escapeHTML(i.category || "")}</p></div>`).join("") || `<div class="card empty">Nenhum.</div>`}</div>`;
}

window.addEventListener("storage", event => {
  if (event.key !== cacheStorageKey(currentGroup?.slug || "") || !event.newValue || !currentUser) return;
  try {
    const username = currentUser.username;
    data = migrateData(JSON.parse(event.newValue));
    const refreshed = data.users.find(u => u.username === username && u.active !== false);
    if (!refreshed) { logout(); return; }
    currentUser = refreshed;
    if (currentUser.role === "contribuinte") activeFarmId = preferredFarmForUser(currentUser);
    renderFarmSelector();
    renderNav();
    renderPage();
  } catch (_) {}
});

$("#showLoginBtn").onclick = () => showAuthMode("login");
$("#showRegisterBtn").onclick = () => showAuthMode("register");
$("#loginForm").onsubmit = async e => {
  e.preventDefault();
  const btn = e.submitter || $("#loginForm button[type=submit]");
  if (btn) { btn.disabled = true; btn.textContent = "Entrando..."; }
  await login($("#loginGroup").value, $("#loginUser").value, $("#loginPassword").value);
  if (btn) { btn.disabled = false; btn.textContent = "Entrar no sistema"; }
};
$("#registerForm").onsubmit = async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const btn = e.submitter || $("#registerForm button[type=submit]");
  if (btn) { btn.disabled = true; btn.textContent = "Enviando..."; }
  await createPendingRegistration(Object.fromEntries(f.entries()));
  if (btn) { btn.disabled = false; btn.textContent = "Enviar solicitação"; }
};

$("#forgotPasswordBtn").onclick = () => showPasswordRecovery("request");
$$('.back-login').forEach(btn => btn.onclick = () => { passwordResetContext = null; showAuthMode("login"); });
$("#forgotForm").onsubmit = async e => {
  e.preventDefault();
  const btn = e.submitter || $("#forgotForm button[type=submit]");
  const ctx = { groupCode: $("#forgotGroup").value.replace(/\D/g, ""), username: $("#forgotUser").value.trim(), email: $("#forgotEmail").value.trim().toLowerCase() };
  if (btn) { btn.disabled = true; btn.textContent = "Enviando..."; }
  try {
    const result = await api("/api/auth/password-reset/request", { method: "POST", body: JSON.stringify(ctx) });
    passwordResetContext = ctx;
    $("#resetEmailNote").textContent = result.email ? `Código enviado para ${result.email}.` : "Se os dados conferirem, o código foi enviado para o e-mail cadastrado.";
    $("#resetCode").value = result.testCode || "";
    showPasswordRecovery("confirm");
    toast(result.testCode ? `Modo teste: código ${result.testCode}` : "Confira seu e-mail para continuar.");
  } catch (error) { toast(error.message || "Não foi possível enviar o código."); }
  finally { if (btn) { btn.disabled = false; btn.textContent = "Enviar código"; } }
};
$("#resetForm").onsubmit = async e => {
  e.preventDefault();
  if (!passwordResetContext) return showPasswordRecovery("request");
  const password = $("#resetPassword").value;
  const confirmPassword = $("#resetPasswordConfirm").value;
  if (password !== confirmPassword) return toast("As duas senhas precisam ser iguais.");
  const btn = e.submitter || $("#resetForm button[type=submit]");
  if (btn) { btn.disabled = true; btn.textContent = "Alterando..."; }
  try {
    const result = await api("/api/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ ...passwordResetContext, code: $("#resetCode").value, newPassword: password }) });
    $("#loginGroup").value = passwordResetContext.groupCode;
    $("#loginUser").value = passwordResetContext.username;
    passwordResetContext = null;
    $("#resetForm").reset();
    showAuthMode("login");
    toast(result.message || "Senha alterada com sucesso.");
  } catch (error) { toast(error.message || "Não foi possível alterar a senha."); }
  finally { if (btn) { btn.disabled = false; btn.textContent = "Alterar senha"; } }
};

const registerRole = $("#registerRole");
const registerFunctionWrap = $("#registerFunctionWrap");
const registerFunction = $("#registerFunction");
function syncRegisterFields() {
  if (!registerRole || !registerFunctionWrap || !registerFunction) return;
  const contributor = registerRole.value === "contribuinte";
  registerFunctionWrap.classList.toggle("hidden", !contributor);
  registerFunction.disabled = !contributor;
  registerFunction.required = contributor;
  if (!contributor) registerFunction.value = "";
}
if (registerRole) registerRole.onchange = syncRegisterFields;
syncRegisterFields();
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
