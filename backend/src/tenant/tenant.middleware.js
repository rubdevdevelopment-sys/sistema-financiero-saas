function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function getHeaderValue(req, headerName) {
  const rawValue = req.headers?.[headerName];

  if (Array.isArray(rawValue)) {
    return normalizeNullableString(rawValue[0]);
  }

  return normalizeNullableString(rawValue);
}

function resolveTenantFromAuthUser(req) {
  const companyId = normalizeNullableString(req.user?.companyId ?? req.user?.company_id);

  if (!companyId) {
    return null;
  }

  return {
    company_id: companyId,
    slug: normalizeNullableString(req.user?.company_slug),
    source: "auth"
  };
}

function resolveTenantFromRequestData(req) {
  const companyId = normalizeNullableString(
    req.query?.company_id ?? req.body?.company_id ?? req.params?.company_id
  );
  const slug = normalizeNullableString(req.params?.slug ?? req.query?.slug);

  if (!companyId && !slug) {
    return null;
  }

  return {
    company_id: companyId,
    slug,
    source: companyId ? "request_company_id" : "request_slug"
  };
}

function resolveTenantFromHeaders(req) {
  const companyId = getHeaderValue(req, "x-company-id");
  const slug = getHeaderValue(req, "x-tenant-slug");

  if (!companyId && !slug) {
    return null;
  }

  return {
    company_id: companyId,
    slug,
    source: companyId ? "header_company_id" : "header_slug"
  };
}

export function resolveTenantFromRequest(req) {
  return (
    resolveTenantFromAuthUser(req) ??
    resolveTenantFromRequestData(req) ??
    resolveTenantFromHeaders(req) ?? {
      company_id: null,
      slug: null,
      source: "unresolved"
    }
  );
}

export function attachTenantContext(req, tenantContext) {
  req.tenant = {
    company_id: normalizeNullableString(tenantContext?.company_id),
    slug: normalizeNullableString(tenantContext?.slug),
    source: normalizeNullableString(tenantContext?.source) ?? "unresolved"
  };

  return req.tenant;
}

export function tenantMiddleware(req, _res, next) {
  const tenantContext = resolveTenantFromRequest(req);
  attachTenantContext(req, tenantContext);
  return next();
}
