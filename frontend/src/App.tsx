import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { getStoredUser } from "./api";
import type { User } from "./types";
import Login from "./pages/Login";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const DiamondsPage = lazy(() => import("./pages/DiamondsPage"));
const ResourcePage = lazy(() => import("./pages/ResourcePage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const Reports = lazy(() => import("./pages/Reports"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const Settings = lazy(() => import("./pages/Settings"));
const ActivityLog = lazy(() => import("./pages/ActivityLog"));
const StockPage = lazy(() => import("./pages/StockPage"));
const AccountsPage = lazy(() => import("./pages/AccountsPage"));
const MediaPage = lazy(() => import("./pages/MediaPage"));
const IntegrationsPage = lazy(() => import("./pages/IntegrationsPage"));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const user: User | null = getStoredUser();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function PageFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-gold-600" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route
          path="/"
          element={
            <Suspense fallback={<PageFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/inventory/diamonds"
          element={
            <Suspense fallback={<PageFallback />}>
              <DiamondsPage />
            </Suspense>
          }
        />
        <Route
          path="/inventory/diamonds/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="diamonds" detail />
            </Suspense>
          }
        />
        <Route
          path="/inventory/gemstones"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="gemstones" />
            </Suspense>
          }
        />
        <Route
          path="/inventory/gemstones/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="gemstones" detail />
            </Suspense>
          }
        />
        <Route
          path="/inventory/jewellery"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="jewellery" />
            </Suspense>
          }
        />
        <Route
          path="/inventory/jewellery/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="jewellery" detail />
            </Suspense>
          }
        />
        <Route
          path="/inventory/products"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="products" />
            </Suspense>
          }
        />
        <Route
          path="/inventory/products/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="products" detail />
            </Suspense>
          }
        />
        <Route
          path="/inventory/stock"
          element={
            <Suspense fallback={<PageFallback />}>
              <StockPage />
            </Suspense>
          }
        />
        <Route
          path="/crm/customers"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="customers" />
            </Suspense>
          }
        />
        <Route
          path="/crm/customers/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="customers" detail />
            </Suspense>
          }
        />
        <Route
          path="/crm/leads"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="leads" />
            </Suspense>
          }
        />
        <Route
          path="/crm/leads/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="leads" detail />
            </Suspense>
          }
        />
        <Route
          path="/crm/suppliers"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="suppliers" />
            </Suspense>
          }
        />
        <Route
          path="/crm/suppliers/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="suppliers" detail />
            </Suspense>
          }
        />
        <Route
          path="/sales/quotes"
          element={
            <Suspense fallback={<PageFallback />}>
              <OrdersPage />
            </Suspense>
          }
        />
        <Route
          path="/sales/quotes/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <OrdersPage detail />
            </Suspense>
          }
        />
        <Route
          path="/sales/orders"
          element={
            <Suspense fallback={<PageFallback />}>
              <OrdersPage />
            </Suspense>
          }
        />
        <Route
          path="/sales/orders/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <OrdersPage detail />
            </Suspense>
          }
        />
        <Route
          path="/sales/invoices"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="invoices" />
            </Suspense>
          }
        />
        <Route
          path="/sales/invoices/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="invoices" detail />
            </Suspense>
          }
        />
        <Route
          path="/sales/payments"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="payments" />
            </Suspense>
          }
        />
        <Route
          path="/sales/payments/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="payments" detail />
            </Suspense>
          }
        />
        <Route
          path="/sales/memos"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="memos" />
            </Suspense>
          }
        />
        <Route
          path="/sales/memos/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="memos" detail />
            </Suspense>
          }
        />
        <Route
          path="/sales/returns"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="returns" />
            </Suspense>
          }
        />
        <Route
          path="/sales/returns/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="returns" detail />
            </Suspense>
          }
        />
        <Route
          path="/sales/expenses"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="expenses" />
            </Suspense>
          }
        />
        <Route
          path="/sales/expenses/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="expenses" detail />
            </Suspense>
          }
        />
        <Route
          path="/finance/accounts"
          element={
            <Suspense fallback={<PageFallback />}>
              <AccountsPage />
            </Suspense>
          }
        />
        <Route
          path="/messages"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="messages" />
            </Suspense>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="messages" detail />
            </Suspense>
          }
        />
        <Route
          path="/tasks"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="tasks" />
            </Suspense>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="tasks" detail />
            </Suspense>
          }
        />
        <Route
          path="/documents"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="documents" />
            </Suspense>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <ResourcePage resource="documents" detail />
            </Suspense>
          }
        />
        <Route
          path="/media"
          element={
            <Suspense fallback={<PageFallback />}>
              <MediaPage />
            </Suspense>
          }
        />
        <Route
          path="/purchasing/orders"
          element={
            <Suspense fallback={<PageFallback />}>
              <OrdersPage />
            </Suspense>
          }
        />
        <Route
          path="/purchasing/orders/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <OrdersPage detail />
            </Suspense>
          }
        />
        <Route
          path="/reports"
          element={
            <Suspense fallback={<PageFallback />}>
              <Reports />
            </Suspense>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <Suspense fallback={<PageFallback />}>
              <ActivityLog />
            </Suspense>
          }
        />
        <Route
          path="/admin/integrations"
          element={
            <Suspense fallback={<PageFallback />}>
              <IntegrationsPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Suspense fallback={<PageFallback />}>
              <UsersPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <Suspense fallback={<PageFallback />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
