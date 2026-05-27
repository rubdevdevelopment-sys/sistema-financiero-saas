import { query } from "../config/db.js";

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function normalizeFeatureRow(row) {
  return {
    id: row?.id ?? null,
    company_id: row?.company_id ?? null,
    feature_key: normalizeNullableString(row?.feature_key),
    enabled: Boolean(row?.enabled),
    environment: normalizeNullableString(row?.environment),
    metadata: row?.metadata ?? null,
    created_at: row?.created_at ?? null,
    updated_at: row?.updated_at ?? null
  };
}

export function buildDefaultFeaturesFallback() {
  return [];
}

export async function getCompanyFeatures(companyId) {
  if (!companyId) {
    return buildDefaultFeaturesFallback();
  }

  const { rows } = await query(
    `
      select *
      from company_features
      where company_id = $1
      order by feature_key asc, environment asc nulls first
    `,
    [companyId]
  );

  if (!rows.length) {
    return buildDefaultFeaturesFallback();
  }

  return rows.map(normalizeFeatureRow);
}

export async function getCompanyFeaturesByEnvironment(companyId, environment) {
  if (!companyId) {
    return buildDefaultFeaturesFallback();
  }

  const normalizedEnvironment = normalizeNullableString(environment);
  const sql = normalizedEnvironment
    ? `
      select *
      from company_features
      where company_id = $1 and environment = $2
      order by feature_key asc
    `
    : `
      select *
      from company_features
      where company_id = $1 and environment is null
      order by feature_key asc
    `;
  const params = normalizedEnvironment ? [companyId, normalizedEnvironment] : [companyId];
  const { rows } = await query(sql, params);

  if (!rows.length) {
    return buildDefaultFeaturesFallback();
  }

  return rows.map(normalizeFeatureRow);
}

export async function isFeatureEnabled(companyId, featureKey) {
  if (!companyId) {
    return false;
  }

  const normalizedFeatureKey = normalizeNullableString(featureKey);

  if (!normalizedFeatureKey) {
    return false;
  }

  const { rows } = await query(
    `
      select enabled
      from company_features
      where company_id = $1 and feature_key = $2
      order by environment asc nulls first
      limit 1
    `,
    [companyId, normalizedFeatureKey]
  );

  return Boolean(rows[0]?.enabled);
}
