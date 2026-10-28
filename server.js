const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATABASE_URL = process.env.DATABASE_URL || "";
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30);
const LOCAL_DB_PATH = path.join(__dirname, ".local-cloud.json");
const SEED_GROUP_SLUG = process.env.SEED_GROUP_SLUG || "grupo-fagundes-miari";
const SEED_GROUP_CODE = String(process.env.SEED_GROUP_CODE || "1001").replace(/\D/g, "") || "1001";
const SEED_GROUP_NAME = process.env.SEED_GROUP_NAME || "Grupo Fagundes Miari";
const SEED_CEO_NAME = process.env.SEED_CEO_NAME || "Jacques Miari";
const SEED_CEO_USER = process.env.SEED_CEO_USER || "jacquesmiari";
const SEED_CEO_PASSWORD = process.env.SEED_CEO_PASSWORD || "05091722";
const SEED_CEO_EMAIL = String(process.env.SEED_CEO_EMAIL || "").trim().toLowerCase();
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
const PLAN_PRICE = Number(process.env.PLAN_PRICE || 199.9);
const PLAN_NAME = process.env.PLAN_NAME || "Gestão Rural Pro";
const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
const MP_PLAN_ID = process.env.MERCADOPAGO_PLAN_ID || "";
const PLATFORM_SETUP_KEY = process.env.PLATFORM_SETUP_KEY || "";
const TEST_PURCHASE_MODE = String(process.env.TEST_PURCHASE_MODE || "").toLowerCase() === "true";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const PASSWORD_RESET_FROM = process.env.PASSWORD_RESET_FROM || "Gestão Rural <onboarding@resend.dev>";
const PASSWORD_RESET_MINUTES = Math.max(5, Number(process.env.PASSWORD_RESET_MINUTES || 10));

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true }));

const clone = v => JSON.parse(JSON.stringify(v));
const nowIso = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
const slugify = value => String(value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const tokenHash = token => crypto.createHash("sha256").update(token).digest("hex");
const cleanGroupCode = value => String(value || "").replace(/\D/g, "").slice(0, 8);

function makeFarm(name) {
  return {
    id: uid(), name, type: "mixed", photo: "", tractors: [], implements: [], stock: [], finances: [], notes: [],
    assignments: [], equipmentLogs: [], talhoes: [], banho: { products: [], orders: [] }, cattle: { lots: [], weighings: [] }
  };
}

function makeDefaultState({ ceoName, ceoUser, ceoPasswordHash, ceoEmail = "" }) {
  return {
    version: 21,
    interfaceMode: "coffee",
    users: [{
      id: uid(), username: ceoUser, passwordHash: ceoPasswordHash, name: ceoName, email: String(ceoEmail || "").trim().toLowerCase(),
      role: "ceo", active: true, function: "CEO", pixKey: "", allowedFarmId: "", allowedActivity: "both",
      createdAt: nowIso(), createdBy: "sistema"
    }],
    pendingRegistrations: [],
    farms: [makeFarm("Fazenda Santa Clara"), makeFarm("Fazenda Boa Vista"), makeFarm("Fazenda Monte Verde"), makeFarm("Fazenda São Bento")],
    receipts: []
  };
}

function sanitizeState(state) {
  const out = clone(state || {});
  for (const u of out.users || []) {
    delete u.password;
    delete u.passwordHash;
  }
  for (const r of out.pendingRegistrations || []) {
    delete r.password;
    delete r.passwordHash;
  }
  return out;
}

async function normalizeSecrets(incoming, existing = null) {
  const next = clone(incoming || {});
  next.version = 21;
  next.users = Array.isArray(next.users) ? next.users : [];
  next.pendingRegistrations = Array.isArray(next.pendingRegistrations) ? next.pendingRegistrations : [];
  const oldUsers = new Map((existing?.users || []).map(u => [String(u.id || u.username).toLowerCase(), u]));
  const oldRegs = new Map((existing?.pendingRegistrations || []).map(r => [String(r.id || r.username).toLowerCase(), r]));

  for (const u of next.users) {
    const key = String(u.id || u.username).toLowerCase();
    const old = oldUsers.get(key);
    if (!u.email && old?.email) u.email = old.email;
    if (u.password) {
      u.passwordHash = await bcrypt.hash(String(u.password), 11);
      delete u.password;
    } else if (!u.passwordHash && old?.passwordHash) {
      u.passwordHash = old.passwordHash;
    } else if (!u.passwordHash && old?.password) {
      u.passwordHash = await bcrypt.hash(String(old.password), 11);
    }
  }

  for (const r of next.pendingRegistrations) {
    const key = String(r.id || r.username).toLowerCase();
    const old = oldRegs.get(key);
    if (!r.email && old?.email) r.email = old.email;
    if (r.password) {
      r.passwordHash = await bcrypt.hash(String(r.password), 11);
      delete r.password;
    } else if (!r.passwordHash && old?.passwordHash) {
      r.passwordHash = old.passwordHash;
    } else if (!r.passwordHash && old?.password) {
      r.passwordHash = await bcrypt.hash(String(old.password), 11);
    }
  }
  return next;
}

class LocalStore {
  constructor(file) { this.file = file; this.data = { groups: [], sessions: [], purchases: [], passwordResets: [], config: {} }; }
  async init() {
    if (fs.existsSync(this.file)) {
      try { this.data = JSON.parse(fs.readFileSync(this.file, "utf8")); } catch (_) {}
    }
    this.data.groups ||= []; this.data.sessions ||= []; this.data.purchases ||= []; this.data.passwordResets ||= []; this.data.config ||= {};
    this.flush();
  }
  flush() { fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2)); }
  async getGroupBySlug(slug) { return clone(this.data.groups.find(g => g.slug === slug) || null); }
  async getGroupByCode(code) { return clone(this.data.groups.find(g => String(g.code || "") === String(code || "")) || null); }
  async getGroupById(id) { return clone(this.data.groups.find(g => g.id === id) || null); }
  async createGroup(group) { this.data.groups.push(clone(group)); this.flush(); return clone(group); }
  async saveGroup(group) {
    const i = this.data.groups.findIndex(g => g.id === group.id);
    if (i >= 0) this.data.groups[i] = clone(group); else this.data.groups.push(clone(group));
    this.flush(); return clone(group);
  }
  async listGroups() { return clone(this.data.groups); }
  async deleteGroup(id) {
    this.data.groups = this.data.groups.filter(g => g.id !== id);
    this.data.sessions = this.data.sessions.filter(s => s.groupId !== id);
    this.data.passwordResets = this.data.passwordResets.filter(r => r.groupId !== id);
    this.data.purchases = this.data.purchases.map(p => p.groupId === id ? { ...p, groupId: null } : p);
    this.flush();
  }
  async createSession(session) { this.data.sessions.push(clone(session)); this.flush(); }
  async getSession(hash) {
    const s = this.data.sessions.find(x => x.tokenHash === hash && new Date(x.expiresAt) > new Date());
    return clone(s || null);
  }
  async deleteSession(hash) { this.data.sessions = this.data.sessions.filter(s => s.tokenHash !== hash); this.flush(); }
  async deleteSessionsForUser(groupId, userId) { this.data.sessions = this.data.sessions.filter(s => !(s.groupId === groupId && String(s.userId) === String(userId))); this.flush(); }
  async pruneSessions() { this.data.sessions = this.data.sessions.filter(s => new Date(s.expiresAt) > new Date()); this.flush(); }

  async createPurchase(purchase) { this.data.purchases.push(clone(purchase)); this.flush(); return clone(purchase); }
  async getPurchaseById(id) { return clone(this.data.purchases.find(p => p.id === id) || null); }
  async getPurchaseBySubscription(id) { return clone(this.data.purchases.find(p => p.subscriptionId === id) || null); }
  async savePurchase(purchase) { const i=this.data.purchases.findIndex(p=>p.id===purchase.id); if(i>=0)this.data.purchases[i]=clone(purchase); else this.data.purchases.push(clone(purchase)); this.flush(); return clone(purchase); }
  async getGroupBySubscription(id) { return clone(this.data.groups.find(g => g.subscriptionId === id) || null); }
  async createPasswordReset(r) { this.data.passwordResets.push(clone(r)); this.flush(); return clone(r); }
  async findPasswordReset(groupId, userId, email) {
    const matches = this.data.passwordResets.filter(r => r.groupId === groupId && String(r.userId) === String(userId) && String(r.email).toLowerCase() === String(email).toLowerCase() && !r.usedAt);
    matches.sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return clone(matches[0] || null);
  }
  async savePasswordReset(r) { const i=this.data.passwordResets.findIndex(x=>x.id===r.id); if(i>=0)this.data.passwordResets[i]=clone(r); else this.data.passwordResets.push(clone(r)); this.flush(); return clone(r); }
  async deletePasswordResetsForUser(groupId, userId) { this.data.passwordResets = this.data.passwordResets.filter(r => !(r.groupId === groupId && String(r.userId) === String(userId))); this.flush(); }
  async getConfig(key) { return clone(this.data.config[key] ?? null); }
  async setConfig(key, value) { this.data.config[key] = clone(value); this.flush(); }
}

