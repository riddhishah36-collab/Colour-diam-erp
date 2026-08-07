import buildSeed from "../../backend/seed.js";

const DB_KEY = "db";
const SESSION_TTL = 12 * 60 * 60;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}

const RESOURCES = {
  diamonds: { search: ["name", "sku", "color", "clarity", "lab", "certNumber", "shape", "origin"], roles: ["admin", "manager", "inventory", "sales", "viewer"], writeRoles: ["admin", "manager", "inventory"] },
  gemstones: { search: ["name", "sku", "stoneType", "color", "origin", "lab", "certNumber"], roles: ["admin", "manager", "inventory", "sales", "viewer"], writeRoles: ["admin", "manager", "inventory"] },
  jewellery: { search: ["name", "sku", "jewelleryType", "material", "primaryStone", "colour"], roles: ["admin", "manager", "inventory", "sales", "viewer"], writeRoles: ["admin", "manager", "inventory"] },
  products: { search: ["name", "sku", "category", "material", "description", "tags"], roles: ["admin", "manager", "inventory", "sales", "viewer"], writeRoles: ["admin", "manager", "inventory"] },
  customers: { search: ["name", "company", "contact", "email", "phone", "city", "country", "segment", "tier", "tags", "code"], roles: ["admin", "manager", "sales"], writeRoles: ["admin", "manager", "sales"] },
  leads: { search: ["name", "company", "email", "phone", "source", "status", "notes"], roles: ["admin", "manager", "sales"], writeRoles: ["admin", "manager", "sales"] },
  suppliers: { search: ["name", "contact", "email", "type", "city", "country", "phone"], roles: ["admin", "manager", "inventory", "sales"], writeRoles: ["admin", "manager"] },
  memos: { search: ["number", "customerName", "status", "notes"], roles: ["admin", "manager", "sales", "viewer"], writeRoles: ["admin", "manager", "sales"] },
  returns: { search: ["number", "orderNumber", "customerName", "reason", "status"], roles: ["admin", "manager", "sales", "viewer"], writeRoles: ["admin", "manager", "sales"] },
  expenses: { search: ["number", "category", "vendor", "description", "status"], roles: ["admin", "manager", "viewer"], writeRoles: ["admin", "manager"] },
  tasks: { search: ["title", "description", "assigneeName", "status", "priority", "relatedName"], roles: ["admin", "manager", "sales", "inventory", "viewer"], writeRoles: ["admin", "manager", "sales", "inventory"] },
  messages: { search: ["subject", "body", "partyName", "channel", "direction", "status"], roles: ["admin", "manager", "sales"], writeRoles: ["admin", "manager", "sales"] },
  documents: { search: ["name", "type", "partyName", "tags", "notes"], roles: ["admin", "manager", "sales", "viewer"], writeRoles: ["admin", "manager", "sales"] },
  quotes: { search: ["number", "customerName", "status"], roles: ["admin", "manager", "sales", "viewer"], writeRoles: ["admin", "manager", "sales"] },
  orders: { search: ["number", "customerName", "status", "paymentStatus"], roles: ["admin", "manager", "sales", "viewer"], writeRoles: ["admin", "manager", "sales"] },
  invoices: { search: ["number", "orderNumber", "customerName", "status"], roles: ["admin", "manager", "sales", "viewer"], writeRoles: ["admin", "manager", "sales"] },
  payments: { search: ["number", "invoiceNumber", "customerName", "method", "reference"], roles: ["admin", "manager", "sales", "viewer"], writeRoles: ["admin", "manager", "sales"] },
  purchaseOrders: { search: ["number", "supplierName", "status"], roles: ["admin", "manager", "inventory", "sales"], writeRoles: ["admin", "manager", "inventory"] },
  users: { search: ["name", "email", "role"], roles: ["admin", "manager"], writeRoles: ["admin"] }
};

async function getDb(env) {
  const raw = await env.ERP_KV.get(DB_KEY);
  if (raw) return JSON.parse(raw);
  const db = buildSeed();
  await env.ERP_KV.put(DB_KEY, JSON.stringify(db));
  return db;
}

async function saveDb(env, db) {
  await env.ERP_KV.put(DB_KEY, JSON.stringify(db));
}

