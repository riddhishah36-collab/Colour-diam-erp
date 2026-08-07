import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, currency, buildQuery } from "../api";
import { Badge, Card, statusTone, humanize, SearchInput, cn } from "../components/ui";
import { Icons } from "../nav";

interface Row {
  id: string;
  type: string;
  sku: string;
  name: string;
  carat?: number;
  colour?: string;
  origin?: string;
  lab?: string;
  certNumber?: string;
  location?: string;
  quantity: number;
  price: number;
  cost?: number;
  status: string;
  photos?: string[];
}

const TYPES = ["diamonds", "jewellery", "gemstones", "products"] as const;
const TYPE_LABEL: Record<string, string> = { diamonds: "Diamond", jewellery: "Jewellery", gemstones: "Gemstone", products: "Product" };
const TYPE_ROUTE: Record<string, string> = { diamonds: "/inventory/diamonds", jewellery: "/inventory/jewellery", gemstones: "/inventory/gemstones", products: "/inventory/products" };
const STATUSES = ["in-stock", "reserved", "pending", "sold", "on-consignment"];

export default function StockPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all(
      TYPES.map((t) =>
        api.get<{ data: Row[] }>(`/api/${t}${buildQuery({ pageSize: 1000 })}`).then((r) =>
          r.data.map((row) => ({ ...row, type: t }))
        )
      )
    )
      .then((groups) => {
        if (alive) setRows(groups.flat());
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (type && r.type !== type) return false;
      if (status && r.status !== status) return false;
      if (!needle) return true;
      const hay = [r.sku, r.name, r.colour, r.origin, r.lab, r.certNumber, r.location].join(" ").toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q, type, status]);

  const stats = useMemo(() => {
    const out: Record<string, number> = {};
    const value: Record<string, number> = {};
    STATUSES.forEach((s) => {
      out[s] = 0;
      value[s] = 0;
    });
    rows.forEach((r) => {
      out[r.status] = (out[r.status] || 0) + (r.quantity || 1);
      value[r.status] = (value[r.status] || 0) + (r.price || 0);
    });
    const inStock = rows.filter((r) => r.status === "in-stock");
    return {
      out,
      value,
      inventoryValue: inStock.reduce((s, r) => s + (r.price || 0), 0),
      inventoryCost: inStock.reduce((s, r) => s + (r.cost || 0), 0),
      margin: inStock.length ? ((inStock.reduce((s, r) => s + (r.price || 0), 0) - inStock.reduce((s, r) => s + (r.cost || 0), 0)) / inStock.reduce((s, r) => s + (r.price || 0), 0)) * 100 : 0,
      pieces: rows.filter((r) => r.status === "in-stock").length
    };
  }, [rows]);

  const exportCsv = () => {
    const header = ["type", "sku", "name", "carat", "colour", "origin", "lab", "certNumber", "location", "quantity", "price", "cost", "status"];
    const lines = filtered.map((r) => header.map((h) => JSON.stringify(String((r as unknown as Record<string, unknown>)[h] ?? ""))).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = [
    { label: "In-stock pieces", value: String(stats.pieces), icon: Icons.stock, tone: "green" },
    { label: "Inventory value", value: currency(stats.inventoryValue), icon: Icons.accounts, tone: "gold" },
    { label: "Cost", value: currency(stats.inventoryCost), icon: Icons.card, tone: "ink" },
    { label: "Gross margin", value: `${stats.margin.toFixed(1)}%`, icon: Icons.chart, tone: "blue" }
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{s.label}</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink-950">{s.value}</p>
              </div>
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", s.tone === "green" ? "bg-emerald-100 text-emerald-700" : s.tone === "gold" ? "bg-gold-100 text-gold-700" : s.tone === "blue" ? "bg-sky-100 text-sky-700" : "bg-ink-100 text-ink-700")}>
                {s.icon}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={q} onChange={setQ} placeholder="Search SKU, name, colour, cert…" className="w-64" />
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none">
              <option value="">All types</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABEL[t]}s</option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none">
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{humanize(s)}</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={exportCsv} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50">
            Export CSV
          </button>
        </div>

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ivory text-left text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Carat</th>
                <th className="px-4 py-3">Colour / Origin</th>
                <th className="px-4 py-3">Cert / Lab</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-xs text-ink-400">Loading stock…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-xs text-ink-400">No stock matches your filters.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={`${r.type}-${r.id}`} className="cursor-pointer transition-colors hover:bg-ivory" onClick={() => navigate(`${TYPE_ROUTE[r.type]}/${r.id}`)}>
                    <td className="px-4 py-3"><Badge label={TYPE_LABEL[r.type]} tone="gray" /></td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{r.name}</p>
                      <p className="font-mono text-xs text-ink-400">{r.sku}</p>
                    </td>
                    <td className="px-4 py-3">{r.carat ? `${Number(r.carat).toFixed(2)} ct` : "—"}</td>
                    <td className="px-4 py-3 text-ink-600">{r.colour || "—"}{r.origin ? ` · ${r.origin}` : ""}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-ink-600">{r.certNumber || "—"}</p>
                      <p className="text-[11px] text-ink-400">{r.lab || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500">{r.location || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink-950">{currency(r.price)}</td>
                    <td className="px-4 py-3"><Badge label={humanize(r.status)} tone={statusTone(r.status)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
