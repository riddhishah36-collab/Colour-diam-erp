import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { api, currency, fmtDate } from "../api";
import { Badge, Card, statusTone, humanize, Spinner, Modal, cn } from "../components/ui";
import { Icons } from "../nav";

interface Kpis {
  revenue: number;
  orders: number;
  activeOrders: number;
  inventoryValue: number;
  inventoryCost: number;
  receivables: number;
  customers: number;
  leads: number;
  pipelineValue: number;
  salesToday: number;
  salesThisMonth: number;
  salesThisYear: number;
  outstandingCustomerBalance: number;
  supplierPayable: number;
  pendingPayments: number;
  pendingOrders: number;
  memoStock: number;
  lowStock: number;
  tasksDue: number;
  unreadMessages: number;
  newEnquiries: number;
  leadsFollowUp: number;
}

interface DashboardData {
  kpis: Kpis;
  salesByMonth: Array<{ month: string; revenue: number; orders: number }>;
  statusCounts: Record<string, number>;
  stockByStatus: Record<string, number>;
  topItems: Array<{ name: string; qty: number }>;
  topCustomers: Array<{ name: string; revenue: number }>;
  leadStages: Record<string, number>;
  alerts: Array<{ severity: string; type: string; title: string; detail: string }>;
  categoryValue: Record<string, number>;
  recentTransactions: Array<{ type: string; number: string; party: string; amount: number; sign: number; date: string; method: string }>;
  tasksDueList: Array<{ title: string; dueDate: string; priority: string; status: string }>;
  lowStockList: Array<{ name?: string; sku?: string }>;
  memosOut: Array<{ number: string; customerName: string; totalValue: number; dueDate?: string }>;
  recentActivity: Array<{ id: string; type: string; message: string; userName?: string; createdAt: string }>;
}

const GOLD = "#c19a5b";
const PIECHART_COLORS = ["#c19a5b", "#2f6f4f", "#8a6536", "#a97f42", "#6b4f2a", "#d9b98a"];
const SEV_COLORS: Record<string, string> = { high: "bg-red-50 text-red-700", medium: "bg-amber-50 text-amber-700", low: "bg-ink-100 text-ink-600" };

const STORAGE_KEY = "cd_erp_dash_config";

interface DashConfig {
  order: string[];
  hidden: string[];
}

type Renderer = (d: DashboardData, nav: (p: string) => void) => React.ReactNode;

interface WidgetDef {
  key: string;
  title: string;
  size: 1 | 2;
  render: Renderer;
}

function MiniKpi({ label, value, sub, icon, tone }: { label: string; value: React.ReactNode; sub?: string; icon: React.ReactNode; tone: string }) {
  const tones: Record<string, string> = {
    gold: "bg-gold-100 text-gold-700",
    ink: "bg-ink-100 text-ink-700",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700"
  };
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <p className="mt-1.5 font-display text-xl font-semibold leading-tight text-ink-950">{value}</p>
        {sub && <p className="mt-0.5 truncate text-xs text-ink-500">{sub}</p>}
      </div>
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tones[tone])}>{icon}</span>
    </div>
  );
}