class PgStore {
  constructor(url) {
    this.pool = new Pool({ connectionString: url, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
  }
  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tenant_groups (
        id UUID PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        code TEXT,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        plan TEXT NOT NULL DEFAULT 'pro',
        state JSONB NOT NULL,
        cloud_initialized BOOLEAN NOT NULL DEFAULT FALSE,
        subscription_id TEXT,
        payer_email TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE tenant_groups ADD COLUMN IF NOT EXISTS code TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS tenant_groups_code_unique ON tenant_groups(code) WHERE code IS NOT NULL;
      CREATE TABLE IF NOT EXISTS app_sessions (
        token_hash TEXT PRIMARY KEY,
        group_id UUID NOT NULL REFERENCES tenant_groups(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS platform_config (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS purchases (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'created',
        subscription_id TEXT,
        used_at TIMESTAMPTZ,
        group_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS password_reset_codes (
        id UUID PRIMARY KEY,
        group_id UUID NOT NULL REFERENCES tenant_groups(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS password_reset_lookup_idx ON password_reset_codes(group_id,user_id,email,created_at DESC);
    `);
  }
  row(r) {
    if (!r) return null;
    return {
      id: r.id, slug: r.slug, code: r.code, name: r.name, status: r.status, plan: r.plan, state: r.state,
      cloudInitialized: r.cloud_initialized, subscriptionId: r.subscription_id, payerEmail: r.payer_email,
      createdAt: r.created_at, updatedAt: r.updated_at
    };
  }
  async getGroupBySlug(slug) { const { rows } = await this.pool.query("SELECT * FROM tenant_groups WHERE slug=$1", [slug]); return this.row(rows[0]); }
  async getGroupByCode(code) { const { rows } = await this.pool.query("SELECT * FROM tenant_groups WHERE code=$1", [String(code)]); return this.row(rows[0]); }
  async getGroupById(id) { const { rows } = await this.pool.query("SELECT * FROM tenant_groups WHERE id=$1", [id]); return this.row(rows[0]); }
  async createGroup(g) {
    const { rows } = await this.pool.query(`INSERT INTO tenant_groups(id,slug,code,name,status,plan,state,cloud_initialized,subscription_id,payer_email)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, [g.id,g.slug,g.code||null,g.name,g.status,g.plan,g.state,g.cloudInitialized,g.subscriptionId||null,g.payerEmail||null]);
    return this.row(rows[0]);
  }
  async saveGroup(g) {
    const { rows } = await this.pool.query(`UPDATE tenant_groups SET code=$2,name=$3,status=$4,plan=$5,state=$6,cloud_initialized=$7,subscription_id=$8,payer_email=$9,updated_at=now() WHERE id=$1 RETURNING *`,
      [g.id,g.code||null,g.name,g.status,g.plan,g.state,g.cloudInitialized,g.subscriptionId||null,g.payerEmail||null]);
    return this.row(rows[0]);
  }
  async listGroups() { const { rows } = await this.pool.query("SELECT * FROM tenant_groups ORDER BY created_at DESC"); return rows.map(r => this.row(r)); }
  async deleteGroup(id) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE purchases SET group_id=NULL, updated_at=now() WHERE group_id=$1", [id]);
      await client.query("DELETE FROM tenant_groups WHERE id=$1", [id]);
      await client.query("COMMIT");
    } catch (e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
  }
  async createSession(s) { await this.pool.query("INSERT INTO app_sessions(token_hash,group_id,user_id,expires_at) VALUES($1,$2,$3,$4)", [s.tokenHash,s.groupId,s.userId,s.expiresAt]); }
  async getSession(hash) { const { rows } = await this.pool.query("SELECT * FROM app_sessions WHERE token_hash=$1 AND expires_at>now()", [hash]); return rows[0] ? { tokenHash: rows[0].token_hash, groupId: rows[0].group_id, userId: rows[0].user_id, expiresAt: rows[0].expires_at } : null; }
  async deleteSession(hash) { await this.pool.query("DELETE FROM app_sessions WHERE token_hash=$1", [hash]); }
  async deleteSessionsForUser(groupId, userId) { await this.pool.query("DELETE FROM app_sessions WHERE group_id=$1 AND user_id=$2", [groupId, String(userId)]); }
  async pruneSessions() { await this.pool.query("DELETE FROM app_sessions WHERE expires_at<=now()"); }

  async createPurchase(p) { const {rows}=await this.pool.query(`INSERT INTO purchases(id,email,status,subscription_id,used_at,group_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,[p.id,p.email,p.status,p.subscriptionId||null,p.usedAt||null,p.groupId||null]); return this.purchaseRow(rows[0]); }
  purchaseRow(r){ if(!r)return null; return {id:r.id,email:r.email,status:r.status,subscriptionId:r.subscription_id,usedAt:r.used_at,groupId:r.group_id,createdAt:r.created_at,updatedAt:r.updated_at}; }
  async getPurchaseById(id){ const {rows}=await this.pool.query("SELECT * FROM purchases WHERE id=$1",[id]); return this.purchaseRow(rows[0]); }
  async getPurchaseBySubscription(id){ const {rows}=await this.pool.query("SELECT * FROM purchases WHERE subscription_id=$1",[id]); return this.purchaseRow(rows[0]); }
  async savePurchase(p){ const {rows}=await this.pool.query(`UPDATE purchases SET email=$2,status=$3,subscription_id=$4,used_at=$5,group_id=$6,updated_at=now() WHERE id=$1 RETURNING *`,[p.id,p.email,p.status,p.subscriptionId||null,p.usedAt||null,p.groupId||null]); return this.purchaseRow(rows[0]); }
  async getGroupBySubscription(id){ const {rows}=await this.pool.query("SELECT * FROM tenant_groups WHERE subscription_id=$1",[id]); return this.row(rows[0]); }
  async createPasswordReset(r) { await this.pool.query(`INSERT INTO password_reset_codes(id,group_id,user_id,email,code_hash,expires_at,attempts,used_at,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [r.id,r.groupId,String(r.userId),r.email,r.codeHash,r.expiresAt,r.attempts||0,r.usedAt||null,r.createdAt||nowIso()]); return r; }
  async findPasswordReset(groupId, userId, email) { const {rows}=await this.pool.query(`SELECT * FROM password_reset_codes WHERE group_id=$1 AND user_id=$2 AND lower(email)=lower($3) AND used_at IS NULL ORDER BY created_at DESC LIMIT 1`,[groupId,String(userId),email]); const r=rows[0]; return r?{id:r.id,groupId:r.group_id,userId:r.user_id,email:r.email,codeHash:r.code_hash,expiresAt:r.expires_at,attempts:r.attempts,usedAt:r.used_at,createdAt:r.created_at}:null; }
  async savePasswordReset(r) { await this.pool.query(`UPDATE password_reset_codes SET code_hash=$2,expires_at=$3,attempts=$4,used_at=$5 WHERE id=$1`,[r.id,r.codeHash,r.expiresAt,r.attempts||0,r.usedAt||null]); return r; }
  async deletePasswordResetsForUser(groupId, userId) { await this.pool.query("DELETE FROM password_reset_codes WHERE group_id=$1 AND user_id=$2",[groupId,String(userId)]); }
  async getConfig(key) { const { rows } = await this.pool.query("SELECT value FROM platform_config WHERE key=$1", [key]); return rows[0]?.value ?? null; }
  async setConfig(key, value) { await this.pool.query(`INSERT INTO platform_config(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`, [key, value]); }
}

const store = DATABASE_URL ? new PgStore(DATABASE_URL) : new LocalStore(LOCAL_DB_PATH);

async function allocateGroupCode(preferred = "") {
  const cleaned = cleanGroupCode(preferred);
  if (cleaned && cleaned.length >= 4 && !(await store.getGroupByCode(cleaned))) return cleaned;
  for (let i = 0; i < 200; i++) {
    const code = String(1000 + crypto.randomInt(0, 9000));
    if (!(await store.getGroupByCode(code))) return code;
  }
  for (let i = 0; i < 200; i++) {
    const code = String(100000 + crypto.randomInt(0, 900000));
    if (!(await store.getGroupByCode(code))) return code;
  }
  throw new Error("Não foi possível gerar um Código de Grupo disponível");
}

async function ensureExistingGroupCodes() {
  const groups = await store.listGroups();
  for (const group of groups) {
    if (cleanGroupCode(group.code).length >= 4) continue;
    group.code = await allocateGroupCode(group.slug === SEED_GROUP_SLUG ? SEED_GROUP_CODE : "");
    await store.saveGroup(group);
  }
}

async function ensureSeedGroup() {
  let group = await store.getGroupBySlug(SEED_GROUP_SLUG);
  if (group) {
    let changed = false;
    if (!cleanGroupCode(group.code)) { group.code = await allocateGroupCode(SEED_GROUP_CODE); changed = true; }
    const seedCeo = (group.state?.users || []).find(u => u.role === "ceo");
    if (SEED_CEO_EMAIL && seedCeo && !seedCeo.email) { seedCeo.email = SEED_CEO_EMAIL; changed = true; }
    if (changed) await store.saveGroup(group);
    return group;
  }
  const hash = await bcrypt.hash(SEED_CEO_PASSWORD, 11);
  group = {
    id: uid(), slug: SEED_GROUP_SLUG, code: await allocateGroupCode(SEED_GROUP_CODE), name: SEED_GROUP_NAME, status: "active", plan: "pro",
    state: makeDefaultState({ ceoName: SEED_CEO_NAME, ceoUser: SEED_CEO_USER, ceoPasswordHash: hash, ceoEmail: SEED_CEO_EMAIL }),
    cloudInitialized: false, subscriptionId: null, payerEmail: null, createdAt: nowIso(), updatedAt: nowIso()
  };
  return store.createGroup(group);
}

async function auth(req, res, next) {
  try {
    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Sessão não informada" });
    const session = await store.getSession(tokenHash(token));
    if (!session) return res.status(401).json({ error: "Sessão expirada" });
    const group = await store.getGroupById(session.groupId);
    if (!group) return res.status(401).json({ error: "Grupo não encontrado" });
    if (group.status !== "active") return res.status(403).json({ error: "Acesso do grupo suspenso", status: group.status });
    const user = (group.state.users || []).find(u => String(u.id) === String(session.userId) && u.active !== false);
    if (!user) return res.status(401).json({ error: "Usuário desativado" });
    req.auth = { token, session, group, user };
    next();
  } catch (error) { next(error); }
}

function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.auth?.user?.role) ? next() : res.status(403).json({ error: "Sem permissão" });
}

async function saveStateForGroup(group, incoming) {
  group.state = await normalizeSecrets(incoming, group.state);
  group.updatedAt = nowIso();
  return store.saveGroup(group);
}

function validateUsername(username) { return /^[a-zA-Z0-9._-]{3,30}$/.test(String(username || "")); }
function normalizeEmail(email) { return String(email || "").trim().toLowerCase(); }
function validateEmail(email) { return /^\S+@\S+\.\S+$/.test(normalizeEmail(email)); }
function maskEmail(email) { return normalizeEmail(email).replace(/(^.).*(@.*$)/, "$1***$2"); }
function escapeEmailHtml(value) { return String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }
async function sendPasswordResetEmail({ to, code, groupName }) {
  if (!RESEND_API_KEY) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: PASSWORD_RESET_FROM,
      to: [to],
      subject: "Código para redefinir sua senha — Gestão Rural",
      html: `<div style="font-family:Arial,sans-serif;color:#171815;line-height:1.5"><h2>Redefinição de senha</h2><p>Recebemos uma solicitação para redefinir sua senha no <b>${escapeEmailHtml(groupName)}</b>.</p><p>Seu código é:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:18px 0">${code}</div><p>O código vence em ${PASSWORD_RESET_MINUTES} minutos. Se você não fez essa solicitação, ignore este e-mail.</p></div>`
    })
  });
  if (!response.ok) { const detail = await response.text().catch(() => ""); throw new Error(`Falha ao enviar e-mail (${response.status}) ${detail.slice(0,160)}`); }
  return true;
}
const passwordResetRequestTimes = new Map();

app.get("/api/health", (req, res) => res.json({ ok: true, storage: DATABASE_URL ? "postgres" : "local", version: "21.2" }));

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const groupInput = String(req.body.groupCode || req.body.groupSlug || req.body.group || SEED_GROUP_CODE).trim();
    const groupCode = cleanGroupCode(groupInput);
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const group = groupCode.length >= 4 ? await store.getGroupByCode(groupCode) : await store.getGroupBySlug(slugify(groupInput));
    if (!group || group.status !== "active") return res.status(401).json({ error: "Código do Grupo, usuário ou senha incorretos" });
    const user = (group.state.users || []).find(u => String(u.username || "").toLowerCase() === username && u.active !== false);
    if (!user) return res.status(401).json({ error: "Código do Grupo, usuário ou senha incorretos" });
    let ok = false;
    if (user.passwordHash) ok = await bcrypt.compare(password, user.passwordHash);
    else if (user.password) {
      ok = user.password === password;
      if (ok) { user.passwordHash = await bcrypt.hash(password, 11); delete user.password; await store.saveGroup(group); }
    }
    if (!ok) return res.status(401).json({ error: "Código do Grupo, usuário ou senha incorretos" });
    const token = crypto.randomBytes(36).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
    await store.createSession({ tokenHash: tokenHash(token), groupId: group.id, userId: user.id, expiresAt });
    res.json({ token, expiresAt, group: { id: group.id, slug: group.slug, code: group.code, name: group.name, plan: group.plan, status: group.status, cloudInitialized: group.cloudInitialized }, user: sanitizeState({ users: [user] }).users[0] });
  } catch (e) { next(e); }
});