function nextId(db, collection) {
  const rows = db[collection] || [];
  const ids = rows.map((r) => {
    const n = parseInt(String(r.id).replace(/^\D+/, ""), 10);
    return Number.isNaN(n) ? 0 : n;
  });
  const max = ids.length ? Math.max(...ids) : 0;
  return `${String(collection).slice(0, 2)}${max + 1}`;
}

function pushActivity(db, type, message, user, target) {
  db.activities.unshift({
    id: `a${Date.now()}`,
    type,
    message,
    userId: user ? user.id : null,
    userName: user ? user.name : "System",
    target: target || null,
    createdAt: new Date().toISOString()
  });
  if (db.activities.length > 200) db.activities.length = 200;
}

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

async function hashPassword(seed) {
  const data = new TextEncoder().encode("colourdiam:" + seed);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 24);
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function authenticate(request, env) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { error: "Authentication required", status: 401 };
  const raw = await env.ERP_KV.get(`session:${token}`);
  if (!raw) return { error: "Session expired", status: 401 };
  const session = JSON.parse(raw);
  if (session.expires < Date.now()) {
    await env.ERP_KV.delete(`session:${token}`);
    return { error: "Session expired", status: 401 };
  }
  const db = await getDb(env);
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return { error: "User not found", status: 401 };
  return { user };
}

function requireRole(user, roles) {
  if (!roles.includes(user.role)) {
    return { error: "Insufficient permissions", status: 403 };
  }
  return null;
}

function applyQuery(rows, searchParams, config) {
  let result = rows.slice();
  const q = searchParams.get("q");

  if (q) {
    const needle = String(q).toLowerCase();
    result = result.filter((row) => {
      const hay = config.search
        .map((f) => (row[f] != null ? String(row[f]) : ""))
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }

  searchParams.forEach((val, key) => {
    if (key.startsWith("min_") || key.startsWith("max_")) {
      const field = key.slice(4);
      const v = Number(val);
      result = result.filter((row) => {
        const rv = Number(row[field]);
        if (Number.isNaN(rv)) return false;
        return key.startsWith("min_") ? rv >= v : rv <= v;
      });
    } else if (key.startsWith("from_") || key.startsWith("to_")) {
      const field = key.slice(5);
      result = result.filter((row) => {
        if (!row[field]) return false;
        const rv = String(row[field]).slice(0, 10);
        return key.startsWith("from_") ? rv >= val : rv <= val;
      });
    } else if (["q", "sort", "dir", "page", "pageSize", "exportAll"].includes(key)) {
      return;
    } else {
      result = result.filter((row) => {
        if (Array.isArray(row[key])) return row[key].includes(val);
        return row[key] != null && String(row[key]) === val;
      });
    }
  });

  const sort = searchParams.get("sort");
  if (sort) {
    const dirn = searchParams.get("dir") === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dirn;
      return String(av).localeCompare(String(bv)) * dirn;
    });
  }

  return result;
}

function listResponse(result, searchParams) {
  const total = result.length;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(500, Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10)));
  const start = (page - 1) * pageSize;
  return { data: result.slice(start, start + pageSize), total, page, pageSize };
}

