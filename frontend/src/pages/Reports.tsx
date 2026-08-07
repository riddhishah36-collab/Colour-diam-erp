import React, { useEffect, useMemo, useState } from "react";
import { api, buildQuery, currency } from "../api";
import { Button, Card, Input, Select, Spinner, Badge, statusTone, humanize, cn } from "../components/ui";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from "recharts";

type ReportType = "sales" | "inventory" | "receivables" | "suppliers";

interface SalesReport {
  summary: { orders: number; revenue: number; average: number; margin: number };
  byMonth: Array<{ month: string; revenue: number }>;
  byCustomer: Array<{ name: string; revenue: number }>;
  byItem: Array<{ name: string; revenue: number }>;
}
interface InventoryReport {
  byCategory: Array<{ category: string; count: number; value: number; cost: number }>;
  statusCounts: Record<string, number>;
  byOrigin: Array<{ origin: string; value: number }>;
}
interface ReceivablesReport {
  aging: { current: number; d1to30: number; d31to60: number; d60plus: number };
  total: number;
  byCustomer: Array<{ name: string; balance: number }>;
}
interface SupplierReport {
  totalSpend: number;
  purchaseOrders: number;
  bySupplier: Array<{ name: string; total: number }>;
}

const COLORS = ["#c19a5b", "#8a6536", "#d9b98a", "#5a4329", "#a97f42", "#e6cf9f"];

