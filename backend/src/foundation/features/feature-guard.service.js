import {
  buildDefaultFeaturesFallback,
  getCompanyFeatures,
  getCompanyFeaturesByEnvironment
} from "../../features/features.service.js";
import { buildFoundationCacheKey, getOrSetCachedValue } from "../cache/foundation-cache.service.js";

const FEATURE_GUARD_TTL_MS = 60 * 1000;

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function normalizeFeatureGuardState(featureKey, enabled, reason, metadata = {}) {
  return {
    feature_key: normalizeNullableString(featureKey),
    enabled: Boolean(enabled),
    reason: normalizeNullableString(reason) ?? "feature_unresolved",
    metadata
  };
}

function selectFeature(rows, featureKey, environment) {
  return (
    rows.find((row) => row.feature_key === featureKey && row.environment === environment) ??
    rows.find((row) => row.feature_key === featureKey)
  );
}

export function buildFeatureGuardFallback(featureKey = null, options = {}) {
  return normalizeFeatureGuardState(
    featureKey,
    false,
    options.reason ?? "feature_unavailable",
    options.metadata ?? {}
  );
}

export async function getFeatureGuardState(companyId, featureKey, options = {}) {
  const normalizedCompanyId = normalizeNullableString(companyId);
  const normalizedFeatureKey = normalizeNullableString(featureKey);
  const normalizedEnvironment = normalizeNullableString(options.environment);

  if (!normalizedCompanyId || !normalizedFeatureKey) {
    return buildFeatureGuardFallback(normalizedFeatureKey, {
      reason: "missing_feature_context",
      metadata: {
        companyId: normalizedCompanyId,
        environment: normalizedEnvironment
      }
    });
  }

  const cacheKey = buildFoundationCacheKey(
    "foundation",
    "feature-guard",
    normalizedCompanyId,
    normalizedFeatureKey,
    normalizedEnvironment ?? "global"
  );

  return getOrSetCachedValue(
    cacheKey,
    async () => {
      try {
        const featureRows = normalizedEnvironment
          ? await getCompanyFeaturesByEnvironment(normalizedCompanyId, normalizedEnvironment)
          : await getCompanyFeatures(normalizedCompanyId);
        const feature = selectFeature(featureRows, normalizedFeatureKey, normalizedEnvironment);

        if (!feature) {
          return buildFeatureGuardFallback(normalizedFeatureKey, {
            reason: "feature_not_configured",
            metadata: {
              companyId: normalizedCompanyId,
              environment: normalizedEnvironment
            }
          });
        }

        return normalizeFeatureGuardState(
          normalizedFeatureKey,
          feature.enabled,
          feature.enabled ? "feature_enabled" : "feature_disabled",
          {
            companyId: normalizedCompanyId,
            environment: feature.environment ?? normalizedEnvironment,
            featureId: feature.id,
            featureMetadata: feature.metadata ?? null,
            source: "company_features"
          }
        );
      } catch (_error) {
        return buildFeatureGuardFallback(normalizedFeatureKey, {
          reason: "feature_source_unavailable",
          metadata: {
            companyId: normalizedCompanyId,
            environment: normalizedEnvironment
          }
        });
      }
    },
    { ttlMs: FEATURE_GUARD_TTL_MS }
  );
}

export async function isFeatureAllowed(companyId, featureKey, options = {}) {
  const featureState = await getFeatureGuardState(companyId, featureKey, options);
  return featureState.enabled;
}

export async function getEnabledCompanyFeatures(companyId, options = {}) {
  const normalizedCompanyId = normalizeNullableString(companyId);
  const normalizedEnvironment = normalizeNullableString(options.environment);

  if (!normalizedCompanyId) {
    return buildDefaultFeaturesFallback();
  }

  try {
    const featureRows = normalizedEnvironment
      ? await getCompanyFeaturesByEnvironment(normalizedCompanyId, normalizedEnvironment)
      : await getCompanyFeatures(normalizedCompanyId);

    return featureRows.filter((feature) => feature.enabled);
  } catch (_error) {
    return buildDefaultFeaturesFallback();
  }
}
