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

export function buildRuntimeSettingsValue(settings = null, options = {}) {
  return {
    timezone: normalizeNullableString(settings?.timezone) ?? DEFAULT_RUNTIME_SETTINGS.timezone,
    currency: normalizeNullableString(settings?.currency) ?? DEFAULT_RUNTIME_SETTINGS.currency,
    locale: normalizeNullableString(settings?.locale) ?? DEFAULT_RUNTIME_SETTINGS.locale,
    language: normalizeNullableString(settings?.language) ?? DEFAULT_RUNTIME_SETTINGS.language,
    date_format:
      normalizeNullableString(settings?.date_format) ?? DEFAULT_RUNTIME_SETTINGS.date_format,
    number_format:
      normalizeNullableString(settings?.number_format) ?? DEFAULT_RUNTIME_SETTINGS.number_format,
    company_id: settings?.company_id ?? options.companyId ?? null,
    ready: Boolean(settings?.ready),
    source:
      normalizeNullableString(options.source) ??
      normalizeNullableString(settings?.source) ??
      "runtime_settings_hook"
  };
}