function csvEscape(val) {
  if (val == null) return "";
  const s = typeof val === "object" ? JSON.stringify(val) : String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function monthKey(isoDate) {
  return String(isoDate).slice(0, 7);
}

function lastMonths(n) {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

function buildDashboard(db) {
  const today = new Date().toISOString().split("T")[0];
  const curMonth = today.slice(0, 7);
  const curYear = today.slice(0, 4);
  const allInventory = ["diamonds", "gemstones", "jewellery", "products"].flatMap((c) => db[c]);

  const payTotal = db.payments.reduce((s, p) => s + p.amount, 0);
  const ordersCount = db.orders.length;
  const activeOrders = db.orders.filter((o) => !["cancelled", "delivered"].includes(o.status)).length;
  const inventoryValue = allInventory.filter((r) => r.status === "in-stock").reduce((s, r) => s + r.price, 0);
  const inventoryCost = allInventory.filter((r) => r.status === "in-stock").reduce((s, r) => s + (r.cost || 0), 0);
  const receivables = db.invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.balance, 0);

  const isSale = (o) => o.status !== "cancelled";
  const salesToday = db.orders.filter((o) => isSale(o) && o.date === today).reduce((s, o) => s + o.total, 0);
  const salesThisMonth = db.orders.filter((o) => isSale(o) && monthKey(o.date) === curMonth).reduce((s, o) => s + o.total, 0);
  const salesThisYear = db.orders.filter((o) => isSale(o) && String(o.date).slice(0, 4) === curYear).reduce((s, o) => s + o.total, 0);
  const outstandingCustomerBalance = db.customers.reduce((s, c) => s + (c.balance || 0), 0);
  const supplierPayable = db.suppliers.reduce((s, sp) => s + (sp.balance || 0), 0);
  const pendingPayments = db.invoices.filter((i) => ["issued", "partial"].includes(i.status)).reduce((s, i) => s + i.balance, 0);
  const pendingOrders = db.orders.filter((o) => ["draft", "approved", "in-production", "shipped"].includes(o.status)).length;
  const memoStock = db.memos.filter((m) => ["out-standing", "partial-return"].includes(m.status)).reduce((s, m) => s + m.totalValue, 0);
  const lowStock = allInventory.filter((r) => (r.quantity || 0) <= 0 && r.status === "in-stock");
  const tasksDue = db.tasks.filter((t) => t.status !== "done" && t.dueDate && t.dueDate <= today).length;
  const unreadMessages = db.messages.filter((m) => m.status === "unread").length;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const newEnquiries = db.leads.filter((l) => String(l.createdAt).slice(0, 10) >= thirtyDaysAgo).length;
  const leadsFollowUp = db.leads.filter((l) => !["won", "lost"].includes(l.status) && l.nextActionDate && l.nextActionDate <= today).length;

  const months = lastMonths(6);
  const salesByMonth = months.map((m) => {
    const list = db.orders.filter((o) => isSale(o) && monthKey(o.date) === m);
    return { month: m, revenue: list.reduce((s, o) => s + o.total, 0), orders: list.length };
  });

  const statusCounts = {};
  allInventory.forEach((r) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  const itemSales = {};
  db.orders.forEach((o) => {
    if (!isSale(o)) return;
    (o.items || []).forEach((it) => {
      const key = it.name || it.inventoryId;
      itemSales[key] = (itemSales[key] || 0) + it.qty;
    });
  });
  const topItems = Object.entries(itemSales)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const customerRevenue = {};
  db.orders.forEach((o) => {
    if (!isSale(o)) return;
    customerRevenue[o.customerName] = (customerRevenue[o.customerName] || 0) + o.total;
  });
  const topCustomers = Object.entries(customerRevenue)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const leadStages = {};
  db.leads.forEach((l) => {
    leadStages[l.status] = (leadStages[l.status] || 0) + 1;
  });

  const alerts = [];
  db.invoices.filter((i) => i.status === "overdue").forEach((i) => alerts.push({ severity: "high", type: "Overdue invoice", title: i.number, detail: `${i.customerName} owes ${fmt(i.balance)}` }));
  db.quotes.filter((q) => q.status === "sent" && q.validUntil && q.validUntil <= today).forEach((q) => alerts.push({ severity: "medium", type: "Quote expiring", title: q.number, detail: q.customerName }));
  db.leads.filter((l) => l.status !== "won" && l.nextActionDate && l.nextActionDate <= today).forEach((l) => alerts.push({ severity: "medium", type: "Lead follow-up due", title: l.name, detail: l.nextAction || "Scheduled action" }));
  db.memos.filter((m) => ["out-standing", "partial-return"].includes(m.status) && m.dueDate && m.dueDate <= today).forEach((m) => alerts.push({ severity: "high", type: "Memo overdue", title: m.number, detail: `${m.customerName} · ${fmt(m.totalValue)}` }));
  lowStock.slice(0, 5).forEach((r) => alerts.push({ severity: "low", type: "Stock alert", title: r.name || r.sku, detail: "Out of stock" }));
  db.tasks.filter((t) => t.status !== "done" && t.dueDate && t.dueDate <= today).slice(0, 5).forEach((t) => alerts.push({ severity: "medium", type: "Task due", title: t.title, detail: `Due ${t.dueDate}` }));

  const categoryValue = {
    diamonds: db.diamonds.filter((r) => r.status === "in-stock").reduce((s, r) => s + r.price, 0),
    gemstones: db.gemstones.filter((r) => r.status === "in-stock").reduce((s, r) => s + r.price, 0),
    jewellery: db.jewellery.filter((r) => r.status === "in-stock").reduce((s, r) => s + r.price, 0),
    products: db.products.filter((r) => r.status === "in-stock").reduce((s, r) => s + r.price, 0)
  };

  const stockByStatus = {
    available: allInventory.filter((r) => r.status === "in-stock").length,
    reserved: allInventory.filter((r) => r.status === "reserved").length,
    pending: allInventory.filter((r) => r.status === "pending").length,
    sold: allInventory.filter((r) => r.status === "sold").length,
    consignment: allInventory.filter((r) => r.status === "on-consignment").length + db.memos.filter((m) => ["out-standing", "partial-return"].includes(m.status)).length
  };

  const recentTransactions = [
    ...db.payments.map((p) => ({ id: `pay-${p.id}`, type: "Payment in", number: p.number, party: p.customerName, amount: p.amount, sign: 1, date: p.date, method: p.method })),
    ...db.expenses.map((x) => ({ id: `exp-${x.id}`, type: "Expense out", number: x.number, party: x.vendor, amount: x.amount, sign: -1, date: x.date, method: x.paymentMethod }))
  ]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 8);

  return {
    kpis: {
      revenue: payTotal,
      orders: ordersCount,
      activeOrders,
      inventoryValue,
      inventoryCost,
      receivables,
      customers: db.customers.length,
      leads: db.leads.length,
      pipelineValue: db.leads.filter((l) => !["won", "lost"].includes(l.status)).reduce((s, l) => s + (l.value || 0), 0),
      salesToday,
      salesThisMonth,
      salesThisYear,
      outstandingCustomerBalance,
      supplierPayable,
      pendingPayments,
      pendingOrders,
      memoStock,
      lowStock: lowStock.length,
      tasksDue,
      unreadMessages,
      newEnquiries,
      leadsFollowUp
    },
    salesByMonth,
    statusCounts,
    stockByStatus,
    topItems,
    topCustomers,
    leadStages,
    alerts: alerts.slice(0, 8),
    categoryValue,
    recentTransactions,
    tasksDueList: db.tasks.filter((t) => t.status !== "done" && t.dueDate && t.dueDate <= today).slice(0, 6),
    lowStockList: lowStock.slice(0, 6),
    memosOut: db.memos.filter((m) => ["out-standing", "partial-return"].includes(m.status)),
    recentActivity: db.activities.slice(0, 8)
  };
}

function buildReports(db, type, searchParams) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const inRange = (d) => {
    if (!d) return true;
    const ds = String(d).slice(0, 10);
    if (from && ds < from) return false;
    if (to && ds > to) return false;
    return true;
  };

  if (type === "sales") {
    const orders = db.orders.filter((o) => o.status !== "cancelled" && inRange(o.date));
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const cost = orders.reduce((s, o) => s + (o.items || []).reduce((c, it) => c + it.qty * (it.unitPrice * 0.7), 0), 0);
    const byCustomer = {};
    orders.forEach((o) => {
      byCustomer[o.customerName] = (byCustomer[o.customerName] || 0) + o.total;
    });
    const byMonth = {};
    orders.forEach((o) => {
      const m = monthKey(o.date);
      byMonth[m] = (byMonth[m] || 0) + o.total;
    });
    const byItem = {};
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        byItem[it.name] = (byItem[it.name] || 0) + it.qty * it.unitPrice;
      });
    });
    return {
      summary: { orders: orders.length, revenue, average: orders.length ? Math.round(revenue / orders.length) : 0, margin: revenue - cost },
      byMonth: Object.entries(byMonth).sort().map(([month, revenue]) => ({ month, revenue })),
      byCustomer: Object.entries(byCustomer).sort((a, b) => b[1] - a[1]).map(([name, revenue]) => ({ name, revenue })),
      byItem: Object.entries(byItem).sort((a, b) => b[1] - a[1]).map(([name, revenue]) => ({ name, revenue }))
    };
  }

  if (type === "inventory") {
    const categories = ["diamonds", "gemstones", "jewellery"];
    const byCategory = categories.map((c) => {
      const rows = db[c];
      return {
        category: c,
        count: rows.length,
        value: rows.filter((r) => r.status === "in-stock").reduce((s, r) => s + r.price, 0),
        cost: rows.filter((r) => r.status === "in-stock").reduce((s, r) => s + (r.cost || 0), 0)
      };
    });
    const statusCounts = {};
    categories.forEach((c) => db[c].forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; }));
    const byOrigin = {};
    db.diamonds.forEach((r) => { byOrigin[r.origin] = (byOrigin[r.origin] || 0) + r.price; });
    return { byCategory, statusCounts, byOrigin: Object.entries(byOrigin).sort((a, b) => b[1] - a[1]).map(([origin, value]) => ({ origin, value })) };
  }

  if (type === "receivables") {
    const aging = { current: 0, d1to30: 0, d31to60: 0, d60plus: 0 };
    const today = new Date();
    const diffDays = (d) => Math.max(0, Math.floor((today - new Date(d)) / 86400000));
    db.invoices.filter((i) => i.status !== "paid").forEach((i) => {
      const days = i.dueDate ? diffDays(i.dueDate) : diffDays(i.date);
      if (days <= 0) aging.current += i.balance;
      else if (days <= 30) aging.d1to30 += i.balance;
      else if (days <= 60) aging.d31to60 += i.balance;
      else aging.d60plus += i.balance;
    });
    const total = Object.values(aging).reduce((s, v) => s + v, 0);
    const byCustomer = {};
    db.invoices.filter((i) => i.status !== "paid").forEach((i) => {
      byCustomer[i.customerName] = (byCustomer[i.customerName] || 0) + i.balance;
    });
    return { aging, total, byCustomer: Object.entries(byCustomer).sort((a, b) => b[1] - a[1]).map(([name, balance]) => ({ name, balance })) };
  }

  if (type === "suppliers") {
    const spend = {};
    db.purchaseOrders.filter((po) => ["ordered", "received"].includes(po.status) && inRange(po.date)).forEach((po) => {
      spend[po.supplierName] = (spend[po.supplierName] || 0) + po.total;
    });
    const pocs = db.purchaseOrders.filter((po) => inRange(po.date)).length;
    return {
      totalSpend: Object.values(spend).reduce((s, v) => s + v, 0),
      purchaseOrders: pocs,
      bySupplier: Object.entries(spend).sort((a, b) => b[1] - a[1]).map(([name, total]) => ({ name, total }))
    };
  }

  if (type === "accounts") {
    const receivables = db.invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.balance, 0);
    const payables = db.suppliers.reduce((s, sp) => s + (sp.balance || 0), 0);
    const cashIn = db.payments.reduce((s, p) => s + p.amount, 0);
    const expensesTotal = db.expenses.reduce((s, x) => s + x.amount, 0);
    const netPosition = cashIn - expensesTotal;
    const byCategory = {};
    db.expenses.filter((x) => inRange(x.date)).forEach((x) => {
      byCategory[x.category] = (byCategory[x.category] || 0) + x.amount;
    });
    const monthlyIn = {};
    db.payments.forEach((p) => { const m = monthKey(p.date); monthlyIn[m] = (monthlyIn[m] || 0) + p.amount; });
    const monthlyOut = {};
    db.expenses.forEach((x) => { const m = monthKey(x.date); monthlyOut[m] = (monthlyOut[m] || 0) + x.amount; });
    const months = lastMonths(6);
    const cashflow = months.map((m) => ({ month: m, inflow: monthlyIn[m] || 0, outflow: monthlyOut[m] || 0 }));
    return {
      summary: { receivables, payables, cashIn, expensesTotal, netPosition, outstandingCustomerBalance: db.customers.reduce((s, c) => s + (c.balance || 0), 0) },
      byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([category, amount]) => ({ category, amount })),
      cashflow
    };
  }

  return { error: "Unknown report", status: 404 };
}

