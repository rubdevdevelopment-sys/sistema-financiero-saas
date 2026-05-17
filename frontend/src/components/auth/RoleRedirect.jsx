import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";

export function RoleRedirect() {
  const { user } = useAuth();
  const { activeCompany } = useActiveCompany();

  if (user?.role === "super_admin") {
    return (
      <Navigate
        to={activeCompany?.id ? "/dashboard" : "/super-admin"}
        replace
      />
    );
  }

  return <Navigate to="/dashboard" replace />;
}

export default RoleRedirect;
