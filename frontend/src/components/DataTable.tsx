import { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';
import type { Field, Row } from '../api';
import { Badge, formatCell } from './ui';
import { useApp } from '../AppContext';

export type Column = Field;

export interface SortState {
  key: string;
  order: 'asc' | 'desc';
}

export default function DataTable({
  columns,
  rows,
  onEdit,
  onDelete,
  rowKey,
}: {
  columns: Column[];
  rows: Row[];
  onEdit?: (row: Row) => void;
  onDelete?: (row: Row) => void;
  rowKey?: string;
}) {
  const [sort, setSort] = useState<SortState | null>(null);
  const { canViewCosts } = useApp();

  const isMoney = (c: Column) => /price|cost|amount|value/i.test(c.key);
  const isStatus = (c: Column) => c.type === 'select' || c.key === 'status';

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const { key, order } = sort;
    const dir = order === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
    });
  }, [rows, sort]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, order: 'asc' };
      if (prev.order === 'asc') return { key, order: 'desc' };
      return null;
    });
  };

  const renderCell = (c: Column, value: unknown) => {
    if (isMoney(c) && !canViewCosts) return '•••';
    const raw = Array.isArray(value) ? value.join(', ') : value;
    const str = String(raw ?? '');
    if (str.length > 46) {
      return (
        <span title={str} style={{ cursor: 'help' }}>
          {str.slice(0, 46)}…
        </span>
      );
    }
    if (c.type === 'multiselect') {
      const arr = Array.isArray(value)
        ? (value as string[])
        : String(raw || '').split(',').map((s) => s.trim()).filter(Boolean);
      return arr.length ? (
        <span title={str}>
          {arr.slice(0, 4).join(', ')}
          {arr.length > 4 ? ` +${arr.length - 4}` : ''}
        </span>
      ) : (
        '—'
      );
    }
    return isStatus(c) ? <Badge value={value} /> : formatCell(value, c.type === 'number' ? (isMoney(c) ? 'currency' : 'number') : c.type);
  };

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`${isMoney(c) ? 'num' : ''} sortable`}
                onClick={() => toggleSort(c.key)}
                title={`Sort by ${c.label}`}
              >
                {c.label}
                {sort?.key === c.key &&
                  (sort.order === 'asc' ? (
                    <ArrowUp size={12} style={{ verticalAlign: '-1px', marginLeft: 4 }} />
                  ) : (
                    <ArrowDown size={12} style={{ verticalAlign: '-1px', marginLeft: 4 }} />
                  ))}
              </th>
            ))}
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={String(row[rowKey || 'id'] ?? row.id)}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`${isMoney(c) ? 'num' : ''} ${
                    c.key === 'id' || /no|ref|sku|stock/i.test(c.key) ? 'mono' : ''
                  }`}
                >
                  {renderCell(c, row[c.key])}
                </td>
              ))}
              <td>
                <div className="row-actions">
                  {onEdit && (
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => onEdit(row)}
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="icon-btn"
                      title="Delete"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 size={14} style={{ color: 'var(--red)' }} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className="empty-state">
          <div className="big">◇</div>
          No records found. Try adjusting your search or create a new record.
        </div>
      )}
    </div>
  );
}
