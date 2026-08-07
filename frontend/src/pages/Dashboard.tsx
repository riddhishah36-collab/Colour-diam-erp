import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gem,
  Wallet,
  Warehouse,
  ListChecks,
  FileText,
  Receipt,
  Mail,
  Settings2,
  LayoutGrid,
  RotateCcw as ResetIcon,
  ArrowRight,
  Users,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';
import { api, type AccountsReport, type DashboardData } from '../api';
import { Modal, toast } from '../components/ui';
import { useApp } from '../AppContext';

type Span = 3 | 4 | 6 | 8 | 12;

interface WidgetCtx {
  dash: DashboardData | null;
  report: AccountsReport | null;
  nav: (path: string) => void;
}

interface WidgetDef {
  id: string;
  title: string;
  desc: string;
  span: Span;
  render: (ctx: WidgetCtx) => React.ReactNode;
}

const STORAGE_KEY = 'cds.dashboard.widgets';

interface Config {
  order: string[];
  hidden: string[];
}

function loadConfig(ids: string[]): Config {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Config;
      const known = new Set(ids);
      const order = parsed.order.filter((id) => known.has(id));
      const hidden = parsed.hidden.filter((id) => known.has(id));
      const missing = ids.filter((id) => !order.includes(id));
      return { order: [...order, ...missing], hidden };
    }
  } catch {
    /* ignore */
  }
  return { order: ids, hidden: [] };
}

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="kpi-row">
      <div className="kpi-icon" style={{ background: `${color}18`, color }}>
        <Icon size={19} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

