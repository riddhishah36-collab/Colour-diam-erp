import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, RefreshCw, Download } from 'lucide-react';
import { api, type ModuleMeta, type Row } from '../api';
import { useApp } from '../AppContext';
import ModuleForm from '../components/ModuleForm';
import { Modal, toast, Badge } from '../components/ui';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

const STAGE_ACCENT: Record<string, string> = {
  New: 'var(--text-faint)',
  Contacted: 'var(--blue)',
  Qualified: 'var(--amber)',
  Proposal: 'var(--purple)',
  Won: 'var(--green)',
  Lost: 'var(--red)',
};

export default function LeadsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { modules, refreshMeta, canEditModule, maskMoney: mask } = useApp();
  const mod: ModuleMeta | undefined = modules.leads;
  const canEdit = canEditModule('leads');

  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list('leads', { limit: '500' });
      setRows(res.rows);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
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
    if (modules && !modules.leads) navigate('/');
  }, [modules, navigate]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => Object.values(r).join(' ').toLowerCase().includes(term));
  }, [rows, q]);

  const byStage = useMemo(() => {
    const m: Record<string, Row[]> = {};
    for (const s of STAGES) m[s] = [];
    for (const r of filtered) {
      const st = String(r.stage || 'New');
      if (m[st]) m[st].push(r);
      else m[st] = [r];
    }
    return m;
  }, [filtered]);

  const move = async (id: string, stage: string) => {
    if (!canEdit) return;
    const prev = rows.find((r) => r.id === id);
    if (!prev || String(prev.stage) === stage) return;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, stage } : r)));
    try {
      await api.update('leads', id, { stage });
      toast.ok(`Lead moved to ${stage}`);
      await refreshMeta();
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Move failed');
      setRows((rs) => rs.map((r) => (r.id === id ? prev : r)));
    }
  };

  if (!mod) return <div className="empty-state">Loading…</div>;

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      if (editing) {
        await api.update('leads', editing.id, values);
        toast.ok('Lead updated');
      } else {
        await api.create('leads', values);
        toast.ok('Lead created');
      }
      setEditing(null);
      setCreating(false);
      await load();
      await refreshMeta();
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const totalValue = filtered.reduce((a, r) => a + Number(r.value || 0), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Leads Pipeline</h1>
          <p>Drag cards between stages to update the pipeline. {filtered.length} leads · {mask(totalValue)} in play.</p>
        </div>
        <div className="page-actions">
          <div className="search-input">
            <Search size={15} style={{ color: 'var(--text-faint)' }} />
            <input placeholder="Search name, company, owner…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn" onClick={() => void load()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <a className="btn" href={api.csvUrl('leads', q)}>
            <Download size={15} /> Export
          </a>
          {canEdit && (
            <button className="btn primary" onClick={() => setCreating(true)}>
              <Plus size={16} /> New Lead
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading pipeline…</div>
      ) : (
        <div className="kanban">
          {STAGES.map((stage) => (
            <div
              key={stage}
              className={`kanban-col ${dragId ? 'drop-enabled' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                if (id) void move(id, stage);
                setDragId(null);
              }}
            >
              <div className="kanban-col-head" style={{ borderTopColor: STAGE_ACCENT[stage] }}>
                <span className="kc-name">{stage}</span>
                <span className="kc-count">{byStage[stage].length}</span>
              </div>
              <div className="kanban-cards">
                {byStage[stage].map((lead) => (
                  <div
                    key={lead.id}
                    className={`kanban-card ${dragId === lead.id ? 'dragging' : ''}`}
                    draggable={canEdit}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', lead.id);
                      setDragId(lead.id);
                    }}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => canEdit && setEditing(lead)}
                  >
                    <div className="kc-top">
                      <span className="kc-name">{String(lead.name)}</span>
                      <Badge value={lead.priority} />
                    </div>
                    {String(lead.company) && <div className="kc-company">{String(lead.company)}</div>}
                    <div className="kc-value">{mask(lead.value)}</div>
                    <div className="kc-meta">
                      <span>{lead.owner ? String(lead.owner) : 'Unassigned'}</span>
                      <span>{lead.expectedClose ? `close ${String(lead.expectedClose).slice(0, 10)}` : ''}</span>
                    </div>
                  </div>
                ))}
                {byStage[stage].length === 0 && (
                  <div className="kanban-empty">Drop here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <Modal
          title={`${editing ? 'Edit' : 'New'} lead`}
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
    </>
  );
}