export default function Reports() {
  const [tab, setTab] = useState<ReportType>("sales");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [inventory, setInventory] = useState<InventoryReport | null>(null);
  const [receivables, setReceivables] = useState<ReceivablesReport | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierReport | null>(null);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const q = buildQuery(params);
    api.get<SalesReport>(`/api/reports/sales${q}`).then(setSales).catch(() => undefined);
    api.get<InventoryReport>(`/api/reports/inventory${q}`).then(setInventory).catch(() => undefined);
    api.get<ReceivablesReport>(`/api/reports/receivables${q}`).then(setReceivables).catch(() => undefined);
    api.get<SupplierReport>(`/api/reports/suppliers${q}`).then(setSuppliers).catch(() => undefined);
    setLoading(false);
  }, [from, to]);

  const tabs: Array<{ id: ReportType; label: string }> = [
    { id: "sales", label: "Sales" },
    { id: "inventory", label: "Inventory" },
    { id: "receivables", label: "Receivables" },
    { id: "suppliers", label: "Supplier spend" }
  ];

  const exportCsv = (name: string, rows: Array<Record<string, unknown>>, cols: Array<[string, string]>) => {
    const lines = [cols.map(([, h]) => h).join(",")];
    rows.forEach((r) => lines.push(cols.map(([k]) => { const v = r[k]; return v == null ? "" : `"${String(v).replace(/"/g, '""')}"`; }).join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthsShort = (m: string) => {
    const [y, mo] = m.split("-");
    return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
  };

  const agingRows = receivables
    ? [
        { label: "Current", value: receivables.aging.current, tone: "green" },
        { label: "1–30 days", value: receivables.aging.d1to30, tone: "gold" },
        { label: "31–60 days", value: receivables.aging.d31to60, tone: "amber" },
        { label: "60+ days", value: receivables.aging.d60plus, tone: "red" }
      ]
    : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-ink-100/70 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", tab === t.id ? "bg-white text-ink-950 shadow-sm" : "text-ink-600 hover:text-ink-900")}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
          <span className="text-xs text-ink-400">to</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <div>
          {tab === "sales" && sales && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <MiniStat label="Orders" value={String(sales.summary.orders)} />
                <MiniStat label="Revenue" value={currency(sales.summary.revenue)} />
                <MiniStat label="Average order" value={currency(sales.summary.average)} />
                <MiniStat label="Gross margin est." value={currency(sales.summary.margin)} />
              </div>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Card className="p-5">
                  <h3 className="mb-3 font-display text-lg font-semibold text-ink-950">Revenue by month</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={sales.byMonth} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ece8e2" vertical={false} />
                      <XAxis dataKey={(d) => monthsShort(d.month)} tick={{ fontSize: 11, fill: "#827460" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9c8e78" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                      <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #ece8e2", fontSize: 12 }} />
                      <Line type="monotone" dataKey="revenue" stroke="#c19a5b" strokeWidth={2.5} dot={{ fill: "#c19a5b", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
                <Card className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-ink-950">Top customers</h3>
                    <Button variant="secondary" size="sm" onClick={() => exportCsv("sales-by-customer", sales.byCustomer, [["name", "Customer"], ["revenue", "Revenue"]] as never)}>
                      Export
                    </Button>
                  </div>
                  <div className="space-y-2.5">
                    {sales.byCustomer.map((c) => (
                      <div key={c.name} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-ink-800">{c.name}</span>
                        <span className="shrink-0 font-semibold text-ink-900">{currency(c.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-ink-950">Revenue by item</h3>
                  <Button variant="secondary" size="sm" onClick={() => exportCsv("sales-by-item", sales.byItem, [["name", "Item"], ["revenue", "Revenue"]] as never)}>
                    Export
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {sales.byItem.map((it) => (
                    <div key={it.name} className="flex items-center justify-between gap-3 border-b border-ink-50 py-2 text-sm">
                      <span className="truncate text-ink-800">{it.name}</span>
                      <span className="shrink-0 font-medium text-ink-900">{currency(it.revenue)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {tab === "inventory" && inventory && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {inventory.byCategory.map((c) => (
                  <Card key={c.category} className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{humanize(c.category)}</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-ink-950">{currency(c.value)}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {c.count} items · cost {currency(c.cost)}
                    </p>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Card className="p-5">
                  <h3 className="mb-3 font-display text-lg font-semibold text-ink-950">Value by origin</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={inventory.byOrigin.map((o) => ({ name: o.origin, value: o.value }))} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {inventory.byOrigin.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #ece8e2", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {inventory.byOrigin.map((o, i) => (
                      <span key={o.origin} className="flex items-center gap-1.5 rounded-full bg-ivory px-2.5 py-1 text-xs text-ink-700">
                        <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {o.origin} · {currency(o.value)}
                      </span>
                    ))}
                  </div>
                </Card>
                <Card className="p-5">
                  <h3 className="mb-4 font-display text-lg font-semibold text-ink-950">Status distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(inventory.statusCounts).map(([name, value]) => (
                      <div key={name}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <Badge label={humanize(name)} tone={statusTone(name)} />
                          <span className="font-semibold text-ink-900">{value}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
                          <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.min(100, (value / Math.max(1, Object.values(inventory.statusCounts).reduce((a, b) => a + b, 0))) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {tab === "receivables" && receivables && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {agingRows.map((a) => (
                  <Card key={a.label} className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{a.label}</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-ink-950">{currency(a.value)}</p>
                  </Card>
                ))}
              </div>
              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-ink-950">Outstanding by customer</h3>
                  <span className="text-sm text-ink-500">
                    Total outstanding: <span className="font-semibold text-ink-900">{currency(receivables.total)}</span>
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                      <th className="py-2">Customer</th>
                      <th className="py-2 text-right">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {receivables.byCustomer.map((c) => (
                      <tr key={c.name}>
                        <td className="py-2.5 text-ink-800">{c.name}</td>
                        <td className="py-2.5 text-right font-medium text-ink-900">{currency(c.balance)}</td>
                      </tr>
                    ))}
                    {receivables.byCustomer.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-xs text-ink-400">
                          No outstanding balances.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {tab === "suppliers" && suppliers && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <MiniStat label="Total spend" value={currency(suppliers.totalSpend)} />
                <MiniStat label="Purchase orders" value={String(suppliers.purchaseOrders)} />
              </div>
              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-ink-950">Spend by supplier</h3>
                  <Button variant="secondary" size="sm" onClick={() => exportCsv("supplier-spend", suppliers.bySupplier, [["name", "Supplier"], ["total", "Total"]] as never)}>
                    Export
                  </Button>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={suppliers.bySupplier} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ece8e2" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#9c8e78" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                    <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12, fill: "#827460" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => currency(v)} contentStyle={{ borderRadius: 12, border: "1px solid #ece8e2", fontSize: 12 }} />
                    <Bar dataKey="total" fill="#c19a5b" radius={[0, 6, 6, 0]} maxBarSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink-950">{value}</p>
    </Card>
  );
}
