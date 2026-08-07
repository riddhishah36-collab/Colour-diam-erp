import express from "express";
import cors from "cors";
import { getDb, nextId, pushActivity, save, reset } from "./db.js";
import { login, authenticate, requireRole, canWrite, publicUser } from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

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

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const session = login(email, password);
  if (!session) return res.status(401).json({ error: "Invalid email or password" });
  res.json(session);
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get("/api/meta", (req, res) => {
  res.json(getDb().meta);
});

app.post("/api/meta", authenticate, requireRole(["admin", "manager"]), (req, res) => {
  const db = getDb();
  db.meta = { ...db.meta, ...(req.body || {}) };
  pushActivity("settings", "Company settings updated", req.user);
  save();
  res.json(db.meta);
});

app.get("/api/resources", (req, res) => {
  const db = getDb();
  res.json(
    Object.keys(RESOURCES).map((name) => ({
      name,
      count: (db[name] || []).length,
      searchFields: RESOURCES[name].search
    }))
  );
});

function applyQuery(rows, req, config) {
  let result = rows.slice();
  const { q, sort, dir, page, pageSize, exportAll } = req.query;

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

  Object.keys(req.query).forEach((key) => {
    if (key.startsWith("min_") || key.startsWith("max_")) {
      const field = key.slice(4);
      const val = Number(req.query[key]);
      result = result.filter((row) => {
        const v = Number(row[field]);
        if (Number.isNaN(v)) return false;
        return key.startsWith("min_") ? v >= val : v <= val;
      });
    } else if (key.startsWith("from_") || key.startsWith("to_")) {
      const field = key.slice(5);
      const val = String(req.query[key]);
      result = result.filter((row) => {
        if (!row[field]) return false;
        const rv = String(row[field]).slice(0, 10);
        return key.startsWith("from_") ? rv >= val : rv <= val;
      });
    } else if (["q", "sort", "dir", "page", "pageSize", "exportAll"].includes(key)) {
      return;
    } else {
      const val = String(req.query[key]);
      result = result.filter((row) => {
        if (Array.isArray(row[key])) return row[key].includes(val);
        return row[key] != null && String(row[key]) === val;
      });
    }
  });

  if (sort) {
    const dirn = dir === "desc" ? -1 : 1;
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

function listResponse(result, req) {
  const total = result.length;
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const pageSize = Math.min(500, Math.max(1, parseInt(req.query.pageSize || "50", 10)));
  const start = (page - 1) * pageSize;
  return { data: result.slice(start, start + pageSize), total, page, pageSize };
}

function csvEscape(val) {
  if (val == null) return "";
  const s = typeof val === "object" ? JSON.stringify(val) : String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

Object.keys(RESOURCES).forEach((name) => {
  const config = RESOURCES[name];

  app.get(`/api/${name}`, authenticate, requireRole(config.roles), (req, res) => {
    const db = getDb();
    let result = applyQuery(db[name] || [], req, config);
    if (req.query.exportAll === "1") {
      const cols = db[name] && db[name][0] ? Object.keys(db[name][0]) : [];
      const lines = [cols.map(csvEscape).join(",")];
      result.forEach((row) => lines.push(cols.map((c) => csvEscape(row[c])).join(",")));
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${name}.csv"`);
      return res.send(lines.join("\n"));
    }
    res.json(listResponse(result, req));
  });

  app.get(`/api/${name}/:id`, authenticate, requireRole(config.roles), (req, res) => {
    const row = (getDb()[name] || []).find((r) => r.id === req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });

  app.post(`/api/${name}`, authenticate, requireRole(config.writeRoles), (req, res) => {
    const db = getDb();
    const body = { ...(req.body || {}) };
    if (name === "users") {
      const existing = db.users.some((u) => u.email.toLowerCase() === String(body.email).toLowerCase());
      if (existing) return res.status(400).json({ error: "Email already in use" });
    }
    body.id = nextId(name);
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
    pushActivity("create", `${name.slice(0, -1)} ${body.number || body.name || body.sku || body.id} created`, req.user, body.id);
    save();
    res.status(201).json(body);
  });

  app.put(`/api/${name}/:id`, authenticate, requireRole(config.writeRoles), (req, res) => {
    const db = getDb();
    const idx = db[name].findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    const updated = { ...db[name][idx], ...(req.body || {}), id: db[name][idx].id };
    db[name][idx] = updated;
    pushActivity("update", `${name.slice(0, -1)} ${updated.number || updated.name || updated.sku || updated.id} updated`, req.user, updated.id);
    save();
    res.json(updated);
  });

  app.delete(`/api/${name}/:id`, authenticate, requireRole(config.writeRoles), (req, res) => {
    const db = getDb();
    const idx = db[name].findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    const removed = db[name].splice(idx, 1)[0];
    pushActivity("delete", `${name.slice(0, -1)} ${removed.number || removed.name || removed.sku || removed.id} deleted`, req.user, removed.id);
    save();
    res.json({ ok: true });
  });
});

app.post("/api/:resource/:id/convert", authenticate, requireRole(["admin", "manager", "sales"]), (req, res) => {
  const db = getDb();
  const { resource } = req.params;
  if (resource !== "quotes") return res.status(400).json({ error: "Only quotes can be converted" });
  const quote = db.quotes.find((r) => r.id === req.params.id);
  if (!quote) return res.status(404).json({ error: "Not found" });
  if (quote.status === "converted") return res.status(400).json({ error: "Already converted" });

  const orderId = nextId("orders");
  const orderNum = `${db.settings.orderPrefix}${String(db.orders.length + 1).padStart(4, "0")}`;
  const order = {
    id: orderId,
    number: orderNum,
    customerId: quote.customerId,
    customerName: quote.customerName,
    date: new Date().toISOString().split("T")[0],
    expectedDate: req.body.expectedDate || null,
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

  const invId = nextId("invoices");
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

  pushActivity("order", `Quote ${quote.number} converted to order ${orderNum}`, req.user, orderId);
  save();
  res.status(201).json({ order, invoice });
});

app.get("/api/global-search", authenticate, (req, res) => {
  const db = getDb();
  const q = String(req.query.q || "").trim().toLowerCase();
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
  res.json({ data: out.slice(0, 80), total: out.length });
});

app.get("/api/activities", authenticate, requireRole(["admin", "manager", "sales", "viewer"]), (req, res) => {
  const db = getDb();
  let result = db.activities.slice();
  const q = req.query.q;
  if (q) {
    const needle = String(q).toLowerCase();
    result = result.filter((a) => (a.message || "").toLowerCase().includes(needle) || (a.userName || "").toLowerCase().includes(needle));
  }
  const type = req.query.type;
  if (type) result = result.filter((a) => a.type === type);
  const total = result.length;
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || "25", 10)));
  const start = (page - 1) * pageSize;
  res.json({ data: result.slice(start, start + pageSize), total, page, pageSize });
});

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

app.get("/api/dashboard", authenticate, requireRole(["admin", "manager", "sales", "inventory", "viewer"]), (req, res) => {
  const db = getDb();
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

  res.json({
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
  });
});

app.get("/api/reports/:type", authenticate, requireRole(["admin", "manager", "sales", "viewer"]), (req, res) => {
  const db = getDb();
  const type = req.params.type;
  const from = req.query.from;
  const to = req.query.to;
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
    return res.json({
      summary: { orders: orders.length, revenue, average: orders.length ? Math.round(revenue / orders.length) : 0, margin: revenue - cost },
      byMonth: Object.entries(byMonth).sort().map(([month, revenue]) => ({ month, revenue })),
      byCustomer: Object.entries(byCustomer).sort((a, b) => b[1] - a[1]).map(([name, revenue]) => ({ name, revenue })),
      byItem: Object.entries(byItem).sort((a, b) => b[1] - a[1]).map(([name, revenue]) => ({ name, revenue }))
    });
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
    res.json({ byCategory, statusCounts, byOrigin: Object.entries(byOrigin).sort((a, b) => b[1] - a[1]).map(([origin, value]) => ({ origin, value })) });
    return;
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
    res.json({ aging, total, byCustomer: Object.entries(byCustomer).sort((a, b) => b[1] - a[1]).map(([name, balance]) => ({ name, balance })) });
    return;
  }

  if (type === "suppliers") {
    const spend = {};
    db.purchaseOrders.filter((po) => ["ordered", "received"].includes(po.status) && inRange(po.date)).forEach((po) => {
      spend[po.supplierName] = (spend[po.supplierName] || 0) + po.total;
    });
    const pocs = db.purchaseOrders.filter((po) => inRange(po.date)).length;
    res.json({
      totalSpend: Object.values(spend).reduce((s, v) => s + v, 0),
      purchaseOrders: pocs,
      bySupplier: Object.entries(spend).sort((a, b) => b[1] - a[1]).map(([name, total]) => ({ name, total }))
    });
    return;
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
    res.json({
      summary: { receivables, payables, cashIn, expensesTotal, netPosition, outstandingCustomerBalance: db.customers.reduce((s, c) => s + (c.balance || 0), 0) },
      byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([category, amount]) => ({ category, amount })),
      cashflow
    });
    return;
  }

  res.status(404).json({ error: "Unknown report" });
});