app.post("/api/auth/password-reset/request", async (req, res, next) => {
  try {
    const groupCode = cleanGroupCode(req.body.groupCode || req.body.group || "");
    const username = String(req.body.username || "").trim().toLowerCase();
    const email = normalizeEmail(req.body.email);
    if (groupCode.length < 4 || !validateUsername(username) || !validateEmail(email)) return res.status(400).json({ error: "Confira Código do Grupo, usuário e e-mail" });
    if (!TEST_PURCHASE_MODE && !RESEND_API_KEY) return res.status(503).json({ error: "Recuperação por e-mail ainda não configurada no servidor" });

    const rateKey = `${req.ip}|${groupCode}|${username}`;
    const last = passwordResetRequestTimes.get(rateKey) || 0;
    const generic = { ok: true, message: "Se os dados conferirem, enviaremos um código para o e-mail cadastrado." };
    if (Date.now() - last < 60_000) return res.json(generic);
    passwordResetRequestTimes.set(rateKey, Date.now());

    const group = await store.getGroupByCode(groupCode);
    const user = group?.status === "active" ? (group.state.users || []).find(u => String(u.username || "").toLowerCase() === username && u.active !== false) : null;
    const registeredEmail = normalizeEmail(user?.email || (user?.role === "ceo" ? group?.payerEmail : ""));
    if (!group || !user || !registeredEmail || registeredEmail !== email) return res.json(generic);

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    await store.deletePasswordResetsForUser(group.id, user.id);
    const reset = { id: uid(), groupId: group.id, userId: user.id, email, codeHash: await bcrypt.hash(code, 10), expiresAt: new Date(Date.now() + PASSWORD_RESET_MINUTES * 60_000).toISOString(), attempts: 0, usedAt: null, createdAt: nowIso() };
    await store.createPasswordReset(reset);
    let sent = false;
    if (RESEND_API_KEY) { try { sent = await sendPasswordResetEmail({ to: email, code, groupName: group.name }); } catch (mailError) { console.error("Falha no e-mail de recuperação:", mailError.message); } }
    if (!sent && !TEST_PURCHASE_MODE) return res.status(503).json({ error: "Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos." });
    res.json({ ...generic, email: maskEmail(email), ...(TEST_PURCHASE_MODE ? { testCode: code } : {}) });
  } catch (e) { next(e); }
});

