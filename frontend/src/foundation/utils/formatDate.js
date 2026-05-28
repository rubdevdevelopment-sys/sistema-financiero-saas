import {
  buildDateParts,
  formatDateByPreference,
  mapDateParts,
  resolveFormatterSettings,
  toSafeDate
} from "./formatter-settings.shared.js";

export function formatDate(value, runtimeSettings = null, options = {}) {
  const settings = resolveFormatterSettings(runtimeSettings);
  const date = toSafeDate(value);

  if (!date) {
    return options.fallback ?? "-";
  }

  try {
    const parts = buildDateParts(date, settings.locale, settings.timezone);
    return formatDateByPreference(mapDateParts(parts), settings.date_format);
  } catch (_error) {
    try {
      const parts = buildDateParts(date, "es-CO", "America/Bogota");
      return formatDateByPreference(mapDateParts(parts), "DD/MM/YYYY");
    } catch (_secondaryError) {
      return options.fallback ?? "-";
    }
  }
}

export default formatDate;
