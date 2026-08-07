import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Download,
  Search,
  RefreshCw,
  Table2,
  LayoutGrid,
  SlidersHorizontal,
  Save,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import { api, type Field, type ModuleMeta, type Row } from '../api';
import { useApp } from '../AppContext';
import DataTable from '../components/DataTable';
import ModuleForm from '../components/ModuleForm';
import Drawer from '../components/Drawer';
import { Modal, toast, money, Badge } from '../components/ui';

type View = 'table' | 'visual';

interface FilterState {
  shapes: string[];
  labs: string[];
  colors: string[];
  clarities: string[];
  intensities: string[];
  statuses: string[];
  caratMin: string;
  caratMax: string;
  priceMin: string;
  priceMax: string;
}

interface SavedFilter {
  id: string;
  name: string;
  f: FilterState;
}

const EMPTY_FILTER: FilterState = {
  shapes: [], labs: [], colors: [], clarities: [], intensities: [], statuses: [],
  caratMin: '', caratMax: '', priceMin: '', priceMax: '',
};

const SAVED_KEY = 'cds.diamond.savedFilters';
const SHAPES = ['Round', 'Pear', 'Oval', 'Emerald', 'Princess', 'Marquise', 'Asscher', 'Cushion', 'Radiant', 'Heart'];
const LABS = ['GIA', 'IGI', 'HRD', 'SGL', 'AGS', 'None'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const CLARITIES = ['IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];
const INTENSITIES = ['None', 'Fancy Light', 'Fancy', 'Fancy Intense', 'Fancy Deep', 'Fancy Vivid', 'Fancy Dark'];
const STATUSES = ['Available', 'On Memo', 'Reserved', 'Sold', 'Returned'];

function loadSaved(): SavedFilter[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as SavedFilter[]) : [];
  } catch {
    return [];
  }
}

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

