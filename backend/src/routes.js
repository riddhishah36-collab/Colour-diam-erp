import { Router } from 'express';
import MODULES from './modules.js';
import * as db from './db.js';

const router = Router();
const moduleByKey = new Map(MODULES.map((m) => [m.key, m]));

function pickFields(mod, body) {
  const out = {};
  for (const f of mod.fields) {
    if (f.readonly) continue;
    if (body[f.key] !== undefined) out[f.key] = body[f.key];
  }
  return out;
}

function matchesQuery(row, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return Object.values(row).some((v) =>
    String(v == null ? '' : v).toLowerCase().includes(needle),
  );
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function escapeCsv(v) {
  const s = String(v == null ? '' : v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows, fields) {
  const header = fields.map((f) => escapeCsv(f.label)).join(',');
  const lines = rows.map((row) =>
    fields.map((f) => escapeCsv(row[f.key])).join(','),
  );
  return [header, ...lines].join('\r\n');
}

// ---- Meta: module registry for the frontend ----
router.get('/meta', (_req, res) => {
  const data = db.load();
  const modules = MODULES.map((m) => ({
    key: m.key,
    name: m.name,
    icon: m.icon,
    group: m.group,
    description: m.description,
    fields: m.fields,
    count: data[m.key] ? data[m.key].length : 0,
  }));
  res.json({ modules });
});

// ---- System reset (re-seed everything) ----
router.post('/system/reset', (_req, res) => {
  db.reset();
  const data = db.load();
  const counts = {};
  for (const mod of MODULES) counts[mod.key] = data[mod.key].length;
  res.json({ ok: true, message: 'Database reset & reseeded.', counts });
});

// ---- Dashboard ----
router.get('/dashboard/summary', (_req, res) => {
  const data = db.load();
  const diamonds = data.diamonds || [];
  const products = data.products || [];
  const stock = data.stock || [];
  const memos = data.memos || [];
  const tasks = data.tasks || [];
  const expenses = data.expenses || [];
  const accounts = data.accounts || [];
  const messages = data.messages || [];
  const returns = data.returns || [];

  const month = '2026-07';
  const sum = (rows, field) => rows.reduce((acc, r) => acc + toNumber(r[field]), 0);
  const stockValue = sum(stock.filter((r) => r.type !== 'Stock Out'), 'totalValue');
  const expenseMonth = sum(expenses.filter((r) => (r.date || '').startsWith(month)), 'amount');
  const receivableOpen = sum(accounts.filter((r) => r.type === 'Receivable' && r.status !== 'Settled'), 'amount');
  const payableOpen = sum(accounts.filter((r) => r.type === 'Payable' && r.status !== 'Settled'), 'amount');

  const pipeline = diamonds.filter((r) => r.status === 'Available');
  const pipelineValue = sum(pipeline, 'price');

  res.json({
    counts: {
      diamondsTotal: diamonds.length,
      diamondsAvailable: pipeline.length,
      products: products.length,
      stockValue,
      pipelineValue,
      memosOutstanding: memos.filter((r) => r.status === 'Outstanding').length,
      memosValue: sum(memos.filter((r) => r.status === 'Outstanding'), 'value'),
      tasksOpen: tasks.filter((r) => r.status !== 'Done').length,
      tasksDone: tasks.filter((r) => r.status === 'Done').length,
      expensesMonth: expenseMonth,
      receivables: receivableOpen,
      payables: payableOpen,
      messagesUnread: messages.filter((r) => r.status === 'Unread').length,
      returnsOpen: returns.filter((r) => !['Restocked', 'Closed', 'Refunded', 'Exchanged'].includes(r.status)).length,
    },
    recentDiamonds: [...diamonds]
      .sort((a, b) => String(b.stockNo).localeCompare(String(a.stockNo)))
      .slice(0, 6)
      .map((d) => ({
        id: d.id,
        stockNo: d.stockNo,
        shape: d.shape,
        carat: d.carat,
        color: d.color,
        clarity: d.clarity,
        lab: d.lab,
        intensity: d.intensity,
        modifier: d.modifier,
        price: d.price,
        status: d.status,
      })),
    recentTasks: [...tasks].slice(-6).reverse().map((t) => ({
      id: t.id, title: t.title, assignee: t.assignee, priority: t.priority, status: t.status, dueDate: t.dueDate,
    })),
    recentActivity: buildRecentActivity(data),
    accountAging: buildAging(accounts),
  });
});

// ---- Accounts report ----
router.get('/reports/accounts', (_req, res) => {
  const data = db.load();
  const accounts = data.accounts || [];
  const expenses = data.expenses || [];

  const sum = (rows) => rows.reduce((acc, r) => acc + toNumber(r.amount), 0);

  const receivables = accounts.filter((r) => r.type === 'Receivable');
  const payables = accounts.filter((r) => r.type === 'Payable');
  const receipts = accounts.filter((r) => r.type === 'Receipt');
  const payments = accounts.filter((r) => r.type === 'Payment');

  const receivableOpen = receivables.filter((r) => r.status !== 'Settled');
  const payableOpen = payables.filter((r) => r.status !== 'Settled');

  const byParty = new Map();
  for (const r of receivableOpen) {
    const b = byParty.get(r.party) || { party: r.party, receivables: 0, payables: 0, open: 0, openCount: 0 };
    b.receivables += toNumber(r.amount);
    b.open += toNumber(r.amount);
    b.openCount += 1;
    byParty.set(r.party, b);
  }
  for (const r of payableOpen) {
    const b = byParty.get(r.party) || { party: r.party, receivables: 0, payables: 0, open: 0, openCount: 0 };
    b.payables += toNumber(r.amount);
    b.open += toNumber(r.amount);
    b.openCount += 1;
    byParty.set(r.party, b);
  }

  const cashflow = { in: {}, out: {} };
  const addMonth = (bucket, date, amount) => {
    const m = (date || '').slice(0, 7);
    if (m) bucket[m] = (bucket[m] || 0) + amount;
  };
  for (const r of receipts) addMonth(cashflow.in, r.date, Math.abs(toNumber(r.amount)));
  for (const r of payments) addMonth(cashflow.out, r.date, Math.abs(toNumber(r.amount)));

  const months = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
  const cashflowSeries = months.map((m) => ({
    month: m,
    in: Math.round(cashflow.in[m] || 0),
    out: Math.round(cashflow.out[m] || 0),
    net: Math.round((cashflow.in[m] || 0) - (cashflow.out[m] || 0)),
  }));

  const expenseByCategory = {};
  for (const e of expenses) {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + toNumber(e.amount);
  }

  res.json({
    generatedAt: new Date().toISOString(),
    summary: {
      totalReceivables: sum(receivables),
      openReceivables: sum(receivableOpen),
      totalPayables: sum(payables),
      openPayables: sum(payableOpen),
      receiptsTotal: sum(receipts),
      paymentsTotal: sum(payments),
      netPosition: Math.round(sum(receipts) - sum(payments)),
      expensesTotal: sum(expenses),
    },
    aging: buildAging(accounts),
    byParty: [...byParty.values()].sort((a, b) => b.open - a.open),
    cashflowSeries,
    expenseByCategory,
  });
});

// ---- Generic CRUD + CSV export per module ----
router.get('/:module/export/csv', (req, res) => {
  const mod = moduleByKey.get(req.params.module);
  if (!mod) return res.status(404).json({ error: 'Unknown module' });
  const rows = db.collection(mod.key).filter((r) => matchesQuery(r, req.query.q));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${mod.key}-export.csv"`,
  );
  res.send(toCsv(rows, mod.fields));
});

router.get('/:module', (req, res) => {
  const mod = moduleByKey.get(req.params.module);
  if (!mod) return res.status(404).json({ error: 'Unknown module' });
  let rows = db.collection(mod.key);
  const { q, sort, order, limit } = req.query;
  if (q) rows = rows.filter((r) => matchesQuery(r, q));
  if (sort && order) {
    const dir = order === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
    });
  }
  if (limit) rows = rows.slice(0, Number(limit));
  res.json({ module: mod.key, total: db.collection(mod.key).length, rows });
});