app.post("/api/auth/password-reset/confirm", async (req, res, next) => {
  try {
    const groupCode = cleanGroupCode(req.body.groupCode || "");
    const username = String(req.body.username || "").trim().toLowerCase();
    const email = normalizeEmail(req.body.email);
    const code = String(req.body.code || "").replace(/\D/g, "").slice(0, 6);
    const newPassword = String(req.body.newPassword || "");
    if (newPassword.length < 8) return res.status(400).json({ error: "A nova senha precisa ter pelo menos 8 caracteres" });
    if (code.length !== 6) return res.status(400).json({ error: "Informe o código de 6 dígitos" });

    const group = await store.getGroupByCode(groupCode);
    const user = group?.status === "active" ? (group.state.users || []).find(u => String(u.username || "").toLowerCase() === username && u.active !== false) : null;
    const registeredEmail = normalizeEmail(user?.email || (user?.role === "ceo" ? group?.payerEmail : ""));
    if (!group || !user || registeredEmail !== email) return res.status(400).json({ error: "Código inválido ou expirado" });
    const reset = await store.findPasswordReset(group.id, user.id, email);
    if (!reset || reset.usedAt || new Date(reset.expiresAt).getTime() < Date.now() || Number(reset.attempts || 0) >= 5) return res.status(400).json({ error: "Código inválido ou expirado" });
    const ok = await bcrypt.compare(code, reset.codeHash);
    if (!ok) { reset.attempts = Number(reset.attempts || 0) + 1; await store.savePasswordReset(reset); return res.status(400).json({ error: "Código inválido ou expirado" }); }

    user.passwordHash = await bcrypt.hash(newPassword, 11);
    delete user.password;
    reset.usedAt = nowIso();
    await store.savePasswordReset(reset);
    await store.saveGroup(group);
    await store.deleteSessionsForUser(group.id, user.id);
    res.json({ ok: true, message: "Senha alterada com sucesso. Entre novamente com a nova senha." });
  } catch (e) { next(e); }
});

app.post("/api/auth/logout", auth, async (req, res, next) => {
  try { await store.deleteSession(tokenHash(req.auth.token)); res.json({ ok: true }); } catch (e) { next(e); }
});

app.post("/api/auth/register-request", async (req, res, next) => {
  try {
    const groupInput = String(req.body.groupCode || req.body.groupSlug || req.body.group || "").trim();
    const groupCode = cleanGroupCode(groupInput);
    const group = groupCode.length >= 4 ? await store.getGroupByCode(groupCode) : await store.getGroupBySlug(slugify(groupInput));
    if (!group || group.status !== "active") return res.status(404).json({ error: "Código do Grupo não encontrado" });
    const name = String(req.body.name || "").trim();
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    const email = normalizeEmail(req.body.email);
    const role = req.body.role === "adm" ? "adm" : "contribuinte";
    let workerFunction = String(req.body.function || "").trim();
    if (!name) return res.status(400).json({ error: "Informe o nome" });
    if (!validateEmail(email)) return res.status(400).json({ error: "Informe um e-mail válido" });
    if (!validateUsername(username)) return res.status(400).json({ error: "Usuário inválido" });
    if (password.length < 6) return res.status(400).json({ error: "A senha precisa ter pelo menos 6 caracteres" });
    if (role === "contribuinte" && !["Tratorista","Campo"].includes(workerFunction)) return res.status(400).json({ error: "Selecione Tratorista ou Campo" });
    if (role === "adm") workerFunction = "Administração";
    const all = [...(group.state.users || []), ...(group.state.pendingRegistrations || [])];
    if (all.some(u => String(u.username || "").toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: "Esse usuário já existe ou está pendente" });
    const passwordHash = await bcrypt.hash(password, 11);
    group.state.pendingRegistrations ||= [];
    group.state.pendingRegistrations.push({
      id: uid(), name, username, email, passwordHash, role, function: workerFunction,
      pixKey: String(req.body.pixKey || "").trim(), allowedActivity: role === "contribuinte" ? "both" : "both", createdAt: nowIso()
    });
    await store.saveGroup(group);
    res.json({ ok: true, message: "Solicitação enviada para o CEO" });
  } catch (e) { next(e); }
});

