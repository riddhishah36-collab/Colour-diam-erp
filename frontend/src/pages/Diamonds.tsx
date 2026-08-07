import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Download,
  Search,
  RefreshCw,
  Table2,
  LayoutGrid,
} from 'lucide-react';
import { api, type Field, type ModuleMeta, type Row } from '../api';
import { useApp } from '../AppContext';
import DataTable from '../components/DataTable';
import ModuleForm from '../components/ModuleForm';
import { Modal, toast, money } from '../components/ui';

type View = 'table' | 'visual';

function csvDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function colorFor(d: Record<string, unknown>): { base: string; glow: string; fancy: boolean } {
  const intensity = String(d.intensity || 'None');
  const modifier = String(d.modifier || '').toLowerCase();
  if (intensity !== 'None' && modifier) {
    const map: Record<string, [string, string]> = {
      pink: ['#f7b0c8', '#e06a9a'],
      blue: ['#9cc4f5', '#3f7fd6'],
      yellow: ['#f7d77a', '#e3a62d'],
      green: ['#b7e0a8', '#58b368'],
      purple: ['#d0b2f0', '#8f5bd6'],
      orange: ['#f7c08a', '#e0813d'],
      red: ['#f39a8f', '#d1453b'],
      grey: ['#c9ccd4', '#8a93a0'],
      brown: ['#d8bfa0', '#a97c50'],
    };
    const hit = Object.entries(map).find(([k]) => modifier.includes(k));
    if (hit) return { base: hit[1][0], glow: hit[1][1], fancy: true };
  }
  if (intensity !== 'None') return { base: '#f2e6c8', glow: '#d9b96a', fancy: true };
  const grades = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const idx = Math.max(0, grades.indexOf(String(d.color)));
  const stops = ['#ffffff', '#fdfcf9', '#fbf8f1', '#f9f3e8', '#f6efdc', '#f2e8cf', '#eddfc0', '#e8d5b0', '#e2cb9f'];
  return { base: stops[idx], glow: '#e8e2d4', fancy: false };
}

