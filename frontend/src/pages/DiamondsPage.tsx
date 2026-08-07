import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, buildQuery, currency } from "../api";
import { Badge, Card, statusTone, humanize, SearchInput, Spinner, cn } from "../components/ui";
import { Icons } from "../nav";

interface Diamond {
  id: string;
  sku: string;
  name: string;
  carat: number;
  color: string;
  colourIntensity?: string;
  colourModifier?: string;
  clarity: string;
  cut?: string;
  lab?: string;
  certNumber?: string;
  origin?: string;
  shape: string;
  measurements?: string;
  depth?: number;
  table?: number;
  price: number;
  pricePerCarat?: number;
  status: string;
  location?: string;
  photos?: string[];
}

const VIEW_KEY = "cd_erp_diamond_view";

export default function DiamondsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "visual">(() => {
    try {
      return (localStorage.getItem(VIEW_KEY) as "table" | "visual") || "table";
    } catch {
      return "table";
    }
  });
  const [rows, setRows] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: Diamond[] }>(`/api/diamonds${buildQuery({ pageSize: 1000 })}`)
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  }, []);

  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [caratMin, setCaratMin] = useState("");
  const [caratMax, setCaratMax] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filters.status && r.status !== filters.status) return false;
      if (filters.color && !String(r.color).includes(filters.color)) return false;
      if (filters.intensity && r.colourIntensity !== filters.intensity) return false;
      if (filters.clarity && r.clarity !== filters.clarity) return false;
      if (filters.lab && r.lab !== filters.lab) return false;
      if (filters.origin && r.origin !== filters.origin) return false;
      if (caratMin && r.carat < Number(caratMin)) return false;
      if (caratMax && r.carat > Number(caratMax)) return false;
      if (!needle) return true;
      return [r.sku, r.name, r.color, r.clarity, r.certNumber, r.shape, r.origin, r.lab].join(" ").toLowerCase().includes(needle);
    });
  }, [rows, q, filters, caratMin, caratMax]);

  const distinct = useMemo(() => {
    const uniq = (k: keyof Diamond) => Array.from(new Set(rows.map((r) => String(r[k] ?? "")).filter(Boolean))).sort();
    return {
      color: uniq("color"),
      intensity: uniq("colourIntensity"),
      clarity: uniq("clarity"),
      lab: uniq("lab"),
      origin: uniq("origin"),
      status: uniq("status")
    };
  }, [rows]);

  const switchView = (v: "table" | "visual") => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-700">Diamonds</p>
          <p className="text-xs text-ink-500">{filtered.length} of {rows.length} stones · fancy colour and white</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-ink-100 p-1">
          <button type="button" onClick={() => switchView("table")} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", view === "table" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700")}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
            Table
          </button>
          <button type="button" onClick={() => switchView("visual")} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", view === "visual" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700")}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>
            Visual
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search SKU, colour, cert, shape…" className="w-60" />
          <select value={filters.color || ""} onChange={(e) => setFilters({ ...filters, color: e.target.value })} className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none">
            <option value="">All colours</option>
            {distinct.color.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.intensity || ""} onChange={(e) => setFilters({ ...filters, intensity: e.target.value })} className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none">
            <option value="">All intensities</option>
            {distinct.intensity.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.clarity || ""} onChange={(e) => setFilters({ ...filters, clarity: e.target.value })} className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none">
            <option value="">All clarity</option>
            {distinct.clarity.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.lab || ""} onChange={(e) => setFilters({ ...filters, lab: e.target.value })} className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none">
            <option value="">All labs</option>
            {distinct.lab.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.origin || ""} onChange={(e) => setFilters({ ...filters, origin: e.target.value })} className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none">
            <option value="">All origins</option>
            {distinct.origin.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.status || ""} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-ink-200 outline-none">
            <option value="">All statuses</option>
            {distinct.status.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
          </select>
          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <input type="number" value={caratMin} onChange={(e) => setCaratMin(e.target.value)} placeholder="Min ct" className="w-20 rounded-lg border-0 bg-white px-2 py-2 text-sm ring-1 ring-ink-200 outline-none placeholder:text-ink-400" />
            –
            <input type="number" value={caratMax} onChange={(e) => setCaratMax(e.target.value)} placeholder="Max ct" className="w-20 rounded-lg border-0 bg-white px-2 py-2 text-sm ring-1 ring-ink-200 outline-none placeholder:text-ink-400" />
          </div>
        </div>

        {view === "table" ? (
          <TableRows rows={filtered} loading={loading} onOpen={(id) => navigate(`/inventory/diamonds/${id}`)} />
        ) : (
          <VisualGrid rows={filtered} loading={loading} onOpen={(id) => navigate(`/inventory/diamonds/${id}`)} />
        )}
      </Card>
    </div>
  );
}

