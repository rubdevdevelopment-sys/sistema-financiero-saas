import { createContext, useMemo, useState } from "react";

function buildDefaultTenantState(initialTenant = null) {
  const companyId = initialTenant?.companyId ?? initialTenant?.company_id ?? null;

  return {
    companyId,
    company_id: companyId,
    slug: initialTenant?.slug ?? null,
    source: initialTenant?.source ?? "foundation_default",
    ready: Boolean(companyId || initialTenant?.slug)
  };
}

const defaultTenantState = buildDefaultTenantState();

export const TenantContext = createContext({
  tenant: defaultTenantState,
  setTenant: () => {},
  resetTenant: () => {}
});

export function TenantProvider({ children, initialTenant = null }) {
  const [tenant, setTenantState] = useState(() => buildDefaultTenantState(initialTenant));

  function setTenant(nextTenant) {
    setTenantState(buildDefaultTenantState(nextTenant));
  }

  function resetTenant() {
    setTenantState(buildDefaultTenantState());
  }

  const value = useMemo(
    () => ({
      tenant,
      setTenant,
      resetTenant
    }),
    [tenant]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
