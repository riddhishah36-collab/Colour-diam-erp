import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Toast {
  id: number;
  msg: string;
  kind: 'ok' | 'err';
}

let seq = 1;
type Listener = (t: Toast) => void;
let listeners: Listener[] = [];

function emit(kind: Toast['kind'], msg: string) {
  const t = { id: seq++, msg, kind };
  listeners.forEach((l) => l(t));
}

export const toast = {
  ok: (msg: string) => emit('ok', msg),
  err: (msg: string) => emit('err', msg),
};

export function Toasts() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const add = (t: Toast) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, 3200);
    };
    listeners.push(add);
    return () => {
      listeners = listeners.filter((l) => l !== add);
    };
  }, []);

  return (
    <div className="toast-wrap">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{t.msg}</span>
          <button
            className="icon-btn"
            style={{ width: 20, height: 20, border: 'none', background: 'transparent', color: '#fff' }}
            onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        style={{ width: wide ? 860 : 640 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function money(n: unknown): string {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return '—';
  return '$' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function num(n: unknown): string {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return '—';
  return v.toLocaleString();
}

export function shortDate(s: unknown): string {
  if (!s) return '—';
  return String(s).slice(0, 10);
}

const STATUS_COLORS: Record<string, string> = {
  Available: 'green', Active: 'green', Connected: 'green', Done: 'green', Settled: 'green',
  Current: 'green', Inspected: 'blue', Received: 'blue', 'In Progress': 'blue', Pending: 'blue',
  'On Memo': 'amber', Reserved: 'amber', Outstanding: 'amber', Partial: 'amber', Review: 'amber',
  Sold: 'purple', Converted: 'purple', Exchanged: 'purple', Repaired: 'purple', Restocked: 'purple',
  Returned: 'gray', Archived: 'gray', 'Not Connected': 'gray', Closed: 'gray', Draft: 'gray', Paused: 'gray',
  Unread: 'red', Overdue: 'red', Error: 'red', Damaged: 'red', Refunded: 'red', Urgent: 'red', High: 'red',
  Low: 'gray', Medium: 'blue', Read: 'gray', Replied: 'green', 'To Do': 'gray', 'Setup Required': 'amber',
  Discontinued: 'gray', Transfer: 'blue', Adjustment: 'gray', 'Stock In': 'green', 'Stock Out': 'red',
  'Return In': 'teal', Intense: 'purple',
};

export function statusColor(status: unknown): string {
  return STATUS_COLORS[String(status ?? '')] || 'gray';
}

export function Badge({ value }: { value: unknown }) {
  const s = String(value ?? '—');
  return <span className={`badge ${statusColor(s)}`}>{s || '—'}</span>;
}

export function formatCell(value: unknown, type?: string): React.ReactNode {
  if (value === undefined || value === null || value === '') return '—';
  if (type === 'number') return <span className="num">{num(value)}</span>;
  if (type === 'currency') return money(value);
  if (type === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