app.get("/api/state", auth, async (req, res) => {
  res.json({
    state: sanitizeState(req.auth.group.state),
    group: { id: req.auth.group.id, slug: req.auth.group.slug, code: req.auth.group.code, name: req.auth.group.name, status: req.auth.group.status, plan: req.auth.group.plan, cloudInitialized: req.auth.group.cloudInitialized },
    userId: req.auth.user.id,
    serverTime: nowIso()
  });
});


function mergeStateByRole(existing, incoming, user) {
  const current = clone(existing);
  const next = clone(incoming);
  if (user.role === "ceo") return next;

  if (user.role === "adm") {
    next.users = current.users;
    next.pendingRegistrations = current.pendingRegistrations;
    next.receipts = current.receipts;
    const incomingFarms = new Map((next.farms || []).map(f => [String(f.id), f]));
    next.farms = (current.farms || []).map(oldFarm => {
      const proposed = incomingFarms.get(String(oldFarm.id));
      if (!proposed) return oldFarm;
      return { ...proposed, id: oldFarm.id, name: oldFarm.name, photo: oldFarm.photo, type: oldFarm.type };
    });
    return next;
  }

  // Contribuinte: servidor aceita apenas suas ações operacionais e seus dados básicos de perfil.
  const result = current;
  const incomingUser = (next.users || []).find(u => String(u.id) === String(user.id));
  const storedUser = (result.users || []).find(u => String(u.id) === String(user.id));
  if (incomingUser && storedUser) {
    storedUser.name = String(incomingUser.name || storedUser.name);
    storedUser.pixKey = String(incomingUser.pixKey || "");
  }

  const farmId = user.allowedFarmId;
  const oldFarm = (result.farms || []).find(f => String(f.id) === String(farmId));
  const proposedFarm = (next.farms || []).find(f => String(f.id) === String(farmId));
  if (!oldFarm || !proposedFarm) return result;

  const keepOthers = (items, field = "user") => (items || []).filter(x => String(x[field] || "") !== String(user.username));
  const mine = (items, field = "user") => (items || []).filter(x => String(x[field] || "") === String(user.username));
  oldFarm.assignments = [...keepOthers(oldFarm.assignments), ...mine(proposedFarm.assignments)];
  oldFarm.equipmentLogs = [...keepOthers(oldFarm.equipmentLogs), ...mine(proposedFarm.equipmentLogs)];

  const proposedOrders = new Map((proposedFarm.banho?.orders || []).map(o => [String(o.id), o]));
  oldFarm.banho ||= { products: [], orders: [] };
  oldFarm.banho.orders = (oldFarm.banho.orders || []).map(order => {
    const proposed = proposedOrders.get(String(order.id));
    if (!proposed) return order;
    const validCompletion = order.status === "released" && proposed.status === "completed" && String(proposed.completedBy || "") === String(user.username);
    if (!validCompletion) return order;
    return {
      ...order,
      status: "completed",
      completedAt: proposed.completedAt || nowIso(),
      completedBy: user.username,
      completedByName: user.name
    };
  });
  return result;
}

app.put("/api/state", auth, async (req, res, next) => {
  try {
    const incoming = req.body.state;
    if (!incoming || typeof incoming !== "object") return res.status(400).json({ error: "Estado inválido" });
    // A separação entre grupos acontece no servidor: um token só consegue gravar seu próprio tenant.
    // As permissões também são reaplicadas no backend; a interface não é a única barreira de acesso.
    const allowedState = mergeStateByRole(req.auth.group.state, incoming, req.auth.user);
    const saved = await saveStateForGroup(req.auth.group, allowedState);
    res.json({ ok: true, state: sanitizeState(saved.state), savedAt: nowIso() });
  } catch (e) { next(e); }
});

app.post("/api/state/import-local", auth, requireRole("ceo"), async (req, res, next) => {
  try {
    const group = req.auth.group;
    if (group.cloudInitialized) return res.status(409).json({ error: "A migração inicial deste grupo já foi concluída" });
    const incoming = req.body.state;
    if (!incoming || typeof incoming !== "object") return res.status(400).json({ error: "Dados locais inválidos" });
    const currentCeo = req.auth.user;
    const normalized = await normalizeSecrets(incoming, group.state);
    normalized.version = 21;
    normalized.users ||= [];
    let importedCeo = normalized.users.find(u => String(u.username || "").toLowerCase() === String(currentCeo.username || "").toLowerCase());
    if (!importedCeo) {
      importedCeo = clone(currentCeo);
      normalized.users.unshift(importedCeo);
    }
    importedCeo.id = currentCeo.id;
    importedCeo.role = "ceo";
    importedCeo.active = true;
    importedCeo.passwordHash = currentCeo.passwordHash;
    importedCeo.email = normalizeEmail(importedCeo.email || currentCeo.email || group.payerEmail);
    delete importedCeo.password;
    group.state = normalized;
    group.cloudInitialized = true;
    const saved = await store.saveGroup(group);
    res.json({ ok: true, state: sanitizeState(saved.state), group: { id: saved.id, slug: saved.slug, code: saved.code, name: saved.name, cloudInitialized: true } });
  } catch (e) { next(e); }
});

app.post("/api/users", auth, requireRole("ceo"), async (req, res, next) => {
  try {
    const group = req.auth.group;
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const email = normalizeEmail(body.email);
    const role = ["ceo","adm","contribuinte"].includes(body.role) ? body.role : "contribuinte";
    let workerFunction = String(body.function || "").trim();
    if (!name || !validateUsername(username) || password.length < 6 || !validateEmail(email)) return res.status(400).json({ error: "Confira nome, e-mail, usuário e senha (mínimo 6 caracteres)" });
    if ((group.state.users || []).some(u => String(u.username || "").toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: "Esse usuário já existe" });
    if (role === "contribuinte" && !["Tratorista","Campo"].includes(workerFunction)) return res.status(400).json({ error: "Selecione Tratorista ou Campo" });
    if (role !== "contribuinte" && !workerFunction) workerFunction = role === "ceo" ? "CEO" : "Administração";
    const user = {
      id: uid(), name, username, email, passwordHash: await bcrypt.hash(password, 11), role, active: true, function: workerFunction,
      pixKey: String(body.pixKey || "").trim(),
      allowedFarmId: role === "contribuinte" ? String(body.allowedFarmId || group.state.farms?.[0]?.id || "") : "",
      allowedActivity: role === "contribuinte" && ["coffee","cattle","both"].includes(body.allowedActivity) ? body.allowedActivity : "both",
      createdAt: nowIso(), createdBy: req.auth.user.username
    };
    group.state.users ||= []; group.state.users.push(user);
    await store.saveGroup(group);
    res.json({ ok: true, user: sanitizeState({ users: [user] }).users[0], state: sanitizeState(group.state) });
  } catch (e) { next(e); }
});

