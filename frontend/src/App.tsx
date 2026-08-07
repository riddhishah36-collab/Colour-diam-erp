import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Diamonds from './pages/Diamonds';
import ModulePage from './pages/ModulePage';
import AccountsPage from './pages/AccountsPage';
import ReportsPage from './pages/ReportsPage';
import { useApp } from './AppContext';

const SPECIAL_MODULES = ['diamonds', 'accounts'];

export default function App() {
  const { modules } = useApp();
  const loaded = modules !== null;
  const knownKeys = new Set(Object.keys(modules || {}));
  const genericKeys = [...knownKeys].filter((k) => !SPECIAL_MODULES.includes(k));

  return (
    <Layout>
      {loaded ? (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/diamonds" element={<Diamonds />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          {genericKeys.map((k) => (
            <Route key={k} path={`/m/${k}`} element={<ModulePage />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <div className="empty-state">
          <div className="big">◇</div>
          Connecting to ColourDiam ERP…
        </div>
      )}
    </Layout>
  );
}
