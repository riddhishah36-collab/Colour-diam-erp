import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, type ActivityItem } from '../api';
import { toast } from '../components/ui';

const KIND_COLOR: Record<string, string> = {
  stock: 'var(--green)',
  memo: 'var(--amber)',
  return: 'var(--red)',
  expense: 'var(--blue)',
  invoice: 'var(--primary)',
  quote: 'var(--purple)',
  payment: 'var(--teal)',
  lead: 'var(--blue)',
};

const KIND_LABEL: Record<string, string> = {
  stock: 'Stock',
  memo: 'Memo',
  return: 'Return',
  expense: 'Expense',
  invoice: 'Invoice',
  quote: 'Quote',
  payment: 'Payment',
  lead: 'Lead',
};

export default function ActivityPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [kind, setKind] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.activity();
      setActivity(res.activity);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const kinds = useMemo(() => {
    const s = new Set(activity.map((a) => a.kind));
    return ['all', ...[...s].sort()];
  }, [activity]);

  const filtered = useMemo(() => {
    if (kind === 'all') return activity;
    return activity.filter((a) => a.kind === kind);
  }, [activity, kind]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Activity</h1>
          <p>Full chronological feed of stock, sales, finance and CRM events.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => void load()}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="saved-filter-row" style={{ marginBottom: 16 }}>
        {kinds.map((k) => (
          <span
            key={k}
            className={`saved-filter-chip ${kind === k ? 'on' : ''}`}
            onClick={() => setKind(k)}
          >
            {k === 'all' ? 'All' : KIND_LABEL[k] || k}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Loading activity…</div>
      ) : (
        <div className="card" style={{ padding: '12px 16px' }}>
          <div className="timeline">
            {filtered.length === 0 && (
              <div className="empty-state">No activity in this view.</div>
            )}
            {filtered.slice(0, 150).map((a, i) => (
              <div className="timeline-item" key={i}>
                <span className="tl-dot" style={{ background: KIND_COLOR[a.kind] || 'var(--text-faint)' }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-meta">
                    <span className={`badge ${a.kind === 'return' ? 'red' : 'blue'}`}>{KIND_LABEL[a.kind] || a.kind}</span>
                    {a.meta ? ` · ${a.meta}` : ''}
                    {a.date ? ` · ${String(a.date).slice(0, 10)}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length > 150 && (
            <div style={{ padding: '10px 4px', color: 'var(--text-faint)', fontSize: 12 }}>
              Showing first 150 events of {filtered.length}.
            </div>
          )}
        </div>
      )}
    </>
  );
}