async function handle(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "");
  const segments = path.split("/").filter(Boolean);
  const method = request.method;
  const searchParams = url.searchParams;

  if (segments.length === 1 && segments[0] === "health") {
    return json({ ok: true });
  }

  if (segments.length === 2 && segments[0] === "auth" && segments[1] === "login" && method === "POST") {
    const body = await readBody(request);
    const db = await getDb(env);
    const user = db.users.find((u) => u.email.toLowerCase() === String(body.email || "").toLowerCase());
    if (!user || !user.active) return json({ error: "Invalid email or password" }, 401);
    const expected = await hashPassword(user.id);
    if (body.password !== "demo-pass" && body.password !== expected) return json({ error: "Invalid email or password" }, 401);
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    await env.ERP_KV.put(`session:${token}`, JSON.stringify({ userId: user.id, expires: Date.now() + SESSION_TTL * 1000 }));
    pushActivity(db, "auth", `User ${user.name} signed in`, user);
    await saveDb(env, db);
    return json({ token, user: publicUser(user) });
  }

  if (segments.length === 2 && segments[0] === "auth" && segments[1] === "me") {
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    return json({ user: publicUser(auth.user) });
  }

  if (segments.length === 1 && segments[0] === "meta") {
    const db = await getDb(env);
    if (method === "GET") return json(db.meta);
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const denied = requireRole(auth.user, ["admin", "manager"]);
    if (denied) return json({ error: denied.error }, denied.status);
    const body = await readBody(request);
    db.meta = { ...db.meta, ...(body || {}) };
    pushActivity(db, "settings", "Company settings updated", auth.user);
    await saveDb(env, db);
    return json(db.meta);
  }

  if (segments.length === 1 && segments[0] === "resources") {
    const db = await getDb(env);
    return json(
      Object.keys(RESOURCES).map((name) => ({
        name,
        count: (db[name] || []).length,
        searchFields: RESOURCES[name].search
      }))
    );
  }

  if (segments[0] === "global-search") {
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const db = await getDb(env);
    const q = String(searchParams.get("q") || "").trim().toLowerCase();
    const groups = ["diamonds", "gemstones", "jewellery", "products", "customers", "leads", "suppliers", "orders", "quotes", "invoices", "payments", "memos", "returns", "expenses", "tasks", "messages", "documents", "purchaseOrders"];
    const out = [];
    groups.forEach((g) => {
      const config = RESOURCES[g];
      (db[g] || []).forEach((row) => {
        const hay = config.search.map((f) => (row[f] != null ? String(row[f]) : "")).join(" ").toLowerCase();
        if (!q || hay.includes(q)) {
          out.push({ group: g, id: row.id, label: row.number || row.name || row.title || row.subject || row.sku || row.id, sub: row.customerName || row.supplierName || row.partyName || row.sku || row.email || "", status: row.status || "" });
        }
      });
    });
    return json({ data: out.slice(0, 80), total: out.length });
  }

  if (segments[0] === "activities") {
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const denied = requireRole(auth.user, ["admin", "manager", "sales", "viewer"]);
    if (denied) return json({ error: denied.error }, denied.status);
    const db = await getDb(env);
    let result = db.activities.slice();
    const q = searchParams.get("q");
    if (q) {
      const needle = String(q).toLowerCase();
      result = result.filter((a) => (a.message || "").toLowerCase().includes(needle) || (a.userName || "").toLowerCase().includes(needle));
    }
    const type = searchParams.get("type");
    if (type) result = result.filter((a) => a.type === type);
    const total = result.length;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10)));
    const start = (page - 1) * pageSize;
    return json({ data: result.slice(start, start + pageSize), total, page, pageSize });
  }

  if (segments[0] === "dashboard") {
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const denied = requireRole(auth.user, ["admin", "manager", "sales", "inventory", "viewer"]);
    if (denied) return json({ error: denied.error }, denied.status);
    const db = await getDb(env);
    return json(buildDashboard(db));
  }

  if (segments[0] === "reports" && segments[1]) {
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const denied = requireRole(auth.user, ["admin", "manager", "sales", "viewer"]);
    if (denied) return json({ error: denied.error }, denied.status);
    const db = await getDb(env);
    const result = buildReports(db, segments[1], searchParams);
    if (result.error) return json({ error: result.error }, result.status);
    return json(result);
  }

  if (segments[0] === "admin" && segments[1] === "reset" && method === "POST") {
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const denied = requireRole(auth.user, ["admin"]);
    if (denied) return json({ error: denied.error }, denied.status);
    const db = buildSeed();
    await saveDb(env, db);
    return json({ ok: true });
  }

  if (segments[0] === "quotes" && segments[1] && segments[2] === "convert" && method === "POST") {
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const denied = requireRole(auth.user, ["admin", "manager", "sales"]);
    if (denied) return json({ error: denied.error }, denied.status);
    const db = await getDb(env);
    const quote = db.quotes.find((r) => r.id === segments[1]);
    if (!quote) return json({ error: "Not found" }, 404);
    if (quote.status === "converted") return json({ error: "Already converted" }, 400);

    const orderId = nextId(db, "orders");
    const orderNum = `${db.settings.orderPrefix}${String(db.orders.length + 1).padStart(4, "0")}`;
    const order = {
      id: orderId,
      number: orderNum,
      customerId: quote.customerId,
      customerName: quote.customerName,
      date: new Date().toISOString().split("T")[0],
      expectedDate: null,
      status: "approved",
      items: quote.items,
      discountPct: quote.discountPct,
      taxRate: quote.taxRate,
      subtotal: quote.subtotal,
      discount: quote.discount,
      tax: quote.tax,
      total: quote.total,
      paymentStatus: "unpaid",
      paymentMethod: "",
      notes: quote.notes,
      createdAt: new Date().toISOString()
    };
    db.orders.unshift(order);
    quote.status = "converted";
    quote.convertedTo = order.id;
    quote.convertedNumber = orderNum;

    const invId = nextId(db, "invoices");
    const invNum = `${db.settings.invoicePrefix}${String(db.invoices.length + 1).padStart(4, "0")}`;
    const invoice = {
      id: invId,
      number: invNum,
      orderId,
      orderNumber: orderNum,
      customerId: quote.customerId,
      customerName: quote.customerName,
      date: new Date().toISOString().split("T")[0],
      dueDate: null,
      items: quote.items,
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total,
      paidAmount: 0,
      balance: quote.total,
      status: "issued",
      createdAt: new Date().toISOString()
    };
    db.invoices.unshift(invoice);

    pushActivity(db, "order", `Quote ${quote.number} converted to order ${orderNum}`, auth.user, orderId);
    await saveDb(env, db);
    return json({ order, invoice }, 201);
  }

  if (segments[0] === "orders" && segments[1] && segments[2] === "issue-invoice" && method === "POST") {
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const denied = requireRole(auth.user, ["admin", "manager", "sales"]);
    if (denied) return json({ error: denied.error }, denied.status);
    const db = await getDb(env);
    const order = db.orders.find((r) => r.id === segments[1]);
    if (!order) return json({ error: "Order not found" }, 404);
    const existing = db.invoices.find((i) => i.orderId === order.id);
    if (existing) return json({ error: `Invoice ${existing.number} already exists for this order` }, 400);
    const body = await readBody(request);

    const invId = nextId(db, "invoices");
    const invNum = `${db.settings.invoicePrefix}${String(db.invoices.length + 1).padStart(4, "0")}`;
    const dueDate = body.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
    const invoice = {
      id: invId,
      number: invNum,
      orderId: order.id,
      orderNumber: order.number,
      customerId: order.customerId,
      customerName: order.customerName,
      date: new Date().toISOString().split("T")[0],
      dueDate,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      paidAmount: 0,
      balance: order.total,
      status: "issued",
      createdAt: new Date().toISOString()
    };
    db.invoices.unshift(invoice);
    pushActivity(db, "invoice", `Invoice ${invNum} issued for order ${order.number}`, auth.user, invId);
    await saveDb(env, db);
    return json(invoice, 201);
  }

  if (segments[0] === "invoices" && segments[1] && segments[2] === "pay" && method === "POST") {
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const denied = requireRole(auth.user, ["admin", "manager", "sales"]);
    if (denied) return json({ error: denied.error }, denied.status);
    const db = await getDb(env);
    const invoice = db.invoices.find((r) => r.id === segments[1]);
    if (!invoice) return json({ error: "Invoice not found" }, 404);
    const body = await readBody(request);
    const amount = Number(body.amount);
    if (!amount || amount <= 0) return json({ error: "Valid amount required" }, 400);

    const payId = nextId(db, "payments");
    const payNum = `${db.settings.paymentPrefix}${String(db.payments.length + 1).padStart(4, "0")}`;
    const payment = {
      id: payId,
      number: payNum,
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      date: body.date || new Date().toISOString().split("T")[0],
      method: body.method || "Wire Transfer",
      amount,
      reference: body.reference || "",
      createdAt: new Date().toISOString()
    };
    db.payments.unshift(payment);

    invoice.paidAmount = Math.min(invoice.total, invoice.paidAmount + amount);
    invoice.balance = invoice.total - invoice.paidAmount;
    invoice.status = invoice.paidAmount >= invoice.total ? "paid" : "partial";
    if (invoice.status === "paid") invoice.paidDate = payment.date;

    const customer = db.customers.find((c) => c.id === invoice.customerId);
    if (customer) {
      customer.balance = Math.max(0, (customer.balance || 0) - amount);
    }

    pushActivity(db, "payment", `Payment ${payNum} of ${fmt(amount)} received for ${invoice.number}`, auth.user, payId);
    await saveDb(env, db);
    return json({ payment, invoice }, 201);
  }

  if (RESOURCES[segments[0]]) {
    const name = segments[0];
    const config = RESOURCES[name];
    const auth = await authenticate(request, env);
    if (auth.error) return json({ error: auth.error }, auth.status);
    const db = await getDb(env);

    if (segments.length === 1) {
      if (method === "GET") {
        const denied = requireRole(auth.user, config.roles);
        if (denied) return json({ error: denied.error }, denied.status);
        let result = applyQuery(db[name] || [], searchParams, config);
        if (searchParams.get("exportAll") === "1") {
          const cols = db[name] && db[name][0] ? Object.keys(db[name][0]) : [];
          const lines = [cols.map(csvEscape).join(",")];
          result.forEach((row) => lines.push(cols.map((c) => csvEscape(row[c])).join(",")));
          return new Response(lines.join("\n"), {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": `attachment; filename="${name}.csv"`
            }
          });
        }
        return json(listResponse(result, searchParams));
      }
      if (method === "POST") {
        const denied = requireRole(auth.user, config.writeRoles);
        if (denied) return json({ error: denied.error }, denied.status);
        const body = await readBody(request);
        if (name === "users") {
          const existing = db.users.some((u) => u.email.toLowerCase() === String(body.email).toLowerCase());
          if (existing) return json({ error: "Email already in use" }, 400);
        }
        body.id = nextId(db, name);
        body.createdAt = body.createdAt || new Date().toISOString().split("T")[0];
        const prefixKey = { quotes: "quotePrefix", orders: "orderPrefix", invoices: "invoicePrefix", payments: "paymentPrefix", purchaseOrders: "poPrefix" }[name];
        if (prefixKey && !body.number) {
          body.number = `${db.settings[prefixKey]}${String(db[name].length + 1).padStart(4, "0")}`;
        }
        if (name === "customers" && !body.code) {
          body.code = `C-${String(db.customers.length + 1).padStart(3, "0")}`;
        }
        if (name === "suppliers" && !body.code) {
          body.code = `S-${String(db.suppliers.length + 1).padStart(3, "0")}`;
        }
        db[name].unshift(body);
        pushActivity(db, "create", `${name.slice(0, -1)} ${body.number || body.name || body.sku || body.id} created`, auth.user, body.id);
        await saveDb(env, db);
        return json(body, 201);
      }
      return json({ error: "Method not allowed" }, 405);
    }

    if (segments.length === 2) {
      const row = (db[name] || []).find((r) => r.id === segments[1]);
      if (method === "GET") {
        const denied = requireRole(auth.user, config.roles);
        if (denied) return json({ error: denied.error }, denied.status);
        if (!row) return json({ error: "Not found" }, 404);
        return json(row);
      }
      if (method === "PUT") {
        const denied = requireRole(auth.user, config.writeRoles);
        if (denied) return json({ error: denied.error }, denied.status);
        const idx = db[name].findIndex((r) => r.id === segments[1]);
        if (idx === -1) return json({ error: "Not found" }, 404);
        const body = await readBody(request);
        const updated = { ...db[name][idx], ...(body || {}), id: db[name][idx].id };
        db[name][idx] = updated;
        pushActivity(db, "update", `${name.slice(0, -1)} ${updated.number || updated.name || updated.sku || updated.id} updated`, auth.user, updated.id);
        await saveDb(env, db);
        return json(updated);
      }
      if (method === "DELETE") {
        const denied = requireRole(auth.user, config.writeRoles);
        if (denied) return json({ error: denied.error }, denied.status);
        const idx = db[name].findIndex((r) => r.id === segments[1]);
        if (idx === -1) return json({ error: "Not found" }, 404);
        const removed = db[name].splice(idx, 1)[0];
        pushActivity(db, "delete", `${name.slice(0, -1)} ${removed.number || removed.name || removed.sku || removed.id} deleted`, auth.user, removed.id);
        await saveDb(env, db);
        return json({ ok: true });
      }
      return json({ error: "Method not allowed" }, 405);
    }
  }

  return json({ error: "Not found" }, 404);
}

export async function onRequest(context) {
  try {
    return await handle(context.request, context.env);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Server error" }, 500);
  }
}
