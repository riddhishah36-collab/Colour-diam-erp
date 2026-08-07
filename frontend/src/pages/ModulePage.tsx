import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Download, Search, RefreshCw } from 'lucide-react';
import { api, type Field, type ModuleMeta, type Row } from '../api';
import { useApp } from '../AppContext';
import DataTable from '../components/DataTable';
import ModuleForm from '../components/ModuleForm';
import { Modal, toast } from '../components/ui';

function tableColumns(mod: ModuleMeta): Field[] {
  return mod.fields
    .filter((f) => f.type !== 'textarea' && !f.readonly)
    .slice(0, 9);
}

function csvDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function ModulePage() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { modules, refreshMeta, canEditModule, canViewModule } = useApp();
  const mod: ModuleMeta | undefined = modules[key || ''];
  const canEdit = canEditModule(key || '');

  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const load = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    try {
      const res = await api.list(key, q ? { q } : {});
      setRows(res.rows);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [key, q]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!mod && key && modules && !modules[key]) {
      navigate('/');
    }
    if (mod && !canViewModule(mod.key)) navigate('/');
  }, [mod, key, modules, navigate, canViewModule]);

  if (!mod) {
    return (
      <div className="empty-state">
        <div className="big">◇</div>
        Loading module…
      </div>
    );
  }

  const cols = tableColumns(mod);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      if (editing) {
        await api.update(mod.key, editing.id, values);
        toast.ok(`${mod.name} record updated`);
      } else {
        await api.create(mod.key, values);
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
      await api.remove(mod.key, deleting.id);
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
          <h1>{mod.name}</h1>
          <p>{mod.description}</p>
        </div>
        <div className="page-actions">
          <div className="search-input">
            <Search size={15} style={{ color: 'var(--text-faint)' }} />
            <input
              placeholder={`Search ${mod.name.toLowerCase()}…`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button
            className="btn"
            title="Refresh"
            onClick={() => void load()}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <a
            className="btn"
            href={api.csvUrl(mod.key, q)}
            onClick={(e) => {
              e.preventDefault();
              csvDownload(api.csvUrl(mod.key, q), `${mod.key}-export.csv`);
            }}
          >
            <Download size={15} />
            Export CSV
          </a>
          {canEdit && (
            <button className="btn primary" onClick={() => setCreating(true)}>
              <Plus size={16} />
              New {mod.name.replace(/\s*&.*$/, '').replace(/\s+.*$/, '')}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading {mod.name.toLowerCase()}…</div>
        ) : (
          <DataTable
            columns={cols}
            rows={rows}
            onEdit={setEditing}
            onDelete={canEdit ? setDeleting : undefined}
          />
        )}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: 12 }}>
          {rows.length} of {mod.count} {mod.name.toLowerCase()} shown
        </div>
      </div>

      {(creating || editing) && (
        <Modal
          title={`${editing ? 'Edit' : 'New'} ${mod.name.replace(/\s*&.*$/, '')} record`}
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
            Are you sure you want to delete this {mod.name.toLowerCase()} record? This
            action cannot be undone.
          </p>
          <div className="card" style={{ padding: 10, background: 'var(--surface-2)' }}>
            <div style={{ fontSize: 12.5 }}>
              ID: <span className="mono">{deleting.id}</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
