import React, { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, buildQuery } from "../api";
import type { ListResult } from "../api";
import type { Activity } from "../types";
import { Badge, Button, Card, SearchInput, Select, Spinner, statusTone, humanize, cn } from "../components/ui";
import type { AppContext } from "../components/Layout";

const TYPE_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  order: "Order",
  payment: "Payment",
  invoice: "Invoice",
  inventory: "Inventory",
  quote: "Quote",
  lead: "Lead",
  customer: "Customer",
  purchase: "Purchase",
  auth: "Auth",
  settings: "Settings"
};

export default function ActivityLog() {
  const { show } = useOutletContext<AppContext>();
  const [rows, setRows] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize, q: search };
      if (type) params.type = type;
      const res = await api.get<ListResult<Activity>>(`/api/activities${buildQuery(params)}`);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      show(e instanceof Error ? e.message : "Failed to load", "err");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, type, show]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-700">Audit trail</p>
          <p className="text-xs text-ink-500">{total} events · every create, update and delete is recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search the log…" className="w-64" />
          <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-44">
            <option value="">All types</option>
            {Object.keys(TYPE_LABELS).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-xs text-ink-400">No activity found.</p>
        ) : (
          <div className="scrollbar-thin max-h-[calc(100vh-260px)] overflow-y-auto">
            {rows.map((a) => (
              <div key={a.id} className="flex items-start gap-3 border-b border-ink-50 px-5 py-3.5 last:border-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-950 text-[10px] font-semibold uppercase text-gold-200">
                  {(a.userName || "S").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-800">{a.message}</p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {a.userName} · {new Date(a.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Badge label={TYPE_LABELS[a.type] || humanize(a.type)} tone={statusTone(a.type)} />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
          <p className="text-xs text-ink-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