app.post("/api/registrations/:id/approve", auth, requireRole("ceo"), async (req, res, next) => {
  try {
    const group = req.auth.group;
    const regs = group.state.pendingRegistrations || [];
    const reg = regs.find(r => String(r.id) === String(req.params.id));
    if (!reg) return res.status(404).json({ error: "Solicitação não encontrada" });
    if ((group.state.users || []).some(u => String(u.username || "").toLowerCase() === String(reg.username || "").toLowerCase())) return res.status(409).json({ error: "Esse usuário já existe" });
    const role = reg.role === "adm" ? "adm" : "contribuinte";
    const user = {
      id: uid(), name: reg.name, username: reg.username, email: normalizeEmail(reg.email), passwordHash: reg.passwordHash, role, active: true,
      function: role === "contribuinte" ? reg.function : "Administração", pixKey: reg.pixKey || "",
      allowedFarmId: role === "contribuinte" ? String(req.body.allowedFarmId || group.state.farms?.[0]?.id || "") : "",
      allowedActivity: role === "contribuinte" && ["coffee","cattle","both"].includes(req.body.allowedActivity) ? req.body.allowedActivity : "both",
      createdAt: nowIso(), createdBy: req.auth.user.username
    };
    group.state.users.push(user);
    group.state.pendingRegistrations = regs.filter(r => r.id !== reg.id);
    await store.saveGroup(group);
    res.json({ ok: true, state: sanitizeState(group.state) });
  } catch (e) { next(e); }
});

app.post("/api/registrations/:id/reject", auth, requireRole("ceo"), async (req, res, next) => {
  try {
    const group = req.auth.group;
    group.state.pendingRegistrations = (group.state.pendingRegistrations || []).filter(r => String(r.id) !== String(req.params.id));
    await store.saveGroup(group);
    res.json({ ok: true, state: sanitizeState(group.state) });
  } catch (e) { next(e); }
});

// Criação de novos grupos para onboarding. Em produção, chame este endpoint somente depois de validar o pagamento.
app.post("/api/platform/groups", async (req, res, next) => {
  try {
    if (!PLATFORM_SETUP_KEY || req.headers["x-setup-key"] !== PLATFORM_SETUP_KEY) return res.status(403).json({ error: "Chave de plataforma inválida" });
    const name = String(req.body.groupName || "").trim();
    const code = await allocateGroupCode(req.body.groupCode || "");
    let slug = slugify(req.body.groupSlug || name);
    if (await store.getGroupBySlug(slug)) slug = `${slug}-${code}`;
    const ceoName = String(req.body.ceoName || "").trim();
    const ceoUser = String(req.body.ceoUser || "").trim();
    const ceoPassword = String(req.body.ceoPassword || "");
    const ceoEmail = normalizeEmail(req.body.ceoEmail || req.body.payerEmail);
    if (!name || !slug || !ceoName || !validateUsername(ceoUser) || ceoPassword.length < 8 || !validateEmail(ceoEmail)) return res.status(400).json({ error: "Confira os dados do grupo, CEO e e-mail" });
    const hash = await bcrypt.hash(ceoPassword, 11);
    const group = {
      id: uid(), slug, code, name, status: "active", plan: req.body.plan || "pro",
      state: makeDefaultState({ ceoName, ceoUser, ceoPasswordHash: hash, ceoEmail }), cloudInitialized: true,
      subscriptionId: req.body.subscriptionId || null, payerEmail: ceoEmail,
      createdAt: nowIso(), updatedAt: nowIso()
    };
    await store.createGroup(group);
    res.json({ ok: true, group: { id: group.id, slug: group.slug, code: group.code, name: group.name, status: group.status, plan: group.plan } });
  } catch (e) { next(e); }
});

app.get("/api/platform/groups", async (req, res, next) => {
  try {
    if (!PLATFORM_SETUP_KEY || req.headers["x-setup-key"] !== PLATFORM_SETUP_KEY) return res.status(403).json({ error: "Chave de plataforma inválida" });
    const groups = await store.listGroups();
    res.json({ groups: groups.map(g => ({ id:g.id, slug:g.slug, code:g.code, name:g.name, status:g.status, plan:g.plan, cloudInitialized:g.cloudInitialized, subscriptionId:g.subscriptionId, payerEmail:g.payerEmail, createdAt:g.createdAt })) });
  } catch (e) { next(e); }
});


app.patch("/api/platform/groups/:id/status", async (req, res, next) => {
  try {
    if (!PLATFORM_SETUP_KEY || req.headers["x-setup-key"] !== PLATFORM_SETUP_KEY) return res.status(403).json({ error: "Chave de plataforma inválida" });
    const group = await store.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo não encontrado" });
    const status = req.body.status === "active" ? "active" : req.body.status === "suspended" ? "suspended" : null;
    if (!status) return res.status(400).json({ error: "Status inválido" });
    group.status = status;
    await store.saveGroup(group);
    res.json({ ok: true, group: { id: group.id, slug: group.slug, code: group.code, name: group.name, status: group.status, plan: group.plan } });
  } catch (e) { next(e); }
});

async function cancelSubscriptionBeforeGroupDeletion(group) {
  const subscriptionId = String(group?.subscriptionId || "");
  if (!subscriptionId || subscriptionId.startsWith("TEST-")) return;
  if (!MP_ACCESS_TOKEN) throw Object.assign(new Error("Antes de excluir este cliente, configure o Mercado Pago para cancelar a assinatura e evitar novas cobranças"), { statusCode: 503 });
  const response = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(subscriptionId)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status: "canceled" })
  });
  if (!response.ok) { const detail = await response.text().catch(() => ""); throw Object.assign(new Error(`Não foi possível cancelar a assinatura no Mercado Pago (${response.status}). O Grupo não foi excluído.` + (detail ? ` ${detail.slice(0,120)}` : "")), { statusCode: 502 }); }
}

app.delete("/api/platform/groups/:id", async (req, res, next) => {
  try {
    if (!PLATFORM_SETUP_KEY || req.headers["x-setup-key"] !== PLATFORM_SETUP_KEY) return res.status(403).json({ error: "Chave de plataforma inválida" });
    const group = await store.getGroupById(req.params.id);
    if (!group) return res.status(404).json({ error: "Grupo não encontrado" });
    if (group.slug === SEED_GROUP_SLUG || String(group.code) === String(SEED_GROUP_CODE)) return res.status(403).json({ error: "O Grupo inicial 1001 é protegido contra exclusão" });
    if (cleanGroupCode(req.body.confirmCode) !== cleanGroupCode(group.code)) return res.status(400).json({ error: "Digite o Código do Grupo corretamente para confirmar" });
    await cancelSubscriptionBeforeGroupDeletion(group);
    await store.deleteGroup(group.id);
    res.json({ ok: true, message: "Grupo excluído definitivamente" });
  } catch (e) { next(e); }
});

app.get("/api/public/config", (req, res) => res.json({
  productName: "Gestão Rural",
  planName: PLAN_NAME,
  planPrice: PLAN_PRICE,
  currency: "BRL",
  paymentConfigured: Boolean(MP_ACCESS_TOKEN),
  cloudConfigured: Boolean(DATABASE_URL),
  testPurchaseMode: TEST_PURCHASE_MODE
}));

async function getOrCreateMpPlan() {
  if (!MP_ACCESS_TOKEN && !MP_PLAN_ID) throw new Error("Mercado Pago não configurado");
  const token = MP_ACCESS_TOKEN;
  if (MP_PLAN_ID) {
    if (!token) return { id: MP_PLAN_ID, init_point: `https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=${encodeURIComponent(MP_PLAN_ID)}` };
    const r = await fetch(`https://api.mercadopago.com/preapproval_plan/${encodeURIComponent(MP_PLAN_ID)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Falha ao consultar plano Mercado Pago (${r.status})`);
    return r.json();
  }
  const cached = await store.getConfig("mercadopago_plan");
  if (cached?.id && cached?.init_point) return cached;
  if (!PUBLIC_BASE_URL) throw new Error("Defina PUBLIC_BASE_URL para criar o plano");
  const r = await fetch("https://api.mercadopago.com/preapproval_plan", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      reason: PLAN_NAME,
      auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: PLAN_PRICE, currency_id: "BRL" },
      back_url: `${PUBLIC_BASE_URL}/?checkout=success`
    })
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json?.message || `Falha ao criar plano Mercado Pago (${r.status})`);
  await store.setConfig("mercadopago_plan", json);
  return json;
}


