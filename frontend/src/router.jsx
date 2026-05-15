import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/auth/ProtectedRoute.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";

const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const ParticipantsPage = lazy(() => import("./pages/participants/ParticipantsPage.jsx"));
const IncomesPage = lazy(() => import("./pages/incomes/IncomesPage.jsx"));
const ExpensesPage = lazy(() => import("./pages/expenses/ExpensesPage.jsx"));
const CompaniesPage = lazy(() => import("./pages/admin/CompaniesPage.jsx"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage.jsx"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

function withSuspense(node) {
  return (
    <Suspense
      fallback={
        <div className="panel-soft p-6 text-sm text-slate-500">
          Cargando módulo...
        </div>
      }
    >
      {node}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withSuspense(<LoginPage />)
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: "dashboard",
            element: withSuspense(<DashboardPage />)
          },
          {
            path: "participantes",
            element: withSuspense(<ParticipantsPage />)
          },
          {
            path: "ingresos",
            element: withSuspense(<IncomesPage />)
          },
          {
            path: "egresos",
            element: withSuspense(<ExpensesPage />)
          },
          {
            path: "admin/empresas",
            element: withSuspense(<CompaniesPage />)
          },
          {
            path: "admin/usuarios",
            element: withSuspense(<UsersPage />)
          },
          {
            path: "configuracion",
            element: withSuspense(<SettingsPage />)
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: withSuspense(<NotFoundPage />)
  }
]);