import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Search, RefreshCw, BookOpen, BarChart3 } from 'lucide-react';
import { api, type AccountsReport, type Field, type ModuleMeta, type Row } from '../api';
import { useApp } from '../AppContext';
import DataTable from '../components/DataTable';
import ModuleForm from '../components/ModuleForm';
import { Modal, toast, money } from '../components/ui';
import AccountsReportView from './AccountsReportView';

type Tab = 'ledger' | 'report';

export default function AccountsPage() {
  const navigate = useNavigate();
  const { modules, refreshMeta } = useApp();
  const mod: ModuleMeta | undefined = modules.accounts;

  const [tab, setTab] = useState<Tab>('ledger');
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [report, setReport] = useState<AccountsReport | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list('accounts', q ? { q } : {});
      setRows(res.rows);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [q]);

  const loadReport = useCallback(async () => {
    try {
      setReport(await api.accountsReport());
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load report');
    }
  }, []);

  useEffect(() => {
    if (tab === 'ledger') void load();
    else void loadReport();
  }, [tab, load, loadReport]);

  useEffect(() => {
    if (modules && !modules.accounts) navigate('/');
  }, [modules, navigate]);

  if (!mod) return <div className="empty-state">Loading…</div>;

  const cols: Field[] = mod.fields.filter((f) => f.type !== 'textarea' && !f.readonly).slice(0, 9);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      if (editing) {
        await api.update('accounts', editing.id, values);
        toast.ok('Ledger entry updated');
      } else {
        await api.create('accounts', values);
        toast.ok('Ledger entry created');
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
      await api.remove('accounts', deleting.id);
      toast.ok('Entry deleted');
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
          <h1>Accounts</h1>
          <p>Receivables, payables, payments and receipts — with a financial report and aging analysis.</p>
        </div>
        <div className="page-actions">
          <div className="search-input" style={{ display: tab === 'ledger' ? 'flex' : 'none' }}>
            <Search size={15} style={{ color: 'var(--text-faint)' }} />
            <input
              placeholder="Search party, reference…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {tab === 'ledger' ? (
            <>
              <button className="btn" onClick={() => void load()}>
                <RefreshCw size={15} />
                Refresh
              </button>
              <a
                className="btn"
                href={api.csvUrl('accounts', q)}
                onClick={(e) => {
                  e.preventDefault();
                  const a = document.createElement('a');
                  a.href = api.csvUrl('accounts', q);
                  a.download = 'accounts-export.csv';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }}
              >
                <Download size={15} />
                Export CSV
              </a>
              <button className="btn primary" onClick={() => setCreating(true)}>
                <Plus size={16} />
                New Entry
              </button>
            </>
          ) : (
            <button className="btn" onClick={() => void loadReport()}>
              <RefreshCw size={15} />
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'ledger' ? 'on' : ''} onClick={() => setTab('ledger')}>
          <BookOpen size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Ledger
        </button>
        <button className={tab === 'report' ? 'on' : ''} onClick={() => setTab('report')}>
          <BarChart3 size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Financial Report
        </button>
      </div>

      {tab === 'ledger' ? (
        loading ? (
          <div className="empty-state">Loading ledger…</div>
        ) : (
          <div className="card">
            <DataTable columns={cols} rows={rows} onEdit={setEditing} onDelete={setDeleting} />
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', color: 'var(--text-faint)', fontSize: 12 }}>
              {rows.length} of {mod.count} ledger entries shown
            </div>
          </div>
        )
      ) : (
        <AccountsReportView report={report} />
      )}

      {(creating || editing) && (
        <Modal
          title={`${editing ? 'Edit' : 'New'} ledger entry`}
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
          title="Delete ledger entry"
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
            Delete {String(deleting.type)} for {String(deleting.party)} ({money(deleting.amount)})? This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
}