export function StoneArt({ row, size = 110 }: { row: Row; size?: number }) {
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { modules, refreshMeta, canEditModule, maskMoney: mask } = useApp();
  const mod: ModuleMeta | undefined = modules.diamonds;
  const canEdit = canEditModule('diamonds');

  const [view, setView] = useState<View>('table');
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [saved, setSaved] = useState<SavedFilter[]>(loadSaved);
  const [saveName, setSaveName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list('diamonds', { limit: '500' });
      setRows(res.rows);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load diamonds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Handle /diamonds?new=1 and /diamonds?focus=<id>
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setCreating(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
    const focus = searchParams.get('focus');
    if (focus) {
      const row = rows.find((r) => r.id === focus);
      if (row) setDetail(row);
      searchParams.delete('focus');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, rows]);

  useEffect(() => {
    if (modules && !modules.diamonds) navigate('/');
  }, [modules, navigate]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((d) => {
      if (term) {
        const hay = Object.values(d).join(' ').toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (filters.shapes.length && !filters.shapes.includes(String(d.shape))) return false;
      if (filters.labs.length && !filters.labs.includes(String(d.lab))) return false;
      if (filters.colors.length && !filters.colors.includes(String(d.color))) return false;
      if (filters.clarities.length && !filters.clarities.includes(String(d.clarity))) return false;
      if (filters.intensities.length && !filters.intensities.includes(String(d.intensity))) return false;
      if (filters.statuses.length && !filters.statuses.includes(String(d.status))) return false;
      const carat = Number(d.carat);
      if (filters.caratMin && carat < Number(filters.caratMin)) return false;
      if (filters.caratMax && carat > Number(filters.caratMax)) return false;
      const price = Number(d.price);
      if (filters.priceMin && price < Number(filters.priceMin)) return false;
      if (filters.priceMax && price > Number(filters.priceMax)) return false;
      return true;
    });
  }, [rows, q, filters]);

  if (!mod) {
    return <div className="empty-state">Loading…</div>;
  }

  const cols: Field[] = mod.fields.filter((f) => f.type !== 'textarea' && !f.readonly).slice(0, 12);

  const toggle = (key: keyof FilterState, val: string) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
      return { ...prev, [key]: next };
    });
  };

  const saveFilter = () => {
    if (!saveName.trim()) return;
    const item: SavedFilter = { id: `${Date.now()}`, name: saveName.trim(), f: filters };
    const next = [...saved, item];
    setSaved(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setSaveName('');
    setSavingName(false);
    toast.ok(`Filter "${item.name}" saved`);
  };

  const deleteSaved = (id: string) => {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const activeFilterCount =
    filters.shapes.length + filters.labs.length + filters.colors.length +
    filters.clarities.length + filters.intensities.length + filters.statuses.length +
    (filters.caratMin ? 1 : 0) + (filters.caratMax ? 1 : 0) +
    (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0);

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
      setDetail(null);
      await load();
      await refreshMeta();
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const openDetail = (d: Row) => setDetail(d);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Diamonds</h1>
          <p>Graded fancy &amp; white diamond stock — filter, compare, and inspect full 4C detail.</p>
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
          <button className={`btn ${filterOpen || activeFilterCount ? 'primary' : ''}`} onClick={() => setFilterOpen((o) => !o)}>
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && <span className="chip-count">{activeFilterCount}</span>}
          </button>
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
          {canEdit && (
            <button className="btn primary" onClick={() => setCreating(true)}>
              <Plus size={16} />
              New Stone
            </button>
          )}
        </div>
      </div>

      {saved.length > 0 && (
        <div className="saved-filter-row">
          {saved.map((s) => (
            <span
              key={s.id}
              className={`saved-filter-chip ${JSON.stringify(s.f) === JSON.stringify(filters) ? 'on' : ''}`}
              onClick={() => setFilters(s.f)}
              title={`Apply "${s.name}"`}
            >
              {s.name}
              <button
                className="chip-x"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSaved(s.id);
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button className="btn small ghost" onClick={() => setFilters(EMPTY_FILTER)}>
            Clear
          </button>
        </div>
      )}

      {filterOpen && (
        <div className="filter-bar card">
          <div className="filter-grid">
            {([
              ['shapes', 'Shape', SHAPES],
              ['labs', 'Lab', LABS],
              ['colors', 'Colour', COLORS],
              ['clarities', 'Clarity', CLARITIES],
              ['intensities', 'Intensity', INTENSITIES],
              ['statuses', 'Status', STATUSES],
            ] as [keyof FilterState, string, string[]][]).map(([key, label, options]) => (
              <div className="filter-group" key={key}>
                <div className="filter-label">{label}</div>
                <div className="chip-group">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      className={`chip ${(filters[key] as string[]).includes(opt) ? 'on' : ''}`}
                      onClick={() => toggle(key, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="filter-group">
              <div className="filter-label">Carat range</div>
              <div className="range-inputs">
                <input type="number" placeholder="Min" value={filters.caratMin} onChange={(e) => setFilters({ ...filters, caratMin: e.target.value })} />
                <span>–</span>
                <input type="number" placeholder="Max" value={filters.caratMax} onChange={(e) => setFilters({ ...filters, caratMax: e.target.value })} />
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-label">Price range (USD)</div>
              <div className="range-inputs">
                <input type="number" placeholder="Min" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })} />
                <span>–</span>
                <input type="number" placeholder="Max" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="filter-actions">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {savingName ? (
                <div className="inline-save">
                  <input autoFocus placeholder="Filter name…" value={saveName} onChange={(e) => setSaveName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveFilter()} />
                  <button className="btn small primary" onClick={saveFilter}><Save size={13} /> Save</button>
                  <button className="btn small" onClick={() => setSavingName(false)}>Cancel</button>
                </div>
              ) : (
                <button className="btn small" onClick={() => setSavingName(true)}>
                  <Save size={13} /> Save this filter
                </button>
              )}
            </div>
            <button className="btn small ghost" onClick={() => setFilters(EMPTY_FILTER)}>Reset</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state">Loading diamonds…</div>
      ) : view === 'table' ? (
        <div className="card">
          <DataTable columns={cols} rows={filtered} onEdit={openDetail} onDelete={canEdit ? setDeleting : undefined} />
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: 12 }}>
            {filtered.length} of {rows.length} diamonds shown
          </div>
        </div>
      ) : (
        <>
          <div className="stone-grid">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="stone-card"
                onClick={() => openDetail(d)}
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
                  <div className="price">{mask(d.price)}</div>
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
          {filtered.length === 0 && (
            <div className="empty-state"><div className="big">◇</div>No stones match the current filters.</div>
          )}
        </>
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

      {detail && (
        <DiamondDrawer
          row={detail}
          canEdit={canEdit}
          mask={mask}
          onEdit={() => {
            setEditing(detail);
            setDetail(null);
          }}
          onDelete={() => {
            setDeleting(detail);
            setDetail(null);
          }}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}

function DiamondDrawer({
  row,
  canEdit,
  mask,
  onEdit,
  onDelete,
  onClose,
}: {
  row: Row;
  canEdit: boolean;
  mask: (n: unknown) => string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [memos, setMemos] = useState<Row[]>([]);

  useEffect(() => {
    const stockNo = String(row.stockNo || '');
    if (stockNo) {
      api
        .list('memos', { q: stockNo, limit: '5' })
        .then((r) => setMemos(r.rows))
        .catch(() => setMemos([]));
    }
  }, [row]);

  const spec = [
    ['Lab', String(row.lab || '—')],
    ['Certificate', String(row.certificate || '—')],
    ['Shape', String(row.shape || '—')],
    ['Carat', `${Number(row.carat ?? 0).toFixed(2)} ct`],
    ['Colour', String(row.color || '—')],
    ['Clarity', String(row.clarity || '—')],
    ['Cut', String(row.cut || '—')],
    ['Polish', String(row.polish || '—')],
    ['Symmetry', String(row.symmetry || '—')],
    ['Fluorescence', String(row.fluorescence || '—')],
    ['Intensity', String(row.intensity || '—')],
    ['Modifier', String(row.modifier || '—')],
    ['Measurements', String(row.measurements || '—')],
    ['Depth', row.depth != null ? `${row.depth}%` : '—'],
    ['Table', row.table != null ? `${row.table}%` : '—'],
    ['Price', mask(row.price)],
    ['Price / ct', mask(row.pricePerCarat)],
    ['Location', String(row.location || '—')],
    ['Status', String(row.status || '—')],
  ];

  return (
    <Drawer title={`${row.stockNo}`} subtitle={`${row.shape || ''} · ${Number(row.carat ?? 0).toFixed(2)}ct`} onClose={onClose} wide>
      <div className="detail-hero">
        <StoneArt row={row} size={150} />
        <div>
          <div className="detail-title">{String(row.shape)} · {Number(row.carat).toFixed(2)}ct</div>
          <div className="detail-sub">{String(row.lab)} {String(row.certificate)}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge value={row.status} />
            {String(row.intensity) && String(row.intensity) !== 'None' && <Badge value={`${row.intensity} ${row.modifier}`} />}
          </div>
          <div className="detail-price">{mask(row.price)}</div>
        </div>
      </div>

      <div className="detail-grid">
        {spec.map(([k, v]) => (
          <div className="detail-cell" key={k}>
            <div className="dc-label">{k}</div>
            <div className={`dc-value ${/price|ct/i.test(k) ? 'num' : ''}`}>{v}</div>
          </div>
        ))}
      </div>

      {row.notes ? (
        <div className="detail-section">
          <h4>Notes</h4>
          <p>{String(row.notes)}</p>
        </div>
      ) : null}

      <div className="detail-section">
        <h4>Related memos</h4>
        {memos.length === 0 ? (
          <div className="empty-state" style={{ padding: 16 }}>No memos reference this stone.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Memo</th><th>Customer</th><th>Status</th><th className="num">Value</th></tr>
              </thead>
              <tbody>
                {memos.map((m) => (
                  <tr key={m.id}>
                    <td className="mono">{String(m.memoNo)}</td>
                    <td>{String(m.customer)}</td>
                    <td><Badge value={m.status} /></td>
                    <td className="num">{money(m.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="drawer-actions">
          <button className="btn danger" onClick={onDelete}>
            <Trash2 size={15} /> Delete
          </button>
          <button className="btn primary" onClick={onEdit}>
            <Pencil size={15} /> Edit
          </button>
        </div>
      )}
    </Drawer>
  );
}
