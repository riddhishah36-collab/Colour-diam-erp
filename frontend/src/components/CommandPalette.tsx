import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, FileText, User, Gem } from 'lucide-react';
import { flattenNav, type NavGroup } from '../nav';
import { api, type Row } from '../api';

interface RecordModule {
  mod: string;
  icon: React.ElementType;
  path: string;
  label: (r: Row) => string;
  sub: (r: Row) => string;
}

const RECORD_MODULES: RecordModule[] = [
  {
    mod: 'diamonds', icon: Gem, path: '/diamonds?focus=',
    label: (r) => String(r.stockNo || ''),
    sub: (r) => `${r.shape || ''} · ${r.carat ?? ''}ct · ${r.status || ''}`,
  },
  {
    mod: 'customers', icon: User, path: '/customers?id=',
    label: (r) => String(r.name || ''),
    sub: (r) => [r.company, r.city, r.status].filter(Boolean).join(' · '),
  },
  {
    mod: 'leads', icon: User, path: '/leads?id=',
    label: (r) => String(r.name || ''),
    sub: (r) => [r.company, r.stage, r.value ? `$${r.value}` : ''].filter(Boolean).join(' · '),
  },
  {
    mod: 'invoices', icon: FileText, path: '/sales?tab=invoices&id=',
    label: (r) => String(r.invoiceNo || ''),
    sub: (r) => `${r.customer || ''} · ${r.status || ''}`,
  },
  {
    mod: 'quotations', icon: FileText, path: '/sales?tab=quotations&id=',
    label: (r) => String(r.quoteNo || ''),
    sub: (r) => `${r.customer || ''} · ${r.status || ''}`,
  },
  {
    mod: 'payments', icon: FileText, path: '/sales?tab=payments&id=',
    label: (r) => String(r.paymentNo || ''),
    sub: (r) => `${r.customer || ''} · ${r.method || ''} · ${r.status || ''}`,
  },
  {
    mod: 'memos', icon: FileText, path: '/m/memos?focus=',
    label: (r) => String(r.memoNo || ''),
    sub: (r) => `${r.customer || ''} · ${r.status || ''}`,
  },
  {
    mod: 'products', icon: Gem, path: '/m/products?focus=',
    label: (r) => String(r.name || r.sku || ''),
    sub: (r) => `${r.sku || ''} · ${r.category || ''}`,
  },
];

interface Entry {
  group: string;
  key: string;
  label: string;
  sub?: string;
  icon: React.ElementType;
  path: string;
}

export function CommandPalette({
  open,
  onClose,
  nav,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavGroup[];
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const [records, setRecords] = useState<Record<string, Row[]>>({});
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = useMemo(() => flattenNav(nav), [nav]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSel(0);
      setRecords({});
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Debounced record search across modules.
  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 2) {
      setRecords({});
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      Promise.all(
        RECORD_MODULES.map((rm) =>
          api
            .list(rm.mod, { q, limit: '6' })
            .then((res) => ({ mod: rm.mod, rows: res.rows }))
            .catch(() => ({ mod: rm.mod, rows: [] })),
        ),
      )
        .then((all) => {
          const map: Record<string, Row[]> = {};
          for (const a of all) map[a.mod] = a.rows;
          setRecords(map);
        })
        .finally(() => setSearching(false));
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  useEffect(() => {
    setSel(0);
  }, [query]);

  const entries: Entry[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: Entry[] = [];

    const matchedPages = q
      ? pages.filter((item) => {
          const hay = `${item.label} ${item.group} ${item.keywords}`.toLowerCase();
          return q.split(/\s+/).every((t) => hay.includes(t));
        })
      : pages;
    if (matchedPages.length) {
      list.push(
        ...matchedPages.map((item) => ({
          group: 'Pages',
          key: `p-${item.path}`,
          label: item.label,
          sub: item.group,
          icon: item.icon,
          path: item.path,
        })),
      );
    }

    if (q.length >= 2) {
      for (const rm of RECORD_MODULES) {
        const rows = records[rm.mod] || [];
        if (!rows.length) continue;
        list.push(
          ...rows.map((r) => ({
            group: rm.mod,
            key: `${rm.mod}-${r.id}`,
            label: rm.label(r),
            sub: rm.sub(r),
            icon: rm.icon,
            path: `${rm.path}${r.id}`,
          })),
        );
      }
    }

    return list;
  }, [query, pages, records]);

  if (!open) return null;

  const go = (item: Entry) => {
    navigate(item.path);
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, Math.max(entries.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && entries[sel]) {
      go(entries[sel]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const groupOrder = ['Pages', 'diamonds', 'customers', 'leads', 'invoices', 'quotations', 'payments', 'memos', 'products'];
  const groups = [...new Set(entries.map((e) => e.group))].sort(
    (a, b) => (groupOrder.indexOf(a) === -1 ? 99 : groupOrder.indexOf(a)) - (groupOrder.indexOf(b) === -1 ? 99 : groupOrder.indexOf(b)),
  );
  const groupTitles: Record<string, string> = {
    Pages: 'Pages',
    diamonds: 'Diamonds',
    customers: 'Customers',
    leads: 'Leads',
    invoices: 'Invoices',
    quotations: 'Quotations',
    payments: 'Payments',
    memos: 'Memos',
    products: 'Products',
  };

  return (
    <div className="cmd-backdrop" onMouseDown={onClose}>
      <div className="cmd-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <Search size={18} style={{ color: 'var(--text-faint)' }} />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search pages, diamonds, customers, leads, invoices…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
          />
          {searching ? (
            <span className="cmd-loading">…</span>
          ) : (
            <CornerDownLeft size={15} style={{ color: 'var(--text-faint)' }} />
          )}
        </div>
        <div className="cmd-list">
          {entries.length === 0 && (
            <div className="cmd-empty">
              {query.trim().length >= 2 ? (
                <>
                  No pages or records found for &ldquo;{query}&rdquo;
                </>
              ) : (
                <>Type at least 2 characters to search records across modules.</>
              )}
            </div>
          )}
          {groups.map((g) => (
            <div key={g}>
              <div className="cmd-group-label">{groupTitles[g] || g}</div>
              {entries
                .map((e, i) => ({ e, i }))
                .filter(({ e }) => e.group === g)
                .map(({ e, i }) => (
                  <div
                    key={e.key}
                    className={`cmd-item ${i === sel ? 'selected' : ''}`}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => go(e)}
                  >
                    <e.icon size={16} />
                    <span className="ci-label">{e.label}</span>
                    {e.sub && <span className="ci-sub">{e.sub}</span>}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
