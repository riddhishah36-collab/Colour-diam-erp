import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, type ModuleMeta } from './api';

interface AppCtx {
  meta: ModuleMeta[] | null;
  modules: Record<string, ModuleMeta>;
  counts: Record<string, number>;
  refreshMeta: () => Promise<void>;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = useState<ModuleMeta[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

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
  }, [refreshMeta]);

  const modules = (meta || []).reduce<Record<string, ModuleMeta>>((acc, m) => {
    acc[m.key] = m;
    return acc;
  }, {});

  return (
    <Ctx.Provider value={{ meta, modules, counts, refreshMeta }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
