import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Diamonds from './pages/Diamonds';
import ModulePage from './pages/ModulePage';
import AccountsPage from './pages/AccountsPage';
import ReportsPage from './pages/ReportsPage';
import CustomersPage from './pages/CustomersPage';
import LeadsPage from './pages/LeadsPage';
import MessagesPage from './pages/MessagesPage';
import SalesPage from './pages/SalesPage';
import ActivityPage from './pages/ActivityPage';
import ApiExplorerPage from './pages/ApiExplorerPage';
import { useApp } from './AppContext';
import { SPECIAL_MODULES } from './nav';

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
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/api-explorer" element={<ApiExplorerPage />} />
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
