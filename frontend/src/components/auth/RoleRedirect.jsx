import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";

export function RoleRedirect() {
  const { user } = useAuth();
  const { activeCompany } = useActiveCompany();
  const businessModel = activeCompany?.business_model || user?.business_model || "standard";
  const defaultPath =
    businessModel === "cooperative_fund"
      ? "/fondos"
      : businessModel === "fitness"
        ? "/fitness"
        : "/dashboard";

  if (user?.role === "super_admin") {
    return (
      <Navigate
        to={activeCompany?.id ? defaultPath : "/super-admin"}
        replace
      />
    );
  }

  return <Navigate to={defaultPath} replace />;
}

export default RoleRedirect;