const dotColor: Record<string, string> = {
  stock: 'var(--green)',
  memo: 'var(--amber)',
  return: 'var(--red)',
  expense: 'var(--blue)',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { maskMoney: mask } = useApp();
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [report, setReport] = useState<AccountsReport | null>(null);
  const [config, setConfig] = useState<Config>({ order: [], hidden: [] });
  const [ready, setReady] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const registry: WidgetDef[] = useMemo(() => {
    const ctx: WidgetCtx = { dash, report, nav: navigate };
    return [
      {
        id: 'kpi-pipeline', title: 'Diamond Inventory', desc: 'Live stock & pipeline value', span: 3,
        render: () => (
          <Kpi
            label="Diamond inventory value"
            value={mask(dash?.counts.pipelineValue)}
            sub={`${dash?.counts.diamondsAvailable ?? 0} available · ${dash?.counts.diamondsTotal ?? 0} total stones`}
            icon={Gem} color="var(--primary)"
          />
        ),
      },
      {
        id: 'kpi-sales', title: 'Sales', desc: 'Open invoices & payments', span: 3,
        render: () => (
          <Kpi
            label="Open invoices"
            value={dash?.counts.invoicesOpen ?? 0}
            sub={`${mask(dash?.counts.invoicesValue)} outstanding · ${mask(dash?.counts.paymentsMonth)} received this month`}
            icon={ShoppingCart} color="var(--primary)"
          />
        ),
      },
      {
        id: 'kpi-receivables', title: 'Receivables', desc: 'Open customer balances', span: 3,
        render: () => (
          <Kpi
            label="Open receivables"
            value={mask(dash?.counts.receivables)}
            sub="Awaiting from customers"
            icon={Wallet} color="var(--green)"
          />
        ),
      },
      {
        id: 'kpi-payables', title: 'Payables', desc: 'Supplier balances due', span: 3,
        render: () => (
          <Kpi
            label="Open payables"
            value={mask(dash?.counts.payables)}
            sub="Due to suppliers"
            icon={Receipt} color="var(--red)"
          />
        ),
      },
      {
        id: 'kpi-stock', title: 'Stock Value', desc: 'Movements ledger value', span: 3,
        render: () => (
          <Kpi
            label="Stock value"
            value={mask(dash?.counts.stockValue)}
            sub={`${dash?.counts.products ?? 0} catalogue products`}
            icon={Warehouse} color="var(--teal)"
          />
        ),
      },
      {
        id: 'kpi-tasks', title: 'Tasks', desc: 'Workload overview', span: 3,
        render: () => (
          <Kpi
            label="Open tasks"
            value={dash?.counts.tasksOpen ?? 0}
            sub={`${dash?.counts.tasksDone ?? 0} completed`}
            icon={ListChecks} color="var(--purple)"
          />
        ),
      },
      {
        id: 'kpi-memos', title: 'Memos', desc: 'Consignment exposure', span: 3,
        render: () => (
          <Kpi
            label="Outstanding memos"
            value={dash?.counts.memosOutstanding ?? 0}
            sub={`${mask(dash?.counts.memosValue)} on memo`}
            icon={FileText} color="var(--amber)"
          />
        ),
      },
      {
        id: 'kpi-expenses', title: 'Expenses', desc: 'July operating costs', span: 3,
        render: () => (
          <Kpi
            label="July expenses"
            value={mask(dash?.counts.expensesMonth)}
            sub="Month to date"
            icon={Receipt} color="var(--blue)"
          />
        ),
      },
      {
        id: 'kpi-messages', title: 'Messages', desc: 'Inbox requiring attention', span: 3,
        render: () => (
          <Kpi
            label="Unread messages"
            value={dash?.counts.messagesUnread ?? 0}
            sub={`${dash?.counts.returnsOpen ?? 0} open returns`}
            icon={Mail} color="var(--red)"
          />
        ),
      },
      {
        id: 'kpi-leads', title: 'Leads', desc: 'Open opportunities', span: 3,
        render: () => {
          const byStage = dash?.counts.leadsByStage || {};
          return (
            <Kpi
              label="Open leads"
              value={dash?.counts.leads ?? 0}
              sub={`${byStage.Proposal || 0} in proposal · ${byStage.Qualified || 0} qualified`}
              icon={TrendingUp} color="var(--purple)"
            />
          );
        },
      },
      {
        id: 'kpi-customers', title: 'Customers', desc: 'CRM contacts', span: 3,
        render: () => (
          <Kpi
            label="Customer records"
            value={dash?.counts.customers ?? 0}
            sub={`${dash?.counts.quotationsOpen ?? 0} open quotations`}
            icon={Users} color="var(--teal)"
          />
        ),
      },
      {
        id: 'leads-pipeline', title: 'Leads by stage', desc: 'Opportunity funnel', span: 4,
        render: () => {
          const byStage = dash?.counts.leadsByStage || {};
          const order = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
          const total = order.reduce((a, s) => a + (byStage[s] || 0), 0);
          const colors: Record<string, string> = {
            New: 'var(--text-faint)', Contacted: 'var(--blue)', Qualified: 'var(--amber)',
            Proposal: 'var(--purple)', Won: 'var(--green)', Lost: 'var(--red)',
          };
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {order.map((s) => (
                <div key={s}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{s}</span>
                    <span style={{ color: 'var(--text-soft)' }}>{byStage[s] || 0}</span>
                  </div>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: `${total ? ((byStage[s] || 0) / total) * 100 : 0}%`, background: colors[s] }} />
                  </div>
                </div>
              ))}
              <button className="btn small ghost" style={{ alignSelf: 'flex-start' }} onClick={() => ctx.nav('/leads')}>
                Open pipeline <ArrowRight size={13} />
              </button>
            </div>
          );
        },
      },
      {
        id: 'notifications', title: 'Notifications', desc: 'Requiring attention', span: 4,
        render: () => (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="notif-mini">
              {[
                { kind: 'Overdue', text: 'INV-3009 from Luxury Lines is overdue', sev: 'high' },
                { kind: 'Memo', text: 'Memo M-0041 to R. Mehta is past due', sev: 'medium' },
                { kind: 'Task', text: 'Renew vault insurance policy is urgent', sev: 'high' },
                { kind: 'Message', text: 'Unread WhatsApp from S. Nair', sev: 'low' },
              ].map((n, i) => (
                <div className="activity-item" key={i}>
                  <span className={`notif-kind k-${n.sev}`}>{n.kind}</span>
                  <div>
                    <div className="activity-text">{n.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn small ghost" style={{ alignSelf: 'flex-start' }} onClick={() => ctx.nav('/activity')}>
              View activity <ArrowRight size={13} />
            </button>
          </div>
        ),
      },
      {
        id: 'recent-diamonds', title: 'Recently added diamonds', desc: 'Newest stones in stock', span: 8,
        render: () => (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock No</th><th>Shape</th><th>Carat</th><th>Colour</th><th>Clarity</th><th>Lab</th><th className="num">Price</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(dash?.recentDiamonds || []).map((d) => (
                  <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => ctx.nav('/diamonds')}>
                    <td className="mono">{d.stockNo}</td>
                    <td>{d.shape}</td>
                    <td>{d.carat}</td>
                    <td>{d.intensity && d.intensity !== 'None' ? `${d.intensity} ${d.modifier}` : d.color}</td>
                    <td>{d.clarity}</td>
                    <td>{d.lab}</td>
                    <td className="num">{mask(d.price)}</td>
                    <td>
                      <span className={`badge ${d.status === 'Available' ? 'green' : d.status === 'On Memo' ? 'amber' : d.status === 'Sold' ? 'purple' : 'gray'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      },
      {
        id: 'account-aging', title: 'Receivables aging', desc: 'By days past due', span: 4,
        render: () => {
          const a = dash?.accountAging;
          const total = a ? a.current + a.d30 + a.d60 + a.d90 : 0;
          const rows = [
            { label: 'Current', val: a?.current ?? 0, color: 'var(--green)' },
            { label: '1–30 days', val: a?.d30 ?? 0, color: 'var(--amber)' },
            { label: '31–60 days', val: a?.d60 ?? 0, color: 'var(--blue)' },
            { label: '60+ days', val: a?.d90 ?? 0, color: 'var(--red)' },
          ];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {rows.map((r) => (
                <div key={r.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>{r.label}</span>
                    <span style={{ color: 'var(--text-soft)' }}>{mask(r.val)}</span>
                  </div>
                  <div className="hbar-track">
                    <div
                      className="hbar-fill"
                      style={{ width: `${total ? Math.max(2, (r.val / total) * 100) : 0}%`, background: r.color }}
                    />
                  </div>
                </div>
              ))}
              <button className="btn small ghost" style={{ alignSelf: 'flex-start' }} onClick={() => ctx.nav('/accounts')}>
                Open ledger <ArrowRight size={13} />
              </button>
            </div>
          );
        },
      },
      {
        id: 'task-list', title: 'Open tasks', desc: 'Work in flight', span: 6,
        render: () => {
          const open = (dash?.recentTasks || []).filter((t) => t.status !== 'Done');
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {open.slice(0, 6).map((t) => (
                <div key={t.id} className="activity-item">
                  <span className={`badge ${t.priority === 'Urgent' || t.priority === 'High' ? 'red' : t.priority === 'Medium' ? 'blue' : 'gray'}`}>{t.priority}</span>
                  <div>
                    <div className="activity-text">{t.title}</div>
                    <div className="activity-meta">
                      {t.assignee || 'Unassigned'} · due {t.dueDate ? String(t.dueDate).slice(0, 10) : '—'}
                    </div>
                  </div>
                </div>
              ))}
              {open.length === 0 && <div className="empty-state" style={{ padding: 20 }}>All caught up!</div>}
            </div>
          );
        },
      },
      {
        id: 'recent-activity', title: 'Recent activity', desc: 'Stock, memos, returns & expenses', span: 6,
        render: () => (
          <div className="activity-feed">
            {(dash?.recentActivity || []).slice(0, 9).map((a, i) => (
              <div className="activity-item" key={i}>
                <span className="activity-dot" style={{ background: dotColor[a.kind] || 'var(--text-faint)' }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-meta">
                    {a.date ? String(a.date).slice(0, 10) : ''}
                    {a.meta ? ` · ${a.meta}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'cashflow', title: 'Cash flow', desc: 'Receipts vs payments, last 6 months', span: 12,
        render: () => {
          const series = report?.cashflowSeries || [];
          const max = Math.max(1, ...series.map((s) => Math.max(s.in, s.out, 1)));
          return (
            <div>
              <div className="bar-row">
                {series.map((s) => (
                  <div className="bar-col" key={s.month}>
                    <div className="bar-track">
                      <div className="bar in" style={{ height: `${(s.in / max) * 100}%` }} title={`In ${mask(s.in)}`} />
                      <div className="bar out" style={{ height: `${(s.out / max) * 100}%` }} title={`Out ${mask(s.out)}`} />
                    </div>
                    <div className="bar-label">{s.month.slice(5)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 12.5, color: 'var(--text-soft)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)', display: 'inline-block' }} /> Receipts
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)', display: 'inline-block' }} /> Payments
                </span>
              </div>
            </div>
          );
        },
      },
    ];
  }, [dash, report, navigate]);

  const ids = useMemo(() => registry.map((w) => w.id), [registry]);

  useEffect(() => {
    setConfig(loadConfig(ids));
    setReady(true);
  }, [ids]);

  const loadData = useCallback(async () => {
    try {
      const [d, r] = await Promise.all([api.dashboard(), api.accountsReport()]);
      setDash(d);
      setReport(r);
    } catch (e) {
      toast.err(e instanceof Error ? e.message : 'Failed to load dashboard');
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveConfig = (next: Config) => {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const visible = useMemo(() => {
    const byId = new Map(registry.map((w) => [w.id, w]));
    return config.order.filter((id) => !config.hidden.includes(id) && byId.has(id)).map((id) => byId.get(id)!);
  }, [config, registry]);

  const moveWidget = (from: string, to: string) => {
    const order = [...config.order];
    const fi = order.indexOf(from);
    const ti = order.indexOf(to);
    if (fi >= 0 && ti >= 0) {
      order.splice(fi, 1);
      order.splice(ti, 0, from);
      saveConfig({ ...config, order });
    }
    setDragId(null);
    setOverId(null);
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    moveWidget(dragId, targetId);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Live overview of inventory, finance and operations. Drag widget headers to rearrange, or hide what you do not need.</p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => void loadData()}>
            <LayoutGrid size={15} />
            Refresh
          </button>
          <button className="btn primary" onClick={() => setCustomizing(true)}>
            <Settings2 size={15} />
            Customize
          </button>
        </div>
      </div>

      {!ready && <div className="empty-state">Loading…</div>}

      <div className="widget-grid">
        {visible.map((w) => (
          <section
            key={w.id}
            className={`widget w-${w.span} ${dragId === w.id ? 'dragging' : ''} ${overId === w.id ? 'drop-target' : ''}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', w.id);
              setDragId(w.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (overId !== w.id) setOverId(w.id);
            }}
            onDragLeave={() => setOverId((o) => (o === w.id ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              onDrop(w.id);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
          >
            <div className="widget-head">
              <h3>{w.title}</h3>
              <span className="sub">{w.desc}</span>
            </div>
            <div className="widget-body">{w.render({ dash, report, nav: navigate })}</div>
          </section>
        ))}
      </div>

      <div className="footer-note">
        <span>Layout is saved to your browser (localStorage) — drag any widget header to reorder.</span>
        <span>ColourDiam ERP · v1.0</span>
      </div>

      {customizing && (
        <CustomizeModal
          registry={registry}
          config={config}
          onToggle={(id, on) =>
            saveConfig({
              ...config,
              hidden: on ? config.hidden.filter((h) => h !== id) : [...config.hidden, id],
            })
          }
          onReorder={moveWidget}
          onReset={() => saveConfig({ order: ids, hidden: [] })}
          onClose={() => setCustomizing(false)}
        />
      )}
    </>
  );
}

function CustomizeModal({
  registry,
  config,
  onToggle,
  onReorder,
  onReset,
  onClose,
}: {
  registry: WidgetDef[];
  config: Config;
  onToggle: (id: string, on: boolean) => void;
  onReorder: (from: string, to: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  return (
    <Modal title="Customize dashboard" onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>
          Drag to reorder. Toggle to show or hide widgets.
        </span>
        <button className="btn small" onClick={onReset}>
          <ResetIcon size={13} />
          Reset layout
        </button>
      </div>
      <div className="customize-list">
        {config.order.map((id) => {
          const w = registry.find((r) => r.id === id);
          if (!w) return null;
          const visible = !config.hidden.includes(id);
          return (
            <div
              key={id}
              className="customize-row"
              style={{
                borderRadius: 8,
                border: over === id ? '1px dashed var(--primary)' : '1px solid var(--border)',
                opacity: dragging === id ? 0.4 : 1,
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', id);
                setDragging(id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(id);
              }}
              onDragLeave={() => setOver((o) => (o === id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging && dragging !== id) onReorder(dragging, id);
                setDragging(null);
                setOver(null);
              }}
              onDragEnd={() => {
                setDragging(null);
                setOver(null);
              }}
            >
              <span className="drag-handle">⠿</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{w.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{w.desc}</div>
              </div>
              <button
                className={`switch ${visible ? 'on' : ''}`}
                onClick={() => onToggle(id, !visible)}
                aria-label={`Toggle ${w.title}`}
              />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-faint)' }}>
        Tip: press <kbd className="kbd">Ctrl K</kbd> anywhere to open the command palette.
      </div>
    </Modal>
  );
}
