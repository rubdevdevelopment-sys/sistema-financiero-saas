import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";

const FITNESS_DEMO_COMPANY_SLUG = "rubdev-demo-company";

export function useFitnessCompanyScope() {
  const { user } = useAuth();
  const { activeCompany, isSupportMode } = useActiveCompany();
  const isSuperAdmin = user?.role === "super_admin";

  const demoCompanyQuery = useQuery({
    queryKey: ["fitness-demo-company", user?.role],
    queryFn: async () => {
      const response = await api.get("/companies");
      const companies = Array.isArray(response.data?.data) ? response.data.data : [];

      return companies.find((company) => company.slug === FITNESS_DEMO_COMPANY_SLUG) ?? null;
    },
    enabled: Boolean(isSuperAdmin && !activeCompany?.id)
  });

  return useMemo(() => {
    if (activeCompany?.id) {
      return {
        companyId: activeCompany.id,
        company: activeCompany,
        isSupportMode,
        isDemoScope: activeCompany.slug === FITNESS_DEMO_COMPANY_SLUG,
        isLoading: false,
        source: isSupportMode ? "support_company" : "active_company"
      };
    }

    if (!isSuperAdmin && user?.company_id) {
      return {
        companyId: user.company_id,
        company: {
          id: user.company_id,
          name: user.company_name,
          slug: user.company_slug,
          business_model: user.business_model
        },
        isSupportMode: false,
        isDemoScope: user.company_slug === FITNESS_DEMO_COMPANY_SLUG,
        isLoading: false,
        source: "authenticated_user"
      };
    }

    if (demoCompanyQuery.data?.id) {
      return {
        companyId: demoCompanyQuery.data.id,
        company: demoCompanyQuery.data,
        isSupportMode: false,
        isDemoScope: demoCompanyQuery.data.slug === FITNESS_DEMO_COMPANY_SLUG,
        isLoading: false,
        source: "super_admin_demo_scope"
      };
    }

    return {
      companyId: null,
      company: null,
      isSupportMode: false,
      isDemoScope: false,
      isLoading: demoCompanyQuery.isLoading,
      source: "unresolved"
    };
  }, [
    activeCompany,
    demoCompanyQuery.data,
    demoCompanyQuery.isLoading,
    isSuperAdmin,
    isSupportMode,
    user?.business_model,
    user?.company_id,
    user?.company_name,
    user?.company_slug
  ]);
}

export default useFitnessCompanyScope;
