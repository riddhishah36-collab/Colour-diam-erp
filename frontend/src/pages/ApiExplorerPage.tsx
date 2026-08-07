import { useEffect, useMemo, useState } from 'react';
import { Play, Download, RefreshCw } from 'lucide-react';
import { api, type ModuleMeta } from '../api';
import { useApp } from '../AppContext';
import { toast } from '../components/ui';

interface Endpoint {
  method: string;
  path: string;
  desc: string;
}

export default function ApiExplorerPage() {
  const { meta, counts } = useApp();
  const [modKey, setModKey] = useState<string>('diamonds');
  const [result, setResult] = useState<unknown>(null);
  const [running, setRunning] = useState(false);
  const [limit, setLimit] = useState('5');

  const mod: ModuleMeta | undefined = (meta || []).find((m) => m.key === modKey);

  useEffect(() => {
    if (!modKey && meta && meta.length) setModKey(meta[0].key);
  }, [meta, modKey]);

  const endpoints = useMemo(() => {
    const base: Endpoint[] = [
      { method: 'GET', path: '/api/meta', desc: 'Module registry & schemas' },
      { method: 'GET', path: '/api/dashboard/summary', desc: 'KPI dashboard aggregate' },
      { method: 'GET', path: '/api/reports/accounts', desc: 'Financial report' },
      { method: 'GET', path: '/api/notifications', desc: 'Derived notifications' },
      { method: 'GET', path: '/api/activity', desc: 'Full activity feed' },
      { method: 'GET', path: '/api/health', desc: 'Liveness probe' },
      { method: 'POST', path: '/api/system/reset', desc: 'Reseed the database' },
    ];
    if (mod) {
      base.push(
        { method: 'GET', path: `/api/${mod.key}`, desc: 'List rows (search ?q=, sort, limit)' },
        { method: 'GET', path: `/api/${mod.key}/:id`, desc: 'Get one row' },
        { method: 'POST', path: `/api/${mod.key}`, desc: 'Create a row' },
        { method: 'PUT', path: `/api/${mod.key}/:id`, desc: 'Update a row' },
        { method: 'DELETE', path: `/api/${mod.key}/:id`, desc: 'Delete a row' },
        { method: 'GET', path: `/api/${mod.key}/export/csv`, desc: 'CSV export' },
      );
    }
    return base;
  }, [mod]);

  const run = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await api.list(modKey, { limit });
      setResult(res);
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Request failed' });
    } finally {
      setRunning(false);
    }
  };

  const runEndpoint = async (ep: Endpoint) => {
    if (!ep.path.startsWith('/api') || ep.method !== 'GET') {
      toast.ok(`${ep.method} ${ep.path} — use cURL for this endpoint`);
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const path = ep.path.replace('/api/', '');
      if (path.startsWith('dashboard')) setResult(await api.dashboard());
      else if (path.startsWith('reports/accounts')) setResult(await api.accountsReport());
      else if (path.startsWith('notifications')) setResult(await api.notifications());
      else if (path.startsWith('activity')) setResult(await api.activity());
      else if (path.startsWith('health')) setResult(await fetch('/api/health').then((r) => r.json()));
      else if (path.startsWith('meta')) setResult(await api.meta());
      else if (path.includes('export/csv')) setResult({ note: 'CSV download', url: `/api/${modKey}/export/csv` });
      else setResult(await api.list(modKey, { limit }));
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Request failed' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>API Explorer</h1>
          <p>Browse the ColourDiam REST surface and test endpoints live.</p>
        </div>
      </div>

      <div className="api-explorer">
        <aside className="card api-side">
          <div className="card-head"><h3>Modules</h3></div>
          <div className="api-mod-list">
            {(meta || []).map((m) => (
              <button
                key={m.key}
                className={`api-mod ${modKey === m.key ? 'on' : ''}`}
                onClick={() => setModKey(m.key)}
              >
                <span>{m.name}</span>
                <span className="api-count">{counts[m.key] ?? 0}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="api-main">
          <section className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
              <h3>Endpoints</h3>
              <span className="sub">full API surface</span>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Method</th><th>Path</th><th>Description</th><th></th></tr>
                </thead>
                <tbody>
                  {endpoints.map((ep) => (
                    <tr key={`${ep.method}-${ep.path}`}>
                      <td><span className={`method method-${ep.method.toLowerCase()}`}>{ep.method}</span></td>
                      <td className="mono">{ep.path}</td>
                      <td>{ep.desc}</td>
                      <td>
                        <button className="icon-btn" title="Run" onClick={() => void runEndpoint(ep)}>
                          <Play size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h3>Live tester</h3>
              <span className="sub">GET /api/{modKey}?limit={limit}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  style={{ width: 80, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6 }}
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
                <button className="btn small" onClick={() => void run()}>
                  <RefreshCw size={13} /> Reset
                </button>
                <a className="btn small" href={`/api/${modKey}/export/csv`}>
                  <Download size={13} /> CSV
                </a>
                <button className="btn small primary" onClick={() => void run()} disabled={running}>
                  <Play size={13} /> {running ? 'Running…' : 'Run'}
                </button>
              </div>
            </div>
            <pre className="api-result">
              {result === null
                ? `// Hit "Run" to call GET /api/${modKey}?limit=${limit}\n// Schema fields:\n${JSON.stringify(mod?.fields?.map((f) => f.key) || [], null, 2)}`
                : JSON.stringify(result, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </>
  );
}
