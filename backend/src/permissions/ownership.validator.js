function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export function buildOwnershipValidationResult(options = {}) {
  return {
    valid: Boolean(options.valid),
    reason: normalizeNullableString(options.reason) ?? "unresolved",
    metadata: options.metadata ?? {}
  };
}

export function validateCompanyOwnership(entityCompanyId, userCompanyId) {
  const normalizedEntityCompanyId = normalizeNullableString(entityCompanyId);
  const normalizedUserCompanyId = normalizeNullableString(userCompanyId);

  if (!normalizedEntityCompanyId || !normalizedUserCompanyId) {
    return buildOwnershipValidationResult({
      valid: false,
      reason: "missing_company_context",
      metadata: {
        entityCompanyId: normalizedEntityCompanyId,
        userCompanyId: normalizedUserCompanyId
      }
    });
  }

  if (normalizedEntityCompanyId !== normalizedUserCompanyId) {
    return buildOwnershipValidationResult({
      valid: false,
      reason: "company_mismatch",
      metadata: {
        entityCompanyId: normalizedEntityCompanyId,
        userCompanyId: normalizedUserCompanyId
      }
    });
  }

  return buildOwnershipValidationResult({
    valid: true,
    reason: "ownership_valid",
    metadata: {
      entityCompanyId: normalizedEntityCompanyId,
      userCompanyId: normalizedUserCompanyId
    }
  });
}

export function validateTenantAccess(tenantContext, companyId) {
  const normalizedTenantCompanyId = normalizeNullableString(tenantContext?.company_id);
  const normalizedCompanyId = normalizeNullableString(companyId);

  if (!normalizedTenantCompanyId || !normalizedCompanyId) {
    return buildOwnershipValidationResult({
      valid: false,
      reason: "missing_tenant_context",
      metadata: {
        tenantCompanyId: normalizedTenantCompanyId,
        companyId: normalizedCompanyId,
        tenantSource: normalizeNullableString(tenantContext?.source)
      }
    });
  }

  if (normalizedTenantCompanyId !== normalizedCompanyId) {
    return buildOwnershipValidationResult({
      valid: false,
      reason: "tenant_access_denied",
      metadata: {
        tenantCompanyId: normalizedTenantCompanyId,
        companyId: normalizedCompanyId,
        tenantSource: normalizeNullableString(tenantContext?.source)
      }
    });
  }

  return buildOwnershipValidationResult({
    valid: true,
    reason: "tenant_access_valid",
    metadata: {
      tenantCompanyId: normalizedTenantCompanyId,
      companyId: normalizedCompanyId,
      tenantSource: normalizeNullableString(tenantContext?.source)
    }
  });
}