async function fetchMpSubscription(subscriptionId) {
  if (!MP_ACCESS_TOKEN) throw new Error("Mercado Pago não configurado");
  const r = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(subscriptionId)}`, {
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}`, "Content-Type": "application/json" }
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json?.message || `Falha ao consultar assinatura (${r.status})`);
  return json;
}

function subscriptionAllowsAccess(status) {
  return ["authorized"].includes(String(status || "").toLowerCase());
}

async function refreshPurchaseStatus(purchase) {
  if (TEST_PURCHASE_MODE && !purchase.subscriptionId) {
    purchase.status = "authorized";
    return store.savePurchase(purchase);
  }
  if (!purchase.subscriptionId) return purchase;
  const sub = await fetchMpSubscription(purchase.subscriptionId);
  purchase.status = sub.status || purchase.status;
  await store.savePurchase(purchase);
  const group = await store.getGroupBySubscription(purchase.subscriptionId);
  if (group) {
    group.status = subscriptionAllowsAccess(sub.status) ? "active" : (["pending"].includes(sub.status) ? group.status : "suspended");
    await store.saveGroup(group);
  }
  return purchase;
}

app.post("/api/public/checkout", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Informe um e-mail válido para a assinatura" });
    const purchase = { id: uid(), email, status: "created", subscriptionId: null, usedAt: null, groupId: null, createdAt: nowIso(), updatedAt: nowIso() };
    await store.createPurchase(purchase);

    if (TEST_PURCHASE_MODE) {
      purchase.status = "authorized";
      await store.savePurchase(purchase);
      return res.json({ checkoutUrl: `${PUBLIC_BASE_URL || ""}/?purchase=${purchase.id}&checkout=success`, purchaseId: purchase.id, testMode: true });
    }

    const plan = await getOrCreateMpPlan();
    if (!MP_ACCESS_TOKEN) {
      if (!plan.init_point) throw new Error("Plano sem link de checkout");
      return res.json({ checkoutUrl: plan.init_point, purchaseId: purchase.id, genericPlan: true });
    }
    if (!PUBLIC_BASE_URL) throw new Error("Defina PUBLIC_BASE_URL no servidor");

    const mp = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        preapproval_plan_id: plan.id,
        reason: PLAN_NAME,
        external_reference: purchase.id,
        payer_email: email,
        back_url: `${PUBLIC_BASE_URL}/?purchase=${purchase.id}&checkout=success`
      })
    });
    const sub = await mp.json();
    if (!mp.ok) throw new Error(sub?.message || `Falha ao criar assinatura (${mp.status})`);
    purchase.subscriptionId = sub.id;
    purchase.status = sub.status || "pending";
    await store.savePurchase(purchase);
    if (!sub.init_point) throw new Error("Assinatura criada sem link de checkout");
    res.json({ checkoutUrl: sub.init_point, purchaseId: purchase.id });
  } catch (e) { next(e); }
});

app.get("/api/public/purchases/:id/status", async (req, res, next) => {
  try {
    let purchase = await store.getPurchaseById(req.params.id);
    if (!purchase) return res.status(404).json({ error: "Compra não encontrada" });
    try { purchase = await refreshPurchaseStatus(purchase); } catch (e) { console.error("Status da assinatura:", e.message); }
    res.json({
      purchaseId: purchase.id,
      email: purchase.email.replace(/(^.).*(@.*$)/, "$1***$2"),
      status: purchase.status,
      paid: subscriptionAllowsAccess(purchase.status),
      used: Boolean(purchase.usedAt),
      canOnboard: subscriptionAllowsAccess(purchase.status) && !purchase.usedAt
    });
  } catch (e) { next(e); }
});

app.post("/api/public/purchases/:id/onboard", async (req, res, next) => {
  try {
    let purchase = await store.getPurchaseById(req.params.id);
    if (!purchase) return res.status(404).json({ error: "Compra não encontrada" });
    purchase = await refreshPurchaseStatus(purchase);
    if (!subscriptionAllowsAccess(purchase.status)) return res.status(403).json({ error: "A assinatura ainda não está autorizada" });
    if (purchase.usedAt) return res.status(409).json({ error: "Esta compra já foi usada para criar um Grupo" });

    const name = String(req.body.groupName || "").trim();
    const code = await allocateGroupCode();
    let slug = slugify(name);
    if (await store.getGroupBySlug(slug)) slug = `${slug}-${code}`;
    const ceoName = String(req.body.ceoName || "").trim();
    const ceoUser = String(req.body.ceoUser || "").trim();
    const ceoPassword = String(req.body.ceoPassword || "");
    if (!name || !slug || !ceoName || !validateUsername(ceoUser) || ceoPassword.length < 8) return res.status(400).json({ error: "Confira Grupo, CEO, usuário e senha (mínimo 8 caracteres)" });

    const hash = await bcrypt.hash(ceoPassword, 11);
    const group = {
      id: uid(), slug, code, name, status: "active", plan: "pro",
      state: makeDefaultState({ ceoName, ceoUser, ceoPasswordHash: hash, ceoEmail: purchase.email }), cloudInitialized: true,
      subscriptionId: purchase.subscriptionId || `TEST-${purchase.id}`, payerEmail: purchase.email,
      createdAt: nowIso(), updatedAt: nowIso()
    };
    await store.createGroup(group);
    purchase.usedAt = nowIso(); purchase.groupId = group.id;
    await store.savePurchase(purchase);
    res.json({ ok: true, group: { id: group.id, slug: group.slug, code: group.code, name: group.name }, loginUrl: `/app?grupo=${encodeURIComponent(group.code)}` });
  } catch (e) { next(e); }
});

app.post("/api/webhooks/mercadopago", async (req, res) => {
  // A notificação apenas dispara uma consulta autenticada na API do Mercado Pago;
  // o status confiável vem do GET /preapproval/{id}, não do corpo recebido.
  res.sendStatus(200);
  try {
    const subscriptionId = String(req.body?.data?.id || req.query?.["data.id"] || "");
    if (!subscriptionId || !MP_ACCESS_TOKEN) return;
    const sub = await fetchMpSubscription(subscriptionId);
    const purchase = await store.getPurchaseBySubscription(subscriptionId);
    if (purchase) { purchase.status = sub.status || purchase.status; await store.savePurchase(purchase); }
    const group = await store.getGroupBySubscription(subscriptionId);
    if (group) {
      group.status = subscriptionAllowsAccess(sub.status) ? "active" : (["pending"].includes(sub.status) ? group.status : "suspended");
      await store.saveGroup(group);
    }
  } catch (e) { console.error("Webhook Mercado Pago:", e.message); }
});

// Endpoints de mercado (mantidos da v20)
let cache = { at: 0, data: null };
let marketCache = { at: 0, data: null };
let cattleLocalCache = { at: 0, data: null };
const CACHE_MS = 60_000, MARKET_CACHE_MS = 30_000, CATTLE_LOCAL_CACHE_MS = 30 * 60_000;

