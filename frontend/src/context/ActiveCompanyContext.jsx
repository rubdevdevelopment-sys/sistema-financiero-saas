import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const ActiveCompanyContext = createContext(null);
const STORAGE_KEY = "finanzas_active_company";

export function ActiveCompanyProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [supportCompany, setSupportCompany] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "super_admin") {
      localStorage.removeItem(STORAGE_KEY);
      setSupportCompany(null);
    }
  }, [isAuthenticated, user?.role]);

  function enterCompanySupport(company, reason = "Soporte tecnico") {
    const session = {
      id: crypto.randomUUID(),
      reason,
      started_at: new Date().toISOString()
    };

    const nextCompany = {
      id: company.id,
      name: company.name,
      slug: company.slug,
      session
    };

    setSupportCompany(nextCompany);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCompany));
    return nextCompany;
  }

  function exitCompanySupport() {
    setSupportCompany(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const activeCompany = useMemo(() => {
    if (user?.role === "super_admin") {
      return supportCompany;
    }

    if (!user?.company_id) {
      return null;
    }

    return {
      id: user.company_id,
      name: user.company_name,
      slug: user.company_slug
    };
  }, [supportCompany, user]);

  const value = {
    activeCompany,
    supportCompany,
    isSupportMode: Boolean(user?.role === "super_admin" && supportCompany?.id),
    enterCompanySupport,
    exitCompanySupport
  };

  return (
    <ActiveCompanyContext.Provider value={value}>
      {children}
    </ActiveCompanyContext.Provider>
  );
}

export function useActiveCompany() {
  const context = useContext(ActiveCompanyContext);
  if (!context) {
    throw new Error("useActiveCompany debe usarse dentro de ActiveCompanyProvider");
  }
  return context;
}