const WIDGETS: WidgetDef[] = [
  { key: "kpi_revenue", title: "Revenue received", size: 1, render: (d) => <MiniKpi label="Revenue received" value={currency(d.kpis.revenue)} sub={`${d.kpis.orders} orders · ${d.kpis.activeOrders} active`} icon={Icons.card} tone="gold" /> },
  { key: "kpi_inventory", title: "Inventory value", size: 1, render: (d) => <MiniKpi label="Inventory value" value={currency(d.kpis.inventoryValue)} sub={`Cost ${currency(d.kpis.inventoryCost)}`} icon={Icons.diamond} tone="ink" /> },
  { key: "kpi_sales_month", title: "Sales this month", size: 1, render: (d) => <MiniKpi label="Sales this month" value={currency(d.kpis.salesThisMonth)} sub={`${currency(d.kpis.salesToday)} today`} icon={Icons.chart} tone="green" /> },
  { key: "kpi_receivables", title: "Receivables", size: 1, render: (d) => <MiniKpi label="Receivables" value={currency(d.kpis.receivables)} sub={`${currency(d.kpis.pendingPayments)} pending`} icon={Icons.invoice} tone="red" /> },
  { key: "kpi_memo", title: "Memos out", size: 1, render: (d) => <MiniKpi label="Memos out" value={currency(d.kpis.memoStock)} sub={`${d.memosOut.length} on consignment`} icon={Icons.memo} tone="blue" /> },
  { key: "kpi_payable", title: "Supplier payable", size: 1, render: (d) => <MiniKpi label="Supplier payable" value={currency(d.kpis.supplierPayable)} sub={`${currency(d.kpis.outstandingCustomerBalance)} client balances`} icon={Icons.supplier} tone="amber" /> },
  { key: "kpi_pipeline", title: "Pipeline", size: 1, render: (d) => <MiniKpi label="Pipeline value" value={currency(d.kpis.pipelineValue)} sub={`${d.kpis.leads} leads · ${d.kpis.newEnquiries} new enquiries`} icon={Icons.quote} tone="green" /> },
  { key: "kpi_attention", title: "Attention", size: 1, render: (d) => <MiniKpi label="Needs attention" value={`${d.kpis.tasksDue + d.kpis.lowStock + d.kpis.leadsFollowUp}`} sub={`${d.kpis.tasksDue} tasks due · ${d.kpis.lowStock} low stock`} icon={Icons.activity} tone="red" /> },
  { key: "revenue_chart", title: "Revenue", size: 2, render: (d) => {
      const monthLabel = (m: string) => { const [y, mo] = m.split("-"); return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-GB", { month: "short" }); };
      return (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink-950">Revenue</h3>
              <p className="text-xs text-ink-500">Order value over the last 6 months · {currency(d.kpis.salesThisYear)} this year</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-ink-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gold-500" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ink-300" /> Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={d.salesByMonth} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey={(x) => monthLabel(x.month)} tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
              <Tooltip formatter={(value: number, name: string) => (name === "revenue" ? [currency(value), "Revenue"] : [value, "Orders"])} contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }} />
              <Bar dataKey="revenue" fill={GOLD} radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="orders" fill="#d4d4d8" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </>
      );
    } },
  { key: "category_value", title: "Inventory value by category", size: 1, render: (d) => (
      <>
        <div className="mb-2">
          <h3 className="font-display text-lg font-semibold text-ink-950">Inventory value</h3>
          <p className="text-xs text-ink-500">By category</p>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={Object.entries(d.categoryValue).map(([name, value]) => ({ name: humanize(name), value }))} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={3}>
              {Object.entries(d.categoryValue).map((_, i) => (
                <Cell key={i} fill={PIECHART_COLORS[i % PIECHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 space-y-1.5">
          {Object.entries(d.categoryValue).map(([name, value], i) => (
            <div key={name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-ink-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIECHART_COLORS[i % PIECHART_COLORS.length] }} />
                {humanize(name)}
              </span>
              <span className="font-medium text-ink-900">{currency(value)}</span>
            </div>
          ))}
        </div>
      </>
    ) },
  { key: "alerts", title: "Attention needed", size: 1, render: (d) => (
      <>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-950">Attention needed</h3>
            <p className="text-xs text-ink-500">Alerts across the business</p>
          </div>
          <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-800">{d.alerts.length}</span>
        </div>
        <div className="space-y-2.5">
          {d.alerts.length === 0 && <p className="py-6 text-center text-xs text-ink-400">All clear — nothing needs attention.</p>}
          {d.alerts.map((a, i) => (
            <div key={i} className="rounded-xl bg-ivory p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">{a.type}</span>
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", SEV_COLORS[a.severity])}>{a.severity}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-ink-900">{a.title}</p>
              <p className="text-xs text-ink-500">{a.detail}</p>
            </div>
          ))}
        </div>
      </>
    ) },
  { key: "stock_status", title: "Stock position", size: 1, render: (d) => (
      <>
        <div className="mb-3">
          <h3 className="font-display text-lg font-semibold text-ink-950">Stock position</h3>
          <p className="text-xs text-ink-500">Available · reserved · sold · memo</p>
        </div>
        <div className="space-y-3">
          {Object.entries(d.stockByStatus).map(([name, value]) => (
            <div key={name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium capitalize text-ink-600">{name.replace("-", " ")}</span>
                <span className="font-semibold text-ink-900">{value}</span>
              </div>
              <div className="h-2 rounded-full bg-ink-100">
                <div className={cn("h-full rounded-full", name === "available" ? "bg-emerald-500" : name === "sold" ? "bg-ink-300" : name === "consignment" ? "bg-sky-500" : "bg-gold-500")} style={{ width: `${Math.min(100, (value / Math.max(1, d.stockByStatus.available)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </>
    ) },
  { key: "transactions", title: "Recent transactions", size: 1, render: (d, nav) => (
      <>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-950">Transactions</h3>
            <p className="text-xs text-ink-500">Latest cash in and out</p>
          </div>
          <button onClick={() => nav("/finance/accounts")} className="text-xs font-medium text-gold-700 hover:text-gold-800">Accounts →</button>
        </div>
        <div className="divide-y divide-ink-50">
          {d.recentTransactions.map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", t.sign > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600")}>
                {t.sign > 0 ? Icons.card : Icons.expense}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{t.number}</p>
                <p className="truncate text-xs text-ink-500">{t.party} · {fmtDate(t.date)}</p>
              </div>
              <span className={cn("text-sm font-semibold", t.sign > 0 ? "text-emerald-700" : "text-red-600")}>{t.sign > 0 ? "+" : "−"}{currency(t.amount)}</span>
            </div>
          ))}
          {d.recentTransactions.length === 0 && <p className="py-6 text-center text-xs text-ink-400">No transactions yet.</p>}
        </div>
      </>
    ) },
  { key: "memos_out", title: "Consignments out", size: 1, render: (d, nav) => (
      <>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-950">Consignments out</h3>
            <p className="text-xs text-ink-500">Memos on approval</p>
          </div>
          <button onClick={() => nav("/sales/memos")} className="text-xs font-medium text-gold-700 hover:text-gold-800">Memos →</button>
        </div>
        <div className="space-y-2.5">
          {d.memosOut.map((m) => (
            <div key={m.number} className="rounded-xl bg-ivory p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-900">{m.number}</span>
                <Badge label="Out-standing" tone="amber" />
              </div>
              <p className="mt-0.5 text-xs text-ink-500">{m.customerName}{m.dueDate ? ` · due ${fmtDate(m.dueDate)}` : ""}</p>
              <p className="mt-1 font-display text-base font-semibold text-ink-950">{currency(m.totalValue)}</p>
            </div>
          ))}
          {d.memosOut.length === 0 && <p className="py-6 text-center text-xs text-ink-400">No memos currently out.</p>}
        </div>
      </>
    ) },
  { key: "tasks_due", title: "Tasks due", size: 1, render: (d, nav) => (
      <>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-950">Tasks due</h3>
            <p className="text-xs text-ink-500">{d.kpis.tasksDue} overdue or due today</p>
          </div>
          <button onClick={() => nav("/tasks")} className="text-xs font-medium text-gold-700 hover:text-gold-800">All tasks →</button>
        </div>
        <div className="space-y-2.5">
          {d.tasksDueList.map((t, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-ivory px-3 py-2.5">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-ink-300")} />
              <p className="min-w-0 flex-1 truncate text-sm text-ink-800">{t.title}</p>
              <span className="shrink-0 text-xs text-ink-400">due {fmtDate(t.dueDate)}</span>
            </div>
          ))}
          {d.tasksDueList.length === 0 && <p className="py-6 text-center text-xs text-ink-400">No tasks due.</p>}
        </div>
      </>
    ) },
  { key: "top_items", title: "Top items", size: 1, render: (d) => (
      <>
        <div className="mb-4">
          <h3 className="font-display text-lg font-semibold text-ink-950">Top items</h3>
          <p className="text-xs text-ink-500">Most ordered</p>
        </div>
        <div className="space-y-3">
          {d.topItems.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-100 font-display text-sm font-semibold text-gold-800">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink-800">{t.name}</span>
              <span className="text-sm font-semibold text-ink-900">×{t.qty}</span>
            </div>
          ))}
        </div>
      </>
    ) },
  { key: "top_customers", title: "Top customers", size: 1, render: (d, nav) => (
      <>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-950">Top customers</h3>
            <p className="text-xs text-ink-500">By revenue</p>
          </div>
          <button onClick={() => nav("/crm/customers")} className="text-xs font-medium text-gold-700 hover:text-gold-800">View all →</button>
        </div>
        <div className="space-y-3">
          {d.topCustomers.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-950 text-xs font-semibold text-gold-200">{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{c.name}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.max(6, (c.revenue / Math.max(1, d.topCustomers[0].revenue)) * 100)}%` }} />
                </div>
              </div>
              <span className="text-sm font-semibold text-ink-900">{currency(c.revenue)}</span>
            </div>
          ))}
        </div>
      </>
    ) },
  { key: "lead_stages", title: "Lead pipeline", size: 1, render: (d) => (
      <>
        <div className="mb-2">
          <h3 className="font-display text-lg font-semibold text-ink-950">Lead pipeline</h3>
          <p className="text-xs text-ink-500">Opportunities by stage · {currency(d.kpis.pipelineValue)}</p>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={Object.entries(d.leadStages).map(([name, value]) => ({ name: humanize(name), value }))} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#71717a" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} width={22} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }} />
            <Bar dataKey="value" fill="#171717" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </>
    ) },
  { key: "recent_activity", title: "Recent activity", size: 2, render: (d, nav) => (
      <>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-950">Recent activity</h3>
            <p className="text-xs text-ink-500">Latest changes across the ERP</p>
          </div>
          <button onClick={() => nav("/admin/activity")} className="text-xs font-medium text-gold-700 hover:text-gold-800">Full audit trail →</button>
        </div>
        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
          {d.recentActivity.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-950 text-[10px] font-semibold uppercase text-gold-200">{(a.userName || "S").split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <p className="min-w-0 flex-1 truncate text-sm text-ink-800">{a.message}</p>
              <p className="shrink-0 text-xs text-ink-400">{fmtDate(a.createdAt)}</p>
            </div>
          ))}
        </div>
      </>
    ) }
];

function loadConfig(): DashConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DashConfig;
      if (Array.isArray(parsed.order) && parsed.order.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { order: WIDGETS.map((w) => w.key), hidden: [] };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<DashConfig>(loadConfig);
  const [customizing, setCustomizing] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<DashboardData>("/api/dashboard").then(setData).catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  const visibleOrder = useMemo(() => {
    const hidden = new Set(config.hidden);
    const order = config.order.filter((k) => WIDGETS.some((w) => w.key === k));
    WIDGETS.forEach((w) => {
      if (!order.includes(w.key)) order.push(w.key);
    });
    return order.filter((k) => !hidden.has(k));
  }, [config]);

  const persist = (next: DashConfig) => {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggleWidget = (key: string) => {
    const hidden = config.hidden.includes(key) ? config.hidden.filter((k) => k !== key) : [...config.hidden, key];
    persist({ ...config, hidden });
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const order = config.order.filter((k) => WIDGETS.some((w) => w.key === k));
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    persist({ ...config, order });
  };

  if (error) {
    return <div className="flex h-64 items-center justify-center text-sm text-red-600">{error}</div>;
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-semibold text-ink-950">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <p className="text-xs text-ink-500">Your personalised overview — drag widgets to reorder, or open Customise to toggle them.</p>
        </div>
        <button
          type="button"
          onClick={() => setCustomizing(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Customise
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleOrder.map((key, idx) => {
          const widget = WIDGETS.find((w) => w.key === key)!;
          return (
            <div
              key={key}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx != null) reorder(dragIdx, idx);
                setDragIdx(null);
              }}
              onDragEnd={() => setDragIdx(null)}
              className={cn("group relative", widget.size === 2 && "md:col-span-2", "xl:col-span-1", widget.size === 2 && "xl:col-span-2")}
            >
              <div className="absolute -top-2 left-1/2 z-10 hidden -translate-x-1/2 cursor-grab rounded-full bg-ink-950 px-2 py-0.5 text-[10px] font-medium text-gold-100 shadow group-hover:block" title="Drag to reorder">
                ≡ drag
              </div>
              <Card className={cn("h-full p-5", dragIdx === idx && "opacity-60 ring-2 ring-gold-400")}>
                {widget.render(data, navigate)}
              </Card>
            </div>
          );
        })}
      </div>

      <Modal open={customizing} onClose={() => setCustomizing(false)} title="Customise dashboard" width="max-w-lg">
        <p className="mb-4 text-sm text-ink-500">Drag cards on the dashboard to reorder. Here you can show or hide widgets — your layout is saved on this device.</p>
        <div className="space-y-2">
          {config.order.map((key) => {
            const widget = WIDGETS.find((w) => w.key === key);
            if (!widget) return null;
            const isHidden = config.hidden.includes(key);
            return (
              <label key={key} className="flex cursor-pointer items-center justify-between rounded-xl bg-ivory px-4 py-3">
                <span className="text-sm font-medium text-ink-800">{widget.title}</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={!isHidden} onChange={() => toggleWidget(key)} className="peer sr-only" />
                  <span className="h-6 w-10 rounded-full bg-ink-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-gold-500 peer-checked:after:translate-x-4" />
                </span>
              </label>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
