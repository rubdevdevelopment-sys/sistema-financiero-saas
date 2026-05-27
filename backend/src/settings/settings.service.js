import { query } from "../config/db.js";

const DEFAULT_TIMEZONE = "America/Bogota";
const DEFAULT_CURRENCY = "COP";

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function isRelationMissingError(error) {
  return error?.code === "42P01";
}

function buildSettingsShape(settings, fallback) {
  return {
    id: settings?.id ?? null,
    company_id: settings?.company_id ?? fallback.company_id ?? null,
    timezone: normalizeNullableString(settings?.timezone) ?? fallback.timezone,
    locale: normalizeNullableString(settings?.locale) ?? fallback.locale,
    language: normalizeNullableString(settings?.language) ?? fallback.language,
    currency: normalizeNullableString(settings?.currency) ?? fallback.currency,
    date_format: normalizeNullableString(settings?.date_format) ?? fallback.date_format,
    number_format: normalizeNullableString(settings?.number_format) ?? fallback.number_format,
    created_at: settings?.created_at ?? null,
    updated_at: settings?.updated_at ?? null
  };
}

export function buildDefaultSettingsFallback(company) {
  return {
    id: null,
    company_id: company?.id ?? null,
    timezone: normalizeNullableString(company?.timezone) ?? DEFAULT_TIMEZONE,
    locale: null,
    language: null,
    currency: normalizeNullableString(company?.currency) ?? DEFAULT_CURRENCY,
    date_format: null,
    number_format: null,
    created_at: null,
    updated_at: null
  };
}

export async function getCompanySettings(companyId) {
  if (!companyId) {
    return null;
  }

  try {
    const { rows } = await query(
      `
        select *
        from company_settings
        where company_id = $1
        limit 1
      `,
      [companyId]
    );

    return rows[0] ?? null;
  } catch (error) {
    if (isRelationMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getCompanySettingsWithFallback(companyId) {
  if (!companyId) {
    return null;
  }

  let rows;

  try {
    ({ rows } = await query(
      `
        select c.id,
               c.timezone,
               c.currency,
               cs.id as settings_id,
               cs.company_id as settings_company_id,
               cs.timezone as settings_timezone,
               cs.locale as settings_locale,
               cs.language as settings_language,
               cs.currency as settings_currency,
               cs.date_format as settings_date_format,
               cs.number_format as settings_number_format,
               cs.created_at as settings_created_at,
               cs.updated_at as settings_updated_at
        from companies c
        left join company_settings cs on cs.company_id = c.id
        where c.id = $1
        limit 1
      `,
      [companyId]
    ));
  } catch (error) {
    if (!isRelationMissingError(error)) {
      throw error;
    }

    ({ rows } = await query(
      `
        select id, timezone, currency
        from companies
        where id = $1
        limit 1
      `,
      [companyId]
    ));
  }

  const row = rows[0];

  if (!row) {
    return null;
  }

  const fallback = buildDefaultSettingsFallback(row);
  const settings = row.settings_id
    ? {
        id: row.settings_id,
        company_id: row.settings_company_id,
        timezone: row.settings_timezone,
        locale: row.settings_locale,
        language: row.settings_language,
        currency: row.settings_currency,
        date_format: row.settings_date_format,
        number_format: row.settings_number_format,
        created_at: row.settings_created_at,
        updated_at: row.settings_updated_at
      }
    : null;

  return buildSettingsShape(settings, fallback);
}
