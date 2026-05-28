import {
  buildDefaultSettingsFallback,
  getCompanySettingsWithFallback
} from "../../settings/settings.service.js";

const DEFAULT_RUNTIME_SETTINGS = {
  timezone: "America/Bogota",
  currency: "COP",
  locale: "es-CO",
  language: "es",
  date_format: "DD/MM/YYYY",
  number_format: "1.234,56"
};

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function buildSettingsSource(options = {}) {
  return normalizeNullableString(options.source) ?? "settings_resolver";
}

export function buildDefaultRuntimeSettings(options = {}) {
  const companyId =
    options.companyId ?? options.company_id ?? options.company?.id ?? options.settings?.company_id ?? null;

  return {
    id: options.settings?.id ?? null,
    company_id: companyId,
    timezone: normalizeNullableString(options.settings?.timezone) ?? DEFAULT_RUNTIME_SETTINGS.timezone,
    locale: normalizeNullableString(options.settings?.locale) ?? DEFAULT_RUNTIME_SETTINGS.locale,
    language: normalizeNullableString(options.settings?.language) ?? DEFAULT_RUNTIME_SETTINGS.language,
    currency: normalizeNullableString(options.settings?.currency) ?? DEFAULT_RUNTIME_SETTINGS.currency,
    date_format:
      normalizeNullableString(options.settings?.date_format) ?? DEFAULT_RUNTIME_SETTINGS.date_format,
    number_format:
      normalizeNullableString(options.settings?.number_format) ?? DEFAULT_RUNTIME_SETTINGS.number_format,
    ready: Boolean(options.ready),
    source: buildSettingsSource(options)
  };
}

export function mergeRuntimeSettings(settings, options = {}) {
  const fallback = buildDefaultRuntimeSettings(options);

  return {
    ...fallback,
    id: settings?.id ?? fallback.id,
    company_id: settings?.company_id ?? fallback.company_id,
    timezone: normalizeNullableString(settings?.timezone) ?? fallback.timezone,
    locale: normalizeNullableString(settings?.locale) ?? fallback.locale,
    language: normalizeNullableString(settings?.language) ?? fallback.language,
    currency: normalizeNullableString(settings?.currency) ?? fallback.currency,
    date_format: normalizeNullableString(settings?.date_format) ?? fallback.date_format,
    number_format: normalizeNullableString(settings?.number_format) ?? fallback.number_format,
    ready: Boolean(options.ready ?? settings?.id ?? settings?.company_id ?? fallback.company_id),
    source: buildSettingsSource(options)
  };
}

export async function resolveCompanyRuntimeSettings(options = {}) {
  const company = options.company ?? null;
  const companyId =
    normalizeNullableString(options.companyId) ??
    normalizeNullableString(options.company_id) ??
    normalizeNullableString(company?.id) ??
    normalizeNullableString(options.runtime?.company?.id) ??
    null;

  if (options.settings && typeof options.settings === "object") {
    return mergeRuntimeSettings(options.settings, {
      companyId,
      source: options.source ?? "provided_settings",
      ready: true
    });
  }

  if (!companyId) {
    return buildDefaultRuntimeSettings({
      source: options.source ?? "missing_company_id"
    });
  }

  try {
    const settings = await getCompanySettingsWithFallback(companyId);

    if (settings) {
      return mergeRuntimeSettings(settings, {
        companyId,
        source: settings.id ? "company_settings" : "companies_fallback",
        ready: true
      });
    }

    return mergeRuntimeSettings(buildDefaultSettingsFallback(company), {
      companyId,
      source: options.source ?? "default_company_fallback",
      ready: false
    });
  } catch (_error) {
    return mergeRuntimeSettings(buildDefaultSettingsFallback(company), {
      companyId,
      source: options.source ?? "runtime_failure_fallback",
      ready: false
    });
  }
}
