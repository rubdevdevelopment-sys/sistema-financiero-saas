import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "./components/auth/ProtectedRoute.jsx";
import { RoleRedirect } from "./components/auth/RoleRedirect.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { SuperAdminLayout } from "./components/layout/SuperAdminLayout.jsx";

const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage.jsx"));
const ParticipantsPage = lazy(() => import("./pages/participants/ParticipantsPage.jsx"));
const IncomesPage = lazy(() => import("./pages/incomes/IncomesPage.jsx"));
const ExpensesPage = lazy(() => import("./pages/expenses/ExpensesPage.jsx"));
const FundDashboard = lazy(() => import("./pages/funds/FundDashboard.jsx"));
const FundCyclesPage = lazy(() => import("./pages/funds/FundCyclesPage.jsx"));
const FundMembersPage = lazy(() => import("./pages/funds/FundMembersPage.jsx"));
const FundQuotasPage = lazy(() => import("./pages/funds/FundQuotasPage.jsx"));
const FundLoansPage = lazy(() => import("./pages/funds/FundLoansPage.jsx"));
const FundPenaltiesPage = lazy(() => import("./pages/funds/FundPenaltiesPage.jsx"));
const FundModulePage = lazy(() => import("./pages/funds/FundModulePage.jsx"));
const CompaniesPage = lazy(() => import("./pages/admin/CompaniesPage.jsx"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage.jsx"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage.jsx"));
const SuperAdminDashboard = lazy(() => import("./pages/super-admin/SuperAdminDashboard.jsx"));
const CompanySelector = lazy(() => import("./pages/super-admin/CompanySelector.jsx"));
const PlatformSettings = lazy(() => import("./pages/super-admin/PlatformSettings.jsx"));
const BrandingSettings = lazy(() => import("./pages/super-admin/BrandingSettings.jsx"));
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
        element: <SuperAdminLayout />,
        children: [
          {
            path: "super-admin",
            element: withSuspense(<SuperAdminDashboard />)
          },
          {
            path: "super-admin/empresas",
            element: withSuspense(<CompaniesPage />)
          },
          {
            path: "super-admin/soporte",
            element: withSuspense(<CompanySelector />)
          },
          {
            path: "super-admin/usuarios",
            element: withSuspense(<UsersPage />)
          },
          {
            path: "super-admin/configuracion",
            element: withSuspense(<PlatformSettings />)
          },
          {
            path: "super-admin/branding",
            element: withSuspense(<BrandingSettings />)
          }
        ]
      },
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <RoleRedirect />
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
            path: "fondos",
            element: withSuspense(<FundDashboard />)
          },
          {
            path: "fondos/ciclos",
            element: withSuspense(<FundCyclesPage />)
          },
          {
            path: "fondos/miembros",
            element: withSuspense(<FundMembersPage />)
          },
          {
            path: "fondos/cupos",
            element: withSuspense(<FundQuotasPage />)
          },
          {
            path: "fondos/prestamos",
            element: withSuspense(<FundLoansPage />)
          },
          {
            path: "fondos/multas",
            element: withSuspense(<FundPenaltiesPage />)
          },
          {
            path: "fondos/cierre",
            element: withSuspense(<FundModulePage type="settlement" />)
          },
          {
            path: "fondos/reparto",
            element: withSuspense(<FundModulePage type="distributions" />)
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
