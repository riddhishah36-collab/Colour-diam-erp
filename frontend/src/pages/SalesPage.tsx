import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Download, Search, RefreshCw, FilePlus, CreditCard, FileSignature } from 'lucide-react';
import { api, type Field, type ModuleMeta, type Row } from '../api';
import { useApp } from '../AppContext';
import DataTable from '../components/DataTable';
import ModuleForm from '../components/ModuleForm';
import { Modal, toast } from '../components/ui';

type Tab = 'invoices' | 'payments' | 'quotations';

const TABS: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
  { key: 'invoices', label: 'Invoices', icon: FilePlus },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'quotations', label: 'Quotations', icon: FileSignature },
];

function csvDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function SalesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { modules, refreshMeta, canEditModule } = useApp();
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab');
    return t === 'payments' || t === 'quotations' ? t : 'invoices';
  });

  const mod: ModuleMeta | undefined = modules[tab];
  const canEdit = canEditModule(tab);

  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list(tab, q ? { q } : { limit: '500' });
      setRows(res.rows);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [tab, q]);

  useEffect(() => {
    void load();
  }, [load, tab]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'payments' || t === 'quotations' || t === 'invoices') setTab(t);
    if (searchParams.get('new') === '1') {
      setCreating(true);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
    const id = searchParams.get('id');
    if (id) {
      const row = rows.find((r) => r.id === id);
      if (row) setEditing(row);
      searchParams.delete('id');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, rows]);

  useEffect(() => {
    if (modules && !modules.invoices) navigate('/');
  }, [modules, navigate]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setQ('');
    setEditing(null);
    setCreating(false);
    setDeleting(null);
    const sp = new URLSearchParams(searchParams);
    sp.set('tab', t);
    setSearchParams(sp, { replace: true });
  };

  if (!mod) return <div className="empty-state">Loading…</div>;

  const cols: Field[] = mod.fields.filter((f) => f.type !== 'textarea' && !f.readonly).slice(0, 9);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      if (editing) {
        await api.update(tab, editing.id, values);
        toast.ok(`${mod.name} record updated`);
      } else {
        await api.create(tab, values);
        toast.ok(`${mod.name} record created`);
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
      await api.remove(tab, deleting.id);
      toast.ok('Record deleted');
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
          <h1>Sales Workspace</h1>
          <p>Invoices, payments and quotations — the full selling cycle in one place.</p>
        </div>
        <div className="page-actions">
          <div className="search-input">
            <Search size={15} style={{ color: 'var(--text-faint)' }} />
            <input
              placeholder={`Search ${tab}…`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button className="btn" onClick={() => void load()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <a
            className="btn"
            href={api.csvUrl(tab, q)}
            onClick={(e) => {
              e.preventDefault();
              csvDownload(api.csvUrl(tab, q), `${tab}-export.csv`);
            }}
          >
            <Download size={15} /> Export CSV
          </a>
          {canEdit && (
            <button className="btn primary" onClick={() => setCreating(true)}>
              <Plus size={16} /> New {TABS.find((t) => t.key === tab)?.label.slice(0, -1) || 'Record'}
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => switchTab(t.key)}>
            <t.icon size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            {t.label}
            {modules[t.key] ? <span className="tab-count">{modules[t.key]?.count}</span> : null}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading {tab}…</div>
        ) : (
          <DataTable columns={cols} rows={rows} onEdit={setEditing} onDelete={canEdit ? setDeleting : undefined} />
        )}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: 12 }}>
          {rows.length} of {mod.count} {mod.name.toLowerCase()} shown
        </div>
      </div>

      {(creating || editing) && (
        <Modal
          title={`${editing ? 'Edit' : 'New'} ${mod.name.slice(0, -1).toLowerCase()} record`}
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
          title="Delete record"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn danger" onClick={() => void handleDelete()}>Delete</button>
            </>
          }
        >
          <p>Are you sure you want to delete this {mod.name.toLowerCase().slice(0, -1)} record? This cannot be undone.</p>
        </Modal>
      )}
    </>
  );
}
