import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ActiveCompanyProvider } from "../../context/ActiveCompanyContext.jsx";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero">
        <div className="panel px-8 py-6 text-sm text-slate-200">Cargando sesion...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <ActiveCompanyProvider>
      <Outlet />
    </ActiveCompanyProvider>
  );
}