function StoneVisual({ diamond, className }: { diamond: Diamond; className?: string }) {
  if (diamond.photos && diamond.photos.length > 0) {
    return <img src={diamond.photos[0]} alt={diamond.name} className={cn("object-cover", className)} />;
  }
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <svg className="h-16 w-16 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l3 5-9 13L3 8l3-5zM3 8h18M9 3l3 5 3-5M12 21l-3-13" />
      </svg>
      <span className="mt-2 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-500">{diamond.shape}</span>
    </div>
  );
}

function TableRows({ rows, loading, onOpen }: { rows: Diamond[]; loading: boolean; onOpen: (id: string) => void }) {
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-ivory text-left text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3">Stone</th>
            <th className="px-4 py-3">Carat</th>
            <th className="px-4 py-3">Colour</th>
            <th className="px-4 py-3">Clarity</th>
            <th className="px-4 py-3">Cut</th>
            <th className="px-4 py-3">Measurements</th>
            <th className="px-4 py-3">Cert</th>
            <th className="px-4 py-3 text-right">$ / ct</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-50">
          {loading ? (
            <tr><td colSpan={10} className="px-4 py-12 text-center"><Spinner /></td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={10} className="px-4 py-12 text-center text-xs text-ink-400">No diamonds match your filters.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="cursor-pointer transition-colors hover:bg-ivory" onClick={() => onOpen(r.id)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-300">{Icons.diamond}</div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900">{r.name}</p>
                      <p className="font-mono text-xs text-ink-400">{r.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{Number(r.carat).toFixed(2)} ct</td>
                <td className="px-4 py-3">
                  <span className="text-ink-700">{r.color}</span>
                  {r.colourIntensity && <span className="ml-1 text-[10px] uppercase text-ink-400">{r.colourIntensity}</span>}
                </td>
                <td className="px-4 py-3 text-ink-700">{r.clarity}</td>
                <td className="px-4 py-3 text-xs text-ink-600">{r.cut || "—"}</td>
                <td className="px-4 py-3 text-xs text-ink-500">{r.measurements || "—"}{r.depth ? ` · ${r.depth}%` : ""}</td>
                <td className="px-4 py-3">
                  <p className="text-xs text-ink-600">{r.certNumber || "—"}</p>
                  <p className="text-[10px] text-ink-400">{r.lab}</p>
                </td>
                <td className="px-4 py-3 text-right text-ink-600">{currency(r.pricePerCarat)}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink-950">{currency(r.price)}</td>
                <td className="px-4 py-3"><Badge label={humanize(r.status)} tone={statusTone(r.status)} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function VisualGrid({ rows, loading, onOpen }: { rows: Diamond[]; loading: boolean; onOpen: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {loading ? (
        <div className="col-span-full flex h-40 items-center justify-center"><Spinner /></div>
      ) : rows.length === 0 ? (
        <p className="col-span-full py-16 text-center text-xs text-ink-400">No diamonds match your filters.</p>
      ) : (
        rows.map((r) => (
          <button key={r.id} type="button" onClick={() => onOpen(r.id)} className="group overflow-hidden rounded-2xl bg-white text-left ring-1 ring-ink-100 transition-shadow hover:shadow-md">
            <div className="relative flex aspect-[5/4] items-center justify-center bg-gradient-to-b from-ink-50 to-ivory">
              <StoneVisual diamond={r} className="h-full w-full" />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <Badge label={humanize(r.status)} tone={statusTone(r.status)} />
                {r.lab && <Badge label={r.lab} tone="gray" />}
              </div>
              <div className="absolute bottom-3 right-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-xs font-semibold text-gold-100">{Number(r.carat).toFixed(2)} ct</div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-ink-950">{r.name}</p>
                  <p className="font-mono text-xs text-ink-400">{r.sku} · {r.certNumber}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.color && <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-800">{r.color}</span>}
                {r.colourIntensity && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">{r.colourIntensity}</span>}
                {r.colourModifier && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">{r.colourModifier}</span>}
                {r.clarity && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">{r.clarity}</span>}
                {r.shape && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-600">{r.shape}</span>}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-ink-500">{currency(r.pricePerCarat)} / ct</p>
                  <p className="font-display text-lg font-semibold text-ink-950">{currency(r.price)}</p>
                </div>
                <span className="rounded-full bg-ink-950 p-2 text-gold-100 opacity-0 transition-opacity group-hover:opacity-100">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </span>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
