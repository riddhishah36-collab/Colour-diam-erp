import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Send, MessageSquare } from 'lucide-react';
import { api, type ModuleMeta, type Row } from '../api';
import { useApp } from '../AppContext';
import { toast } from '../components/ui';

const OURS = ['colourdi.am', 'sales@colourdi.am'];

function isOurs(addr: string): boolean {
  const a = addr.toLowerCase();
  return OURS.some((o) => a.includes(o)) || a === 'me' || a === 'a. kapoor';
}

function partnerOf(m: Row): string {
  if (String(m.type) === 'Internal') return String(m.from || m.to);
  const f = String(m.from || '');
  const t = String(m.to || '');
  return isOurs(f) ? t : f;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { modules, refreshMeta, canEditModule } = useApp();
  const mod: ModuleMeta | undefined = modules.messages;
  const canEdit = canEditModule('messages');

  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list('messages', { limit: '500' });
      setRows(res.rows);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (modules && !modules.messages) navigate('/');
  }, [modules, navigate]);

  const conversations = useMemo(() => {
    const term = q.trim().toLowerCase();
    const map = new Map<string, Row[]>();
    for (const m of rows) {
      if (term && !Object.values(m).join(' ').toLowerCase().includes(term)) continue;
      const p = partnerOf(m);
      const arr = map.get(p) || [];
      arr.push(m);
      map.set(p, arr);
    }
    return [...map.entries()]
      .map(([partner, msgs]) => {
        const sorted = [...msgs].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
        const last = sorted[sorted.length - 1];
        return {
          partner,
          msgs: sorted,
          last,
          unread: msgs.filter((m) => m.status === 'Unread' && !isOurs(String(m.from))).length,
          lastType: String(last?.type || ''),
        };
      })
      .sort((a, b) => String(b.last.date || '').localeCompare(String(a.last.date || '')));
  }, [rows, q]);

  useEffect(() => {
    if (!active && conversations.length) setActive(conversations[0].partner);
  }, [conversations, active]);

  const activeConv = conversations.find((c) => c.partner === active) || null;

  // Mark unread as read when opening a conversation.
  useEffect(() => {
    if (!activeConv) return;
    const unread = activeConv.msgs.filter((m) => m.status === 'Unread' && !isOurs(String(m.from)));
    if (!unread.length) return;
    unread.forEach((m) => {
      void api
        .update('messages', m.id, { status: 'Read' })
        .catch(() => undefined);
    });
    setRows((rs) =>
      rs.map((r) =>
        unread.some((u) => u.id === r.id) ? { ...r, status: 'Read' } : r,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv]);

  const send = async () => {
    if (!activeConv || !draft.trim()) return;
    const internal = String(activeConv.last?.type) === 'Internal';
    const today = new Date().toISOString().slice(0, 10);
    try {
      const created = await api.create('messages', {
        from: internal ? 'Aarav Kapoor' : 'sales@colourdi.am',
        to: internal ? activeConv.partner : activeConv.partner,
        subject: activeConv.last?.subject || '',
        body: draft.trim(),
        type: internal ? 'Internal' : 'Email',
        status: 'Replied',
        date: today,
        relatedTo: activeConv.partner,
      });
      setDraft('');
      setRows((rs) => [...rs, created]);
      await refreshMeta();
      toast.ok('Message sent');
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Send failed');
    }
  };

  if (!mod) return <div className="empty-state">Loading…</div>;

  const isIncoming = (m: Row) => !isOurs(String(m.from));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Messages</h1>
          <p>WhatsApp-style inbox for customer, supplier and internal conversations.</p>
        </div>
        <div className="page-actions">
          <div className="search-input">
            <Search size={15} style={{ color: 'var(--text-faint)' }} />
            <input placeholder="Search conversations…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn" onClick={() => void load()}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading inbox…</div>
      ) : (
        <div className="inbox">
          <div className="conv-list">
            {conversations.length === 0 && (
              <div className="empty-state">No conversations found.</div>
            )}
            {conversations.map((c) => (
              <button
                key={c.partner}
                className={`conv-item ${active === c.partner ? 'on' : ''}`}
                onClick={() => setActive(c.partner)}
              >
                <div className="conv-avatar">{String(c.partner).slice(0, 2).toUpperCase()}</div>
                <div className="conv-body">
                  <div className="conv-top">
                    <span className="conv-name">{c.partner}</span>
                    <span className="conv-date">{c.last.date ? String(c.last.date).slice(5, 10) : ''}</span>
                  </div>
                  <div className="conv-preview">
                    {isIncoming(c.last) ? '' : 'You: '}
                    {String(c.last?.body || c.last?.subject || '').slice(0, 60)}
                  </div>
                </div>
                {c.unread > 0 && <span className="conv-unread">{c.unread}</span>}
              </button>
            ))}
          </div>

          <div className="thread">
            {!activeConv ? (
              <div className="empty-state">Select a conversation to read messages.</div>
            ) : (
              <>
                <div className="thread-head">
                  <div className="conv-avatar">{activeConv.partner.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="thread-name">{activeConv.partner}</div>
                    <div className="thread-sub">
                      {activeConv.msgs.length} messages ·{' '}
                      {activeConv.unread} unread
                    </div>
                  </div>
                </div>
                <div className="thread-body">
                  {activeConv.msgs.map((m) => (
                    <div key={m.id} className={`bubble-row ${isIncoming(m) ? 'in' : 'out'}`}>
                      <div className="bubble">
                        <div className="bubble-type">
                          <MessageSquare size={11} />
                          {String(m.type || '')}
                        </div>
                        <div className="bubble-text">{String(m.body || m.subject || '')}</div>
                        <div className="bubble-meta">
                          {m.date ? String(m.date).slice(0, 10) : ''}
                          {m.status === 'Unread' ? ' · unread' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="thread-compose">
                  <textarea
                    placeholder="Type a reply…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    disabled={!canEdit}
                  />
                  <button className="btn primary" onClick={() => void send()} disabled={!canEdit || !draft.trim()}>
                    <Send size={15} /> Send
                  </button>
                </div>
                {!canEdit && (
                  <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--text-faint)' }}>
                    Your role cannot send messages ({mod.name}). Switch to Sales Manager to reply.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