app.post("/api/orders/:id/issue-invoice", authenticate, requireRole(["admin", "manager", "sales"]), (req, res) => {
  const db = getDb();
  const order = db.orders.find((r) => r.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  const existing = db.invoices.find((i) => i.orderId === order.id);
  if (existing) return res.status(400).json({ error: `Invoice ${existing.number} already exists for this order` });

  const invId = nextId("invoices");
  const invNum = `${db.settings.invoicePrefix}${String(db.invoices.length + 1).padStart(4, "0")}`;
  const dueDate = req.body.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
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
  pushActivity("invoice", `Invoice ${invNum} issued for order ${order.number}`, req.user, invId);
  save();
  res.status(201).json(invoice);
});

app.post("/api/invoices/:id/pay", authenticate, requireRole(["admin", "manager", "sales"]), (req, res) => {
  const db = getDb();
  const invoice = db.invoices.find((r) => r.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: "Valid amount required" });

  const payId = nextId("payments");
  const payNum = `${db.settings.paymentPrefix}${String(db.payments.length + 1).padStart(4, "0")}`;
  const payment = {
    id: payId,
    number: payNum,
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    date: req.body.date || new Date().toISOString().split("T")[0],
    method: req.body.method || "Wire Transfer",
    amount,
    reference: req.body.reference || "",
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

  pushActivity("payment", `Payment ${payNum} of ${fmt(amount)} received for ${invoice.number}`, req.user, payId);
  save();
  res.status(201).json({ payment, invoice });
});

app.post("/api/admin/reset", authenticate, requireRole(["admin"]), (req, res) => {
  reset();
  res.json({ ok: true });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Colour Diam ERP API listening on http://localhost:${PORT}`);
});