async function yahooChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } });
  if (!response.ok) throw new Error(`Falha ao consultar ${symbol}: ${response.status}`);
  const json = await response.json(); const result = json?.chart?.result?.[0]; if (!result) throw new Error(`Sem dados para ${symbol}`);
  const meta = result.meta || {}; const closes = result.indicators?.quote?.[0]?.close || [];
  const lastClose = [...closes].reverse().find(v => typeof v === "number"); const price = meta.regularMarketPrice ?? lastClose;
  if (typeof price !== "number") throw new Error(`Preço indisponível para ${symbol}`); return price;
}
async function yahooSnapshot(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } });
  if (!response.ok) throw new Error(`Falha ao consultar ${symbol}: ${response.status}`);
  const json = await response.json(); const result = json?.chart?.result?.[0]; if (!result) throw new Error(`Sem dados para ${symbol}`);
  const meta = result.meta || {}, quote = result.indicators?.quote?.[0] || {}; const lastNumeric = arr => [...(arr || [])].reverse().find(v => typeof v === "number");
  const price = meta.regularMarketPrice ?? lastNumeric(quote.close); if (typeof price !== "number") throw new Error(`Preço indisponível para ${symbol}`);
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? null; const change = typeof previousClose === "number" ? price - previousClose : null;
  const changePct = typeof previousClose === "number" && previousClose !== 0 ? (change / previousClose) * 100 : null;
  return { symbol, price, previousClose, change, changePct, open:lastNumeric(quote.open), high:lastNumeric(quote.high), low:lastNumeric(quote.low), currency:meta.currency||"", exchangeName:meta.exchangeName||"", marketState:meta.marketState||"", timestamp:meta.regularMarketTime ? new Date(meta.regularMarketTime*1000).toISOString() : nowIso() };
}
async function latestCattleMG() {
  if (cattleLocalCache.data && Date.now()-cattleLocalCache.at<CATTLE_LOCAL_CACHE_MS) return cattleLocalCache.data;
  try { const r=await fetch("https://agrodocai.com.br/api/v1/cotacao?uf=MG",{headers:{"User-Agent":"Mozilla/5.0","Accept":"application/json"}}); if(!r.ok) throw new Error(`HTTP ${r.status}`); const j=await r.json(); const out={value:Number(j.valor),date:j.data_cotacao||null,source:j.fonte||"referência local",unit:j.unidade||"@",uf:j.uf||"MG"}; if(!Number.isFinite(out.value)) throw new Error("valor inválido"); cattleLocalCache={at:Date.now(),data:out}; return out; } catch(_){ return null; }
}
const COFFEE_CONTRACTS=[{symbol:"KCZ26.NYB",label:"Dez/26",ice:"Dec26"},{symbol:"KCH27.NYB",label:"Mar/27",ice:"Mar27"},{symbol:"KCK27.NYB",label:"Mai/27",ice:"May27"},{symbol:"KCN27.NYB",label:"Jul/27",ice:"Jul27"},{symbol:"KCU27.NYB",label:"Set/27",ice:"Sep27"},{symbol:"KCZ27.NYB",label:"Dez/27",ice:"Dec27"},{symbol:"KCH28.NYB",label:"Mar/28",ice:"Mar28"}];
app.get("/api/mercado", async (req,res)=>{try{if(marketCache.data&&Date.now()-marketCache.at<MARKET_CACHE_MS)return res.json(marketCache.data);const [usd,coffee,live,feeder,local,...contracts]=await Promise.all([yahooSnapshot("BRL=X").catch(()=>null),yahooSnapshot("KC=F").catch(()=>null),yahooSnapshot("LE=F").catch(()=>null),yahooSnapshot("GF=F").catch(()=>null),latestCattleMG(),...COFFEE_CONTRACTS.map(c=>yahooSnapshot(c.symbol).catch(()=>null))]);const usdBrl=usd?.price||null,poundsPer60kg=132.277357,poundsPerArroba=15*2.20462262185;const enrichCoffee=(snap,c={})=>!snap?{...c,available:false}:{...c,...snap,available:true,brlPerSaca:usdBrl?(snap.price/100)*poundsPer60kg*usdBrl:null};const convertCattle=snap=>!snap?null:{...snap,brlPerArroba:usdBrl?(snap.price/100)*poundsPerArroba*usdBrl:null};const payload={updatedAt:nowIso(),autoRefreshSeconds:30,usdBrl:usd,coffee:{front:enrichCoffee(coffee,{label:"Coffee C contínuo"}),contracts:COFFEE_CONTRACTS.map((c,i)=>enrichCoffee(contracts[i],c)),exchange:"ICE Futures U.S.",unit:"centavos de US$/lb",note:"Cotações podem ser atrasadas. R$/saca é conversão indicativa."},cattle:{localMG:local,liveCattle:convertCattle(live),feederCattle:convertCattle(feeder),note:"Live Cattle/Feeder Cattle são referências dos EUA; referência MG é a última cotação local disponível."},disclaimer:"Painel informativo. Não é recomendação de investimento."};marketCache={at:Date.now(),data:payload};res.json(payload);}catch(error){console.error(error);res.status(503).json({error:"Mercado temporariamente indisponível",detail:error.message});}});
app.get("/api/cotacao-cafe", async (req,res)=>{try{if(cache.data&&Date.now()-cache.at<CACHE_MS)return res.json(cache.data);const [coffeeCentsLb,usdBrl]=await Promise.all([yahooChart("KC=F"),yahooChart("BRL=X")]);const poundsPer60kg=132.277357,usdPerSaca=(coffeeCentsLb/100)*poundsPer60kg,brlPerSaca=usdPerSaca*usdBrl;const payload={symbol:"KC=F",coffeeCentsLb,usdBrl,usdPerSaca,brlPerSaca,timestamp:nowIso(),methodology:"Coffee C × 132,277357 lb por 60 kg × USD/BRL",warning:"Estimativa de referência; não é preço físico local."};cache={at:Date.now(),data:payload};res.json(payload);}catch(error){res.status(503).json({error:"Cotação temporariamente indisponível",detail:error.message});}});

app.use(express.static(PUBLIC_DIR, { index: false }));
app.get("/app", (req,res)=>res.sendFile(path.join(PUBLIC_DIR,"app.html")));
app.get("/app.html", (req,res)=>res.sendFile(path.join(PUBLIC_DIR,"app.html")));
app.get("/platform", (req,res)=>res.sendFile(path.join(PUBLIC_DIR,"platform.html")));
app.get("/platform.html", (req,res)=>res.sendFile(path.join(PUBLIC_DIR,"platform.html")));
app.get("/", (req,res)=>res.sendFile(path.join(PUBLIC_DIR,"index.html")));
app.get("*", (req,res)=>res.sendFile(path.join(PUBLIC_DIR,"index.html")));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message || "Erro interno" });
});

(async()=>{
  await store.init();
  await store.pruneSessions();
  await ensureSeedGroup();
  await ensureExistingGroupCodes();
  app.listen(PORT,()=>console.log(`Gestão Rural v21.2 em http://localhost:${PORT} • ${DATABASE_URL ? "PostgreSQL" : "armazenamento local de desenvolvimento"}`));
})().catch(err=>{console.error("Falha ao iniciar:",err);process.exit(1);});
