import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Download, Search, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';
import { api, type Field, type ModuleMeta, type Row } from '../api';
import { useApp } from '../AppContext';
import DataTable from '../components/DataTable';
import ModuleForm from '../components/ModuleForm';
import Drawer from '../components/Drawer';
import { Modal, toast, money, Badge } from '../components/ui';

function csvDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

interface TimelineEvent {
  id: string;
  date: string;
  kind: string;
  text: string;
  meta: string;
}

const KIND_DOT: Record<string, string> = {
  memo: 'var(--amber)',
  account: 'var(--green)',
  invoice: 'var(--blue)',
  quote: 'var(--purple)',
  payment: 'var(--teal)',
  return: 'var(--red)',
  message: 'var(--text-faint)',
};

export default function CustomersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { modules, refreshMeta, canEditModule, maskMoney: mask } = useApp();
  const mod: ModuleMeta | undefined = modules.customers;
  const canEdit = canEditModule('customers');

  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list('customers', { limit: '500' });
      setRows(res.rows);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load customers');
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
      if (row) setDetail(row);
      searchParams.delete('id');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, rows]);

  useEffect(() => {
    if (modules && !modules.customers) navigate('/');
  }, [modules, navigate]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => Object.values(r).join(' ').toLowerCase().includes(term));
  }, [rows, q]);

  if (!mod) return <div className="empty-state">Loading…</div>;

  const cols: Field[] = mod.fields.filter((f) => f.type !== 'textarea' && !f.readonly).slice(0, 9);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      if (editing) {
        await api.update('customers', editing.id, values);
        toast.ok('Customer updated');
      } else {
        await api.create('customers', values);
        toast.ok('Customer created');
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
      await api.remove('customers', deleting.id);
      toast.ok('Customer deleted');
      setDeleting(null);
      setDetail(null);
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
          <h1>Customers CRM</h1>
          <p>Contact profiles with purchase history, credit and a full engagement timeline.</p>
        </div>
        <div className="page-actions">
          <div className="search-input">
            <Search size={15} style={{ color: 'var(--text-faint)' }} />
            <input placeholder="Search name, company, city…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn" onClick={() => void load()}>
            <RefreshCw size={15} /> Refresh
          </button>
          <a
            className="btn"
            href={api.csvUrl('customers', q)}
            onClick={(e) => {
              e.preventDefault();
              csvDownload(api.csvUrl('customers', q), 'customers-export.csv');
            }}
          >
            <Download size={15} /> Export CSV
          </a>
          {canEdit && (
            <button className="btn primary" onClick={() => setCreating(true)}>
              <Plus size={16} /> New Customer
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading customers…</div>
        ) : (
          <DataTable columns={cols} rows={filtered} onEdit={setDetail} onDelete={canEdit ? setDeleting : undefined} />
        )}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: 12 }}>
          {filtered.length} of {rows.length} customers shown
        </div>
      </div>

      {(creating || editing) && (
        <Modal
          title={`${editing ? 'Edit' : 'New'} customer`}
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
          title="Delete customer"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn danger" onClick={() => void handleDelete()}>Delete</button>
            </>
          }
        >
          <p>Delete {String(deleting.name)}? Their engagement history will be removed.</p>
        </Modal>
      )}

      {detail && (
        <CustomerDrawer
          row={detail}
          canEdit={canEdit}
          mask={mask}
          onEdit={() => {
            setEditing(detail);
            setDetail(null);
          }}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}

function CustomerDrawer({
  row,
  canEdit,
  mask,
  onEdit,
  onClose,
}: {
  row: Row;
  canEdit: boolean;
  mask: (n: unknown) => string;
  onEdit: () => void;
  onClose: () => void;
}) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const name = String(row.name || '');
    if (!name) return;
    let cancelled = false;
    Promise.all([
      api.list('memos', { q: name, limit: '30' }),
      api.list('accounts', { q: name, limit: '30' }),
      api.list('invoices', { q: name, limit: '30' }),
      api.list('quotations', { q: name, limit: '30' }),
      api.list('payments', { q: name, limit: '30' }),
      api.list('returns', { q: name, limit: '30' }),
      api.list('messages', { q: name, limit: '30' }),
    ])
      .then(([memos, accounts, invoices, quotes, payments, returns, messages]) => {
        if (cancelled) return;
        const events: TimelineEvent[] = [];
        const push = (date: unknown, kind: string, text: string, meta: string) => {
          if (date) events.push({ id: `${kind}-${events.length}-${text}`, date: String(date), kind, text, meta });
        };
        memos.rows.forEach((m) => push(m.dueDate || m.issueDate, 'memo', `Memo ${m.memoNo} ${String(m.status).toLowerCase()}`, `Value ${money(m.value)}`));
        accounts.rows.forEach((a) => push(a.date, 'account', `${a.type} ${a.reference || ''}`, `${a.status} · ${money(a.amount)}`));
        invoices.rows.forEach((i) => push(i.date, 'invoice', `Invoice ${i.invoiceNo} ${String(i.status).toLowerCase()}`, money(i.total)));
        quotes.rows.forEach((qt) => push(qt.date, 'quote', `Quote ${qt.quoteNo} ${String(qt.status).toLowerCase()}`, money(qt.total)));
        payments.rows.forEach((p) => push(p.date, 'payment', `Payment ${p.paymentNo} ${String(p.status).toLowerCase()}`, `${p.method} · ${money(p.amount)}`));
        returns.rows.forEach((r) => push(r.date, 'return', `Return ${r.returnNo} ${String(r.status).toLowerCase()}`, String(r.reason)));
        messages.rows.forEach((m) => push(m.date, 'message', `${m.type} from ${m.from}`, String(m.subject)));
        setTimeline(events.sort((a, b) => String(b.date).localeCompare(String(a.date))));
      })
      .catch(() => setTimeline([]));
    return () => {
      cancelled = true;
    };
  }, [row]);

  const contact = [
    ['Company', String(row.company || '—')],
    ['Email', String(row.email || '—')],
    ['Phone', String(row.phone || '—')],
    ['City', String(row.city || '—')],
    ['Country', String(row.country || '—')],
    ['Credit limit', mask(row.creditLimit)],
    ['Customer since', String(row.since || '—')],
    ['Tags', String(row.tags || '—')],
  ];

  return (
    <Drawer title={String(row.name)} subtitle={`${String(row.company || '')} · ${String(row.city || '')}`} onClose={onClose} wide>
      <div className="customer-hero">
        <div className="customer-avatar">{String(row.name).split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</div>
        <div>
          <div className="detail-title">{String(row.name)}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6, color: 'var(--text-soft)', fontSize: 13 }}>
            {String(row.email) && <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Mail size={13} /> {String(row.email)}</span>}
            {String(row.phone) && <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Phone size={13} /> {String(row.phone)}</span>}
            {String(row.city) && <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><MapPin size={13} /> {String(row.city)}</span>}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge value={row.status} />
            {String(row.type) && <Badge value={row.type} />}
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h4>Profile</h4>
        <div className="detail-grid">
          {contact.map(([k, v]) => (
            <div className="detail-cell" key={k}>
              <div className="dc-label">{k}</div>
              <div className="dc-value">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {row.notes ? (
        <div className="detail-section">
          <h4>Notes</h4>
          <p>{String(row.notes)}</p>
        </div>
      ) : null}

      <div className="detail-section">
        <h4>Engagement timeline ({timeline.length})</h4>
        {timeline.length === 0 ? (
          <div className="empty-state" style={{ padding: 18 }}>No activity recorded for this customer yet.</div>
        ) : (
          <div className="timeline">
            {timeline.slice(0, 30).map((e) => (
              <div className="timeline-item" key={e.id}>
                <span className="tl-dot" style={{ background: KIND_DOT[e.kind] || 'var(--text-faint)' }} />
                <div>
                  <div className="activity-text">{e.text}</div>
                  <div className="activity-meta">{e.meta}{e.date ? ` · ${e.date.slice(0, 10)}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canEdit && (
        <div className="drawer-actions">
          <button className="btn primary" onClick={onEdit}>Edit customer</button>
        </div>
      )}
    </Drawer>
  );
}
