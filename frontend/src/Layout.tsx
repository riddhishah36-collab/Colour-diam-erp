import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  HelpCircle,
  Gem,
} from 'lucide-react';
import { useApp } from './AppContext';
import { buildNav, type NavGroup } from './nav';
import { CommandPalette } from './components/CommandPalette';

const SIDEBAR_KEY = 'cds.sidebar.collapsed';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { meta, counts } = useApp();
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
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const current = useMemo(() => {
    const all = nav.flatMap((g) => g.items);
    return (
      all.find((i) => i.path === location.pathname) ||
      all.find((i) => i.path !== '/' && location.pathname.startsWith(i.path)) || null
    );
  }, [nav, location.pathname]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <div
            className="brand-logo"
            style={{ background: 'linear-gradient(135deg,#4f6ef7,#8a5cf6)' }}
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
              {group.items.map((item) => (
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
              ))}
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
            <span>Search…</span>
            <span className="kbd">Ctrl K</span>
          </button>
          <span className="page-title">{current?.label || 'ColourDiam ERP'}</span>
          <div className="topbar-spacer" />
          <button className="icon-btn" title="Help">
            <HelpCircle size={17} />
          </button>
          <button className="icon-btn" title="Notifications" onClick={() => navigate('/tasks')}>
            <Bell size={17} />
          </button>
          <div className="user-chip">
            <div className="avatar">AK</div>
            <div>
              <div className="uname">Aarav Kapoor</div>
              <div className="urole">Sales Manager</div>
            </div>
          </div>
        </header>

        <main className="main-inner">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} nav={nav} />
    </div>
  );
}
