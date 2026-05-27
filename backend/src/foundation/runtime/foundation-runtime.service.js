import { query } from "../../config/db.js";
import {
  buildFoundationCacheKey,
  getOrSetCachedValue
} from "../cache/foundation-cache.service.js";
import {
  buildDefaultTenantContext,
  getTenantContextFromRequest
} from "../context/tenant-context.service.js";
import {
  buildDefaultSettingsFallback,
  getCompanySettingsWithFallback
} from "../../settings/settings.service.js";
import {
  buildDefaultBrandingFallback,
  getCompanyBrandingWithFallback
} from "../../branding/branding.service.js";
import {
  buildDefaultFeaturesFallback,
  getCompanyFeaturesByEnvironment
} from "../../features/features.service.js";

const FOUNDATION_RUNTIME_TTL_MS = 60 * 1000;

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function buildCompanyRuntimeSnapshot(row) {
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

async function getCompanyRuntimeBase(companyId) {
  const normalizedCompanyId = normalizeNullableString(companyId);

  if (!normalizedCompanyId) {
    return null;
  }

  const { rows } = await query(
    `
      select id, name, slug, business_model, currency, timezone, active
      from companies
      where id = $1
      limit 1
    `,
    [normalizedCompanyId]
  );

  return buildCompanyRuntimeSnapshot(rows[0]);
}

async function safeGetSettings(company) {
  try {
    return (await getCompanySettingsWithFallback(company?.id)) ?? buildDefaultSettingsFallback(company);
  } catch (_error) {
    return buildDefaultSettingsFallback(company);
  }
}

async function safeGetBranding(companyId) {
  try {
    const branding = await getCompanyBrandingWithFallback(companyId);
    return branding ?? { ...buildDefaultBrandingFallback(), company_id: companyId ?? null };
  } catch (_error) {
    return { ...buildDefaultBrandingFallback(), company_id: companyId ?? null };
  }
}

async function safeGetFeatures(companyId, environment) {
  try {
    return companyId
      ? await getCompanyFeaturesByEnvironment(companyId, environment)
      : buildDefaultFeaturesFallback();
  } catch (_error) {
    return buildDefaultFeaturesFallback();
  }
}

export function buildDefaultFoundationRuntime(options = {}) {
  const company = options.company ?? null;
  const tenant =
    options.tenant ??
    buildDefaultTenantContext({
      company_id: company?.id ?? null,
      slug: company?.slug ?? null,
      source: options.source ?? "foundation_default",
      company
    });

  return {
    ready: false,
    source: normalizeNullableString(options.source) ?? "foundation_default",
    environment: normalizeNullableString(options.environment),
    tenant,
    company,
    settings: buildDefaultSettingsFallback(company),
    branding: {
      ...buildDefaultBrandingFallback(),
      company_id: company?.id ?? null
    },
    features: buildDefaultFeaturesFallback()
  };
}

export async function getFoundationRuntimeSnapshot(options = {}) {
  const normalizedCompanyId = normalizeNullableString(options.companyId);
  const normalizedEnvironment = normalizeNullableString(options.environment);
  const fallbackTenant =
    options.tenant ??
    buildDefaultTenantContext({
      company_id: normalizedCompanyId,
      source: options.source ?? "runtime_snapshot"
    });

  if (!normalizedCompanyId) {
    return buildDefaultFoundationRuntime({
      tenant: fallbackTenant,
      environment: normalizedEnvironment,
      source: options.source
    });
  }

  const cacheKey = buildFoundationCacheKey(
    "foundation",
    "runtime",
    normalizedCompanyId,
    normalizedEnvironment ?? "global"
  );

  return getOrSetCachedValue(
    cacheKey,
    async () => {
      const company = options.company ?? (await getCompanyRuntimeBase(normalizedCompanyId));

      if (!company) {
        return buildDefaultFoundationRuntime({
          tenant: fallbackTenant,
          environment: normalizedEnvironment,
          source: options.source
        });
      }

      const tenant = buildDefaultTenantContext({
        company_id: company.id,
        slug: company.slug,
        source: fallbackTenant.source,
        company,
        access: fallbackTenant.access
      });

      const [settings, branding, features] = await Promise.all([
        safeGetSettings(company),
        safeGetBranding(company.id),
        safeGetFeatures(company.id, normalizedEnvironment)
      ]);

      return {
        ready: true,
        source: normalizeNullableString(options.source) ?? "runtime_snapshot",
        environment: normalizedEnvironment,
        tenant,
        company,
        settings,
        branding: {
          ...branding,
          company_id: branding.company_id ?? company.id
        },
        features
      };
    },
    { ttlMs: FOUNDATION_RUNTIME_TTL_MS }
  );
}

export async function getFoundationRuntimeFromRequest(req, options = {}) {
  const tenant = await getTenantContextFromRequest(req);

  return getFoundationRuntimeSnapshot({
    companyId: options.companyId ?? tenant.company_id,
    environment: options.environment,
    source: options.source ?? "request",
    tenant
  });
}