function shapePath(shape: string, s: number, cx: number, cy: number): string {
  const r = s / 2;
  switch (shape) {
    case 'Pear':
      return `M${cx} ${cy - r} C ${cx + r * 0.9} ${cy - r * 0.4}, ${cx + r * 0.7} ${cy + r * 0.7}, ${cx + r * 0.25} ${cy + r} L ${cx - r * 0.25} ${cy + r} C ${cx - r * 0.7} ${cy + r * 0.7}, ${cx - r * 0.9} ${cy - r * 0.4}, ${cx} ${cy - r} Z`;
    case 'Emerald':
      return `M${cx - r * 0.7} ${cy - r} L ${cx + r * 0.7} ${cy - r} L ${cx + r} ${cy - r * 0.4} L ${cx + r * 0.7} ${cy + r} L ${cx - r * 0.7} ${cy + r} L ${cx - r} ${cy - r * 0.4} Z`;
    case 'Princess':
      return `M${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
    case 'Marquise':
      return `M${cx} ${cy - r} Q ${cx + r} ${cy}, ${cx} ${cy + r} Q ${cx - r} ${cy}, ${cx} ${cy - r} Z`;
    case 'Heart':
      return `M${cx} ${cy + r * 0.4} C ${cx - r} ${cy}, ${cx - r} ${cy - r * 0.6}, ${cx - r * 0.35} ${cy - r * 0.6} C ${cx} ${cy - r * 0.6}, ${cx} ${cy - r * 0.2}, ${cx} ${cy - r * 0.2} C ${cx} ${cy - r * 0.2}, ${cx} ${cy - r * 0.6}, ${cx + r * 0.35} ${cy - r * 0.6} C ${cx + r} ${cy - r * 0.6}, ${cx + r} ${cy}, ${cx} ${cy + r * 0.4} Z`;
    case 'Radiant':
      return `M${cx - r * 0.8} ${cy - r} L ${cx + r * 0.8} ${cy - r} L ${cx + r} ${cy - r * 0.3} L ${cx + r * 0.6} ${cy + r} L ${cx - r * 0.6} ${cy + r} L ${cx - r} ${cy - r * 0.3} Z`;
    case 'Asscher':
      return `M${cx - r * 0.75} ${cy - r} L ${cx + r * 0.75} ${cy - r} L ${cx + r} ${cy - r * 0.5} L ${cx + r * 0.75} ${cy} L ${cx + r} ${cy + r * 0.5} L ${cx + r * 0.75} ${cy + r} L ${cx - r * 0.75} ${cy + r} L ${cx - r} ${cy + r * 0.5} L ${cx - r * 0.75} ${cy} L ${cx - r} ${cy - r * 0.5} Z`;
    case 'Cushion':
      return `M${cx - r * 0.6} ${cy - r} Q ${cx} ${cy - r * 1.15}, ${cx + r * 0.6} ${cy - r} Q ${cx + r * 1.15} ${cy}, ${cx + r * 0.6} ${cy + r} Q ${cx} ${cy + r * 1.15}, ${cx - r * 0.6} ${cy + r} Q ${cx - r * 1.15} ${cy}, ${cx - r * 0.6} ${cy - r} Z`;
    case 'Oval':
      return `M${cx} ${cy - r} C ${cx + r * 0.8} ${cy - r * 0.9}, ${cx + r * 0.8} ${cy + r * 0.9}, ${cx} ${cy + r} C ${cx - r * 0.8} ${cy + r * 0.9}, ${cx - r * 0.8} ${cy - r * 0.9}, ${cx} ${cy - r} Z`;
    default:
      return `M${cx} ${cy - r} L ${cx + r * 0.7} ${cy - r * 0.7} L ${cx + r} ${cy} L ${cx + r * 0.7} ${cy + r * 0.7} L ${cx} ${cy + r} L ${cx - r * 0.7} ${cy + r * 0.7} L ${cx - r} ${cy} L ${cx - r * 0.7} ${cy - r * 0.7} Z`;
  }
}

function StoneArt({ row, size = 110 }: { row: Row; size?: number }) {
  const { base, glow } = colorFor(row);
  const carat = Number(row.carat) || 1;
  const s = Math.max(52, Math.min(96, 52 + carat * 16));
  const cx = size / 2;
  const cy = size / 2;
  const gid = `grad-${row.id}`;

  return (
    <svg className="stone-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id={gid} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={base} />
          <stop offset="100%" stopColor={glow} />
        </radialGradient>
      </defs>
      <path
        d={shapePath(String(row.shape || 'Round'), s, cx, cy)}
        fill={`url(#${gid})`}
        stroke="#ffffff"
        strokeWidth={2.5}
      />
      <line x1={cx - s * 0.4} y1={cy - s * 0.4} x2={cx + s * 0.4} y2={cy + s * 0.4} stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
      <line x1={cx + s * 0.4} y1={cy - s * 0.4} x2={cx - s * 0.4} y2={cy + s * 0.4} stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
      <line x1={cx} y1={cy - s * 0.55} x2={cx} y2={cy + s * 0.55} stroke="rgba(255,255,255,0.45)" strokeWidth={1} />
      <line x1={cx - s * 0.55} y1={cy} x2={cx + s * 0.55} y2={cy} stroke="rgba(255,255,255,0.45)" strokeWidth={1} />
      <circle cx={cx - s * 0.18} cy={cy - s * 0.22} r={s * 0.05} fill="rgba(255,255,255,0.9)" />
      <circle cx={cx + s * 0.22} cy={cy + s * 0.2} r={s * 0.03} fill="rgba(255,255,255,0.7)" />
      <text
        x={cx}
        y={cy + s * 0.02}
        textAnchor="middle"
        fontSize={s * 0.3}
        fontWeight={700}
        fill="rgba(29,34,40,0.55)"
      >
        {Number(row.carat).toFixed(2)}
      </text>
    </svg>
  );
}

export default function Diamonds() {
  const navigate = useNavigate();
  const { modules, refreshMeta } = useApp();
  const mod: ModuleMeta | undefined = modules.diamonds;

  const [view, setView] = useState<View>('table');
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list('diamonds', q ? { q } : {});
      setRows(res.rows);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load diamonds');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (modules && !modules.diamonds) navigate('/');
  }, [modules, navigate]);

  if (!mod) {
    return <div className="empty-state">Loading…</div>;
  }

  const cols: Field[] = mod.fields.filter((f) => f.type !== 'textarea' && !f.readonly).slice(0, 13);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      if (editing) {
        await api.update('diamonds', editing.id, values);
        toast.ok('Diamond updated');
      } else {
        await api.create('diamonds', values);
        toast.ok('Diamond created');
      }
      setEditing(null);
      setCreating(false);
      await load();
      await refreshMeta();
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await api.remove('diamonds', deleting.id);
      toast.ok('Diamond deleted');
      setDeleting(null);
      await load();
      await refreshMeta();
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Diamonds</h1>
          <p>Graded fancy &amp; white diamond stock — certificate, lab, intensity, measurements, depth and table.</p>
        </div>
        <div className="page-actions">
          <div className="search-input">
            <Search size={15} style={{ color: 'var(--text-faint)' }} />
            <input
              placeholder="Search stock, certificate, shape…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>
              <Table2 size={15} /> Table
            </button>
            <button className={view === 'visual' ? 'on' : ''} onClick={() => setView('visual')}>
              <LayoutGrid size={15} /> Visual
            </button>
          </div>
          <button className="btn" onClick={() => void load()}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <a
            className="btn"
            href={api.csvUrl('diamonds', q)}
            onClick={(e) => {
              e.preventDefault();
              csvDownload(api.csvUrl('diamonds', q), 'diamonds-export.csv');
            }}
          >
            <Download size={15} />
            Export CSV
          </a>
          <button className="btn primary" onClick={() => setCreating(true)}>
            <Plus size={16} />
            New Stone
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading diamonds…</div>
      ) : view === 'table' ? (
        <div className="card">
          <DataTable columns={cols} rows={rows} onEdit={setEditing} onDelete={setDeleting} />
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: 12 }}>
            {rows.length} of {mod.count} diamonds shown
          </div>
        </div>
      ) : (
        <div className="stone-grid">
          {rows.map((d) => (
            <div
              key={d.id}
              className="stone-card"
              onClick={() => setEditing(d)}
            >
              <StoneArt row={d} />
              <div className="stone-labels">
                <div className="stock">{String(d.stockNo)}</div>
                <div className="spec">
                  {String(d.shape)} · {Number(d.carat).toFixed(2)}ct
                </div>
                <div className="spec">
                  {d.intensity && String(d.intensity) !== 'None' && String(d.modifier)
                    ? `${d.intensity} ${d.modifier}`
                    : `Colour ${d.color}`}{' '}
                  · {String(d.clarity)}
                </div>
                <div className="price">{money(d.price)}</div>
              </div>
              <div className="stone-notes">
                {String(d.lab || '')} {d.certificate ? `· ${d.certificate}` : ''}
              </div>
              <span className={`badge ${d.status === 'Available' ? 'green' : d.status === 'On Memo' ? 'amber' : d.status === 'Sold' ? 'purple' : 'gray'}`}>
                {String(d.status)}
              </span>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <Modal
          title={`${editing ? 'Edit' : 'New'} diamond record`}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          wide
        >
          <ModuleForm
            fields={mod.fields}
            initial={editing || undefined}
            onSubmit={handleSave}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
            submitLabel={editing ? 'Save Changes' : 'Create'}
          />
        </Modal>
      )}

      {deleting && (
        <Modal
          title="Delete diamond"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn" onClick={() => setDeleting(null)}>
                Cancel
              </button>
              <button className="btn danger" onClick={() => void handleDelete()}>
                Delete
              </button>
            </>
          }
        >
          <p>
            Delete {String(deleting.stockNo)} ({String(deleting.certificate)})? This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
}
