import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';
import { flattenNav, type NavItem, type NavGroup } from '../nav';

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
  const inputRef = useRef<HTMLInputElement>(null);

  const all = useMemo(() => flattenNav(nav), [nav]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    const terms = q.split(/\s+/);
    return all.filter((item) => {
      const hay = `${item.label} ${item.group} ${item.keywords}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [query, all]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setSel(0);
  }, [query]);

  if (!open) return null;

  const go = (item: NavItem) => {
    navigate(item.path);
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && results[sel]) {
      go(results[sel]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="cmd-backdrop" onMouseDown={onClose}>
      <div className="cmd-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <Search size={18} style={{ color: 'var(--text-faint)' }} />
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search pages, modules, reports…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
          />
          <CornerDownLeft size={15} style={{ color: 'var(--text-faint)' }} />
        </div>
        <div className="cmd-list">
          {results.length === 0 && (
            <div className="cmd-empty">
              No pages found for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((item, i) => (
            <div
              key={item.path}
              className={`cmd-item ${i === sel ? 'selected' : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(item)}
            >
              <item.icon size={16} />
              <span className="ci-label">{item.label}</span>
              <span className="ci-group">{item.group}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
