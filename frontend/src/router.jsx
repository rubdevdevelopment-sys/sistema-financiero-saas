import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage.jsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { DashboardPage } from "./pages/dashboard/DashboardPage.jsx";
import { IncomesPage } from "./pages/incomes/IncomesPage.jsx";
import { ExpensesPage } from "./pages/expenses/ExpensesPage.jsx";
import { CompaniesPage } from "./pages/admin/CompaniesPage.jsx";
import { UsersPage } from "./pages/admin/UsersPage.jsx";
import { SettingsPage } from "./pages/settings/SettingsPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
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
            element: <DashboardPage />
          },
          {
            path: "ingresos",
            element: <IncomesPage />
          },
          {
            path: "egresos",
            element: <ExpensesPage />
          },
          {
            path: "admin/empresas",
            element: <CompaniesPage />
          },
          {
            path: "admin/usuarios",
            element: <UsersPage />
          },
          {
            path: "configuracion",
            element: <SettingsPage />
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
]);
