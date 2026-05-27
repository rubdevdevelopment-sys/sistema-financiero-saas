import { query } from "../../config/db.js";
import { buildFoundationCacheKey, getOrSetCachedValue } from "../cache/foundation-cache.service.js";
import { resolveTenantFromRequest } from "../../tenant/tenant.middleware.js";
import {
  buildOwnershipValidationResult,
  validateTenantAccess
} from "../../permissions/ownership.validator.js";

const TENANT_CONTEXT_TTL_MS = 60 * 1000;

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function buildCompanySnapshot(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    business_model: row.business_model ?? null,
    currency: row.currency ?? null,
    timezone: row.timezone ?? null,
    active: typeof row.active === "boolean" ? row.active : null
  };
}

export function buildDefaultTenantContext(options = {}) {
  return {
    company_id: normalizeNullableString(options.company_id),
    slug: normalizeNullableString(options.slug),
    source: normalizeNullableString(options.source) ?? "unresolved",
    company: options.company ?? null,
    access:
      options.access ??
      buildOwnershipValidationResult({
        valid: false,
        reason: "tenant_unresolved",
        metadata: {}
      })
  };
}

export async function getTenantCompanySnapshot(options = {}) {
  const companyId = normalizeNullableString(options.companyId ?? options.company_id);
  const slug = normalizeNullableString(options.slug);

  if (!companyId && !slug) {
    return null;
  }

  const cacheKey = buildFoundationCacheKey(
    "foundation",
    "tenant-company",
    companyId ?? "slug",
    companyId ?? slug
  );

  return getOrSetCachedValue(
    cacheKey,
    async () => {
      const sql = companyId
        ? `
          select id, name, slug, business_model, currency, timezone, active
          from companies
          where id = $1
          limit 1
        `
        : `
          select id, name, slug, business_model, currency, timezone, active
          from companies
          where slug = $1 or public_slug = $1
          limit 1
        `;
      const params = [companyId ?? slug];
      const { rows } = await query(sql, params);
      return buildCompanySnapshot(rows[0]);
    },
    { ttlMs: TENANT_CONTEXT_TTL_MS }
  );
}

export async function getTenantContextFromRequest(req) {
  if (!req) {
    return buildDefaultTenantContext();
  }

  const resolvedTenant = resolveTenantFromRequest(req);

  try {
    const company = await getTenantCompanySnapshot({
      companyId: resolvedTenant.company_id,
      slug: resolvedTenant.slug
    });

    const access =
      resolvedTenant.company_id && company?.id
        ? validateTenantAccess(resolvedTenant, company.id)
        : buildOwnershipValidationResult({
            valid: Boolean(company?.id),
            reason: company?.id ? "tenant_company_resolved" : "tenant_company_unresolved",
            metadata: {
              requestedCompanyId: resolvedTenant.company_id,
              requestedSlug: resolvedTenant.slug,
              source: resolvedTenant.source
            }
          });

    return buildDefaultTenantContext({
      company_id: company?.id ?? resolvedTenant.company_id,
      slug: company?.slug ?? resolvedTenant.slug,
      source: resolvedTenant.source,
      company,
      access
    });
  } catch (_error) {
    return buildDefaultTenantContext({
      company_id: resolvedTenant.company_id,
      slug: resolvedTenant.slug,
      source: resolvedTenant.source,
      access: buildOwnershipValidationResult({
        valid: false,
        reason: "tenant_context_error",
        metadata: {
          requestedCompanyId: resolvedTenant.company_id,
          requestedSlug: resolvedTenant.slug,
          source: resolvedTenant.source
        }
      })
    });
  }
}
