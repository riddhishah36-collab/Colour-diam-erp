import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api, clearSession, getStoredUser, fmtDate } from "../api";
import type { Activity, User } from "../types";
import { Avatar, cn, Toast, useToast, statusTone, Badge } from "./ui";
import CommandPalette from "./CommandPalette";
import { NAV, Icons, pageMeta } from "../nav";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user: User | null = getStoredUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("cd_erp_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const { toast, show } = useToast();

  const meta = pageMeta(location.pathname);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem("cd_erp_sidebar_collapsed", collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const loadActivities = useCallback(async () => {
    try {
      const res = await api.get<{ data: Activity[] }>("/api/activities?limit=8");
      setActivities(res.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities, location.pathname]);

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="flex h-full bg-ivory">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-ink-200 bg-white transition-all duration-200 lg:static lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={cn("flex items-center gap-3 px-4 py-5", collapsed ? "justify-center" : "")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-gold-200">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l3 5-9 13L3 8l3-5zM3 8h18M9 3l3 5 3-5" />
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold leading-none tracking-wide text-ink-950">Colour Diam</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-ink-400">Enterprise Suite</p>
            </div>
          )}
        </div>

        <nav className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {NAV.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">{group.section}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center",
                        isActive ? "bg-gold-100/80 text-gold-800" : "text-ink-600 hover:bg-ink-50 hover:text-ink-950"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={cn("shrink-0", isActive ? "text-gold-700" : "text-ink-400 group-hover:text-ink-600")}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-500" />}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-ink-100 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-800",
              collapsed && "justify-center"
            )}
          >
            <span className="shrink-0 text-ink-400">
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </span>
            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-ink-200 bg-white/80 px-4 backdrop-blur sm:px-6">
          <button type="button" className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden" onClick={() => setMobileOpen(true)}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-semibold leading-tight text-ink-950">{meta.title}</h1>
            <p className="hidden truncate text-xs text-ink-500 sm:block">{meta.sub}</p>
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-500 ring-1 ring-ink-200 transition-colors hover:bg-ink-100 sm:w-64"
            >
              <span className="text-ink-400">{Icons.search}</span>
              <span className="hidden flex-1 text-left sm:block">Search everything…</span>
              <kbd className="hidden rounded border border-ink-200 bg-white px-1 text-[10px] text-ink-400 lg:block">⌘K</kbd>
            </button>

            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  loadActivities();
                }}
                className="relative rounded-xl p-2 text-ink-500 hover:bg-ink-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-500 ring-2 ring-white" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-ink-100">
                  <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                    <p className="text-sm font-semibold text-ink-900">Recent activity</p>
                    <button type="button" onClick={() => navigate("/admin/activity")} className="text-xs font-medium text-gold-700 hover:text-gold-800">
                      View all
                    </button>
                  </div>
                  <div className="scrollbar-thin max-h-80 overflow-y-auto">
                    {activities.length === 0 ? (
                      <p className="px-4 py-8 text-center text-xs text-ink-400">No activity yet</p>
                    ) : (
                      activities.map((a) => (
                        <div key={a.id} className="flex gap-3 border-b border-ink-50 px-4 py-3">
                          <Avatar name={a.userName || "System"} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs leading-relaxed text-ink-700">{a.message}</p>
                            <p className="mt-0.5 text-[11px] text-ink-400">
                              {a.userName} · {fmtDate(a.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={userRef} className="relative">
              <button type="button" onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-xl p-1 hover:bg-ink-100">
                <Avatar name={user?.name || "User"} size="sm" />
                <span className="hidden text-sm font-medium text-ink-700 md:block">{user?.name?.split(" ")[0]}</span>
                <svg className="hidden h-4 w-4 text-ink-400 md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-ink-100">
                  <div className="border-b border-ink-100 px-4 py-3">
                    <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
                    <p className="truncate text-xs text-ink-500">{user?.email}</p>
                    <Badge label={String(user?.role || "")} tone={user?.role === "admin" ? "purple" : user?.role === "manager" ? "gold" : "blue"} />
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/admin/settings");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet context={{ show }} />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Toast toast={toast} />
    </div>
  );
}

export interface AppContext {
  show: (m: string, t?: "ok" | "err") => void;
}
