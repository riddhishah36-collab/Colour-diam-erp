import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, type ModuleMeta, type Row } from './api';

interface AppCtx {
  meta: ModuleMeta[] | null;
  modules: Record<string, ModuleMeta>;
  counts: Record<string, number>;
  refreshMeta: () => Promise<void>;
  role: string;
  setRole: (name: string) => void;
  roles: Array<{ name: string; users: string; permissions: string[] }>;
  perms: Set<string>;
  can: (perm: string) => boolean;
  canEditModule: (key: string) => boolean;
  canViewModule: (key: string) => boolean;
  canViewCosts: boolean;
  maskMoney: (n: unknown) => string;
}

const Ctx = createContext<AppCtx | null>(null);

const ROLE_KEY = 'cds.currentRole';

function loadRole(): string {
  try {
    return localStorage.getItem(ROLE_KEY) || 'Sales Manager';
  } catch {
    return 'Sales Manager';
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = useState<ModuleMeta[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [roles, setRoles] = useState<Array<{ name: string; users: string; permissions: string[] }>>([]);
  const [role, setRoleState] = useState<string>(loadRole);

  const refreshMeta = useCallback(async () => {
    try {
      const res = await api.meta();
      setMeta(res.modules);
      const c: Record<string, number> = {};
      for (const m of res.modules) c[m.key] = m.count;
      setCounts(c);
    } catch {
      setMeta([]);
    }
  }, []);

  useEffect(() => {
    void refreshMeta();
    api
      .list('roles', { limit: '50' })
      .then((res) => {
        const list = (res.rows as Row[]).map((r) => ({
          name: String(r.name || ''),
          users: String(r.users || ''),
          permissions: Array.isArray(r.permissions)
            ? (r.permissions as string[])
            : String(r.permissions || '').split(',').map((s) => s.trim()).filter(Boolean),
        }));
        setRoles(list);
      })
      .catch(() => setRoles([]));
  }, [refreshMeta]);

  const modules = (meta || []).reduce<Record<string, ModuleMeta>>((acc, m) => {
    acc[m.key] = m;
    return acc;
  }, {});

  const setRole = useCallback((name: string) => {
    setRoleState(name);
    try {
      localStorage.setItem(ROLE_KEY, name);
    } catch {
      /* ignore */
    }
  }, []);

  const perms = useMemo(() => {
    const found = roles.find((r) => r.name === role);
    return new Set(found?.permissions || []);
  }, [roles, role]);

  const can = useCallback((perm: string) => perms.has(perm), [perms]);

  const canEditModule = useCallback(
    (key: string) => perms.has(`${key}.edit`),
    [perms],
  );

  const canViewModule = useCallback(
    (key: string) => perms.has(`${key}.view`) || perms.has(`${key}.edit`),
    [perms],
  );

  const canViewCosts = perms.has('costs.view');
  const maskMoney = useCallback(
    (n: unknown) => {
      if (!perms.has('costs.view')) return '•••';
      const v = Number(n ?? 0);
      if (!Number.isFinite(v)) return '—';
      return '$' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
    },
    [perms],
  );

  const value: AppCtx = {
    meta,
    modules,
    counts,
    refreshMeta,
    role,
    setRole,
    roles,
    perms,
    can,
    canEditModule,
    canViewModule,
    canViewCosts,
    maskMoney,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