router.get('/:module/:id', (req, res) => {
  const mod = moduleByKey.get(req.params.module);
  if (!mod) return res.status(404).json({ error: 'Unknown module' });
  const row = db.getById(mod.key, req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/:module', (req, res) => {
  const mod = moduleByKey.get(req.params.module);
  if (!mod) return res.status(404).json({ error: 'Unknown module' });
  const record = db.insert(mod.key, pickFields(mod, req.body || {}));
  res.status(201).json(record);
});

router.put('/:module/:id', (req, res) => {
  const mod = moduleByKey.get(req.params.module);
  if (!mod) return res.status(404).json({ error: 'Unknown module' });
  const updated = db.update(mod.key, req.params.id, pickFields(mod, req.body || {}));
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:module/:id', (req, res) => {
  const mod = moduleByKey.get(req.params.module);
  if (!mod) return res.status(404).json({ error: 'Unknown module' });
  const ok = db.remove(mod.key, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

function buildRecentActivity(data) {
  const events = [];
  const push = (rows, kind, map) =>
    rows.forEach((r) => events.push(map(r)));

  push(data.stock || [], 'stock', (r) => ({
    kind: 'stock',
    text: `${r.type}: ${r.item}${r.quantity !== 1 ? ` (x${r.quantity})` : ''}`,
    date: r.date,
    meta: r.party || r.location || '',
  }));
  push(data.memos || [], 'memo', (r) => ({
    kind: 'memo',
    text: `Memo ${r.memoNo} ${r.status.toLowerCase()} for ${r.customer}`,
    date: r.dueDate || r.issueDate,
    meta: `${r.diamondRef}`,
  }));
  push(data.returns || [], 'return', (r) => ({
    kind: 'return',
    text: `Return ${r.returnNo} ${r.status.toLowerCase()} - ${r.customer}`,
    date: r.date,
    meta: r.diamondRef,
  }));
  push(data.expenses || [], 'expense', (r) => ({
    kind: 'expense',
    text: `${r.category}: ${r.vendor} (${r.amount})`,
    date: r.date,
    meta: '',
  }));

  return events
    .filter((e) => e.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 12);
}

function buildAging(accounts) {
  const today = new Date('2026-07-31');
  const buckets = { current: 0, d30: 0, d60: 0, d90: 0 };
  const open = accounts.filter((r) => r.type === 'Receivable' && r.status !== 'Settled');
  for (const r of open) {
    if (!r.dueDate) { buckets.current += toNumber(r.amount); continue; }
    const due = new Date(r.dueDate);
    const days = Math.max(0, Math.floor((today - due) / 86400000));
    if (days <= 0) buckets.current += toNumber(r.amount);
    else if (days <= 30) buckets.d30 += toNumber(r.amount);
    else if (days <= 60) buckets.d60 += toNumber(r.amount);
    else buckets.d90 += toNumber(r.amount);
  }
  return buckets;
}

export default router;
