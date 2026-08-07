import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  HelpCircle,
  Gem,
  Plus,
  Home,
  TrendingUp,
  Mail,
  ShoppingCart,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useApp } from './AppContext';
import { buildNav, type NavGroup } from './nav';
import { CommandPalette } from './components/CommandPalette';
import { api, type AppNotification } from './api';

const SIDEBAR_KEY = 'cds.sidebar.collapsed';

const QUICK_ACTIONS = [
  { label: 'New Diamond', hint: 'Stock entry', path: '/diamonds?new=1' },
  { label: 'New Customer', hint: 'CRM contact', path: '/customers?new=1' },
  { label: 'New Lead', hint: 'Opportunity', path: '/leads?new=1' },
  { label: 'New Invoice', hint: 'Billing', path: '/sales?tab=invoices&new=1' },
  { label: 'New Quotation', hint: 'Quote', path: '/sales?tab=quotations&new=1' },
  { label: 'Record Payment', hint: 'Money in', path: '/sales?tab=payments&new=1' },
  { label: 'New Memo', hint: 'Consignment', path: '/m/memos?new=1' },
  { label: 'New Task', hint: 'To-do', path: '/m/tasks?new=1' },
  { label: 'Log Expense', hint: 'Money out', path: '/m/expenses?new=1' },
];

const NOTIF_PATH: Record<string, string> = {
  overdue: '/accounts',
  memo: '/m/memos',
  message: '/messages',
  task: '/m/tasks',
  lead: '/leads',
  return: '/m/returns',
};

const KIND_LABEL: Record<string, string> = {
  overdue: 'Overdue',
  memo: 'Memo',
  message: 'Message',
  task: 'Task',
  lead: 'Lead',
  return: 'Return',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { meta, counts, roles, role, setRole, canViewModule } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [seenNotifs, setSeenNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const nav = useMemo(() => buildNav(meta || []), [meta]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setQuickOpen(false);
        setRoleOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    api.notifications().then((r) => setNotifs(r.notifications)).catch(() => setNotifs([]));
  }, []);

  const loadNotifs = () => {
    api.notifications().then((r) => setNotifs(r.notifications)).catch(() => setNotifs([]));
    setNotifOpen((o) => {
      if (!o) setSeenNotifs(true);
      return !o;
    });
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const current = useMemo(() => {
    const all = nav.flatMap((g) => g.items);
    return (
      all.find((i) => i.path === location.pathname) ||
      all.find((i) => i.path !== '/' && location.pathname.startsWith(i.path)) || null
    );
  }, [nav, location.pathname]);

  const unreadNotifs = notifs.filter((n) => n.severity === 'high').length;

  const bottomNav = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Diamonds', path: '/diamonds', icon: Gem },
    { label: 'Leads', path: '/leads', icon: TrendingUp },
    { label: 'Messages', path: '/messages', icon: Mail },
    { label: 'Sales', path: '/sales', icon: ShoppingCart },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div
            className="brand-logo"
            style={{ background: 'linear-gradient(135deg,#c9a227,#8f6f18)' }}
            onClick={() => navigate('/')}
            role="button"
          >
            <Gem size={18} />
          </div>
          {!collapsed && (
            <div>
              <div className="brand-name">ColourDiam</div>
              <div className="brand-sub">ERP Suite</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {nav.map((group: NavGroup) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-title">{group.title}</div>
              {group.items.map((item) => {
                const show =
                  !item.module ||
                  (item.module ? canViewModule(item.module) : true);
                if (!show) return null;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={17} />
                    <span className="nav-label">{item.label}</span>
                    {item.module && counts[item.module] !== undefined && (
                      <span className="nav-count">{counts[item.module]}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="collapse-btn" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="search-trigger" onClick={() => setPaletteOpen(true)}>
            <Search size={15} />
            <span>Search pages, records…</span>
            <span className="kbd">Ctrl K</span>
          </button>
          <span className="page-title">{current?.label || 'ColourDiam ERP'}</span>
          <div className="topbar-spacer" />

          <div className="dropdown" ref={quickRef}>
            <button className="btn primary quick-btn" onClick={() => setQuickOpen((o) => !o)}>
              <Plus size={15} />
              <span className="quick-label">Quick</span>
              <ChevronDown size={13} />
            </button>
            {quickOpen && (
              <div className="dropdown-panel quick-panel">
                <div className="dropdown-title">Quick actions</div>
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.path}
                    className="dropdown-item"
                    onClick={() => {
                      setQuickOpen(false);
                      navigate(a.path);
                    }}
                  >
                    <span className="di-label">{a.label}</span>
                    <span className="di-hint">{a.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="icon-btn" title="Help">
            <HelpCircle size={17} />
          </button>

          <div className="dropdown" ref={notifRef}>
            <button className="icon-btn notif-btn" title="Notifications" onClick={loadNotifs}>
              <Bell size={17} />
              {!seenNotifs && notifs.length > 0 && (
                <span className="notif-dot">{unreadNotifs || notifs.length}</span>
              )}
            </button>
            {notifOpen && (
              <div className="dropdown-panel notif-panel">
                <div className="dropdown-title">
                  Notifications
                  <button className="btn small ghost" onClick={loadNotifs}>
                    Refresh
                  </button>
                </div>
                <div className="notif-list">
                  {notifs.length === 0 && (
                    <div className="empty-state" style={{ padding: 24 }}>
                      You&rsquo;re all caught up.
                    </div>
                  )}
                  {notifs.map((n, i) => (
                    <button
                      key={i}
                      className="notif-item"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(NOTIF_PATH[n.kind] || '/');
                      }}
                    >
                      <span className={`notif-kind k-${n.severity}`}>{KIND_LABEL[n.kind] || n.kind}</span>
                      <div>
                        <div className="ni-text">{n.text}</div>
                        <div className="ni-meta">
                          {n.meta}
                          {n.date ? ` · ${String(n.date).slice(0, 10)}` : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="dropdown" ref={roleRef}>
            <div className="user-chip" onClick={() => setRoleOpen((o) => !o)} role="button">
              <div className="avatar">AK</div>
              <div>
                <div className="uname">Aarav Kapoor</div>
                <div className="urole">{role}</div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-faint)' }} />
            </div>
            {roleOpen && (
              <div className="dropdown-panel role-panel">
                <div className="dropdown-title">Simulate role</div>
                <div className="role-hint">Permissions &amp; cost visibility follow this role.</div>
                {roles.map((r) => (
                  <button
                    key={r.name}
                    className={`dropdown-item role-item ${role === r.name ? 'sel' : ''}`}
                    onClick={() => {
                      setRole(r.name);
                      setRoleOpen(false);
                    }}
                  >
                    {role === r.name && <Check size={14} />}
                    <span>
                      <span className="di-label">{r.name}</span>
                      {r.users ? <span className="di-hint">{r.users}</span> : null}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className="main-inner">{children}</main>
      </div>

      <nav className="bottom-nav">
        {bottomNav.map((b) => (
          <NavLink
            key={b.path}
            to={b.path}
            className={({ isActive }) => `bn-item ${isActive ? 'on' : ''}`}
          >
            <b.icon size={19} />
            <span>{b.label}</span>
          </NavLink>
        ))}
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} nav={nav} />
    </div>
  );
}
