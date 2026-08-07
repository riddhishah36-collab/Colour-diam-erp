import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, buildQuery } from "../api";
import { GROUP_LABELS, GROUP_ROUTES } from "../nav";
import { Badge, statusTone, cn } from "./ui";

interface Hit {
  group: string;
  id: string;
  label: string;
  sub: string;
  status: string;
}

const ORDER: Record<string, number> = {
  diamonds: 0,
  jewellery: 1,
  gemstones: 2,
  products: 3,
  customers: 4,
  leads: 5,
  suppliers: 6,
  orders: 7,
  quotes: 8,
  invoices: 9,
  payments: 10,
  memos: 11,
  returns: 12,
  expenses: 13,
  tasks: 14,
  messages: 15,
  documents: 16,
  purchaseOrders: 17
};

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const map = new Map<string, Hit[]>();
    hits.forEach((h) => {
      const list = map.get(h.group) || [];
      list.push(h);
      map.set(h.group, list);
    });
    return Array.from(map.entries()).sort((a, b) => (ORDER[a[0]] ?? 99) - (ORDER[b[0]] ?? 99));
  }, [hits]);

  const flatIndex = useMemo(() => {
    const idx: Array<{ group: string; hit: Hit }> = [];
    grouped.forEach(([g, list]) => list.forEach((h) => idx.push({ group: g, hit: h })));
    return idx;
  }, [grouped]);

  const run = useCallback(async (query: string) => {
    if (!query.trim()) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<{ data: Hit[] }>(`/api/global-search${buildQuery({ q: query })}`);
      setHits(res.data);
      setActive(0);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setHits([]);
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => run(q), 180);
    return () => clearTimeout(t);
  }, [q, run, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, flatIndex.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const cur = flatIndex[active];
        if (cur) openHit(cur.group, cur.hit);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flatIndex, active]);

  const openHit = (group: string, hit: Hit) => {
    onClose();
    const base = GROUP_ROUTES[group];
    if (!base) return;
    navigate(`${base}/${hit.id}`);
  };

  useEffect(() => {
    if (!open) return;
    const el = document.querySelector<HTMLElement>(`[data-palette-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-ink-200">
        <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3.5">
          <svg className="h-5 w-5 shrink-0 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stock, cert, clients, invoices, documents…"
            className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
          <kbd className="rounded border border-ink-200 px-1.5 py-0.5 text-[10px] text-ink-400">ESC</kbd>
        </div>
        <div className="scrollbar-thin max-h-[50vh] overflow-y-auto py-2">
          {loading ? (
            <p className="px-4 py-8 text-center text-xs text-ink-400">Searching…</p>
          ) : !q.trim() ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-ink-600">Search everything</p>
              <p className="mt-1 text-xs text-ink-400">Press Enter to jump to any record. Try “GIA”, “pink”, “INV-” or “Argyle”.</p>
            </div>
          ) : grouped.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-ink-400">No results found for “{q}”</p>
          ) : (
            grouped.map(([group, list]) => (
              <div key={group}>
                <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-400">
                  {GROUP_LABELS[group] || group} <span className="normal-case tracking-normal text-ink-300">· {list.length}</span>
                </p>
                {list.map((h) => {
                  const idx = flatIndex.findIndex((f) => f.hit === h && f.group === group);
                  return (
                    <button
                      key={`${group}-${h.id}`}
                      type="button"
                      data-palette-index={idx}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => openHit(group, h)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left",
                        idx === active ? "bg-gold-100/60" : "hover:bg-ink-50"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{h.label}</span>
                        {h.sub && <span className="block truncate text-xs text-ink-500">{h.sub}</span>}
                      </span>
                      {h.status && <Badge label={h.status} tone={statusTone(h.status)} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center gap-3 border-t border-ink-100 bg-ink-50/60 px-4 py-2 text-[10px] text-ink-400">
          <span><kbd className="rounded border border-ink-200 bg-white px-1">↑↓</kbd> navigate</span>
          <span><kbd className="rounded border border-ink-200 bg-white px-1">↵</kbd> open</span>
          <span className="ml-auto">Colour Diam · Enterprise Suite</span>
        </div>
      </div>
    </div>
  );
}
