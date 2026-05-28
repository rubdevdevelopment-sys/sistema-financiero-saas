import { buildRuntimeSettingsValue } from "../hooks/runtime-settings.shared.js";

function parseFractionDigits(numberFormat) {
  if (typeof numberFormat !== "string") {
    return null;
  }

  const trimmed = numberFormat.trim();
  const match = trimmed.match(/[.,](\d+)$/);

  return match ? match[1].length : null;
}

export function resolveFormatterSettings(runtimeSettings = null) {
  const settings = buildRuntimeSettingsValue(runtimeSettings);

  return {
    ...settings,
    fractionDigits: parseFractionDigits(settings.number_format)
  };
}

export function toSafeDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildDateParts(date, locale, timeZone) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
}

export function mapDateParts(parts) {
  return parts.reduce((accumulator, part) => {
    if (part.type === "day" || part.type === "month" || part.type === "year") {
      accumulator[part.type] = part.value;
    }

    return accumulator;
  }, {});
}

export function formatDateByPreference(partsMap, dateFormat) {
  const normalizedPreference =
    typeof dateFormat === "string" && dateFormat.trim() !== "" ? dateFormat.trim().toUpperCase() : "DD/MM/YYYY";

  const separator = normalizedPreference.includes("-") ? "-" : "/";

  switch (normalizedPreference) {
    case "YYYY/MM/DD":
    case "YYYY-MM-DD":
      return [partsMap.year, partsMap.month, partsMap.day].join(separator);
    case "MM/DD/YYYY":
    case "MM-DD-YYYY":
      return [partsMap.month, partsMap.day, partsMap.year].join(separator);
    case "DD/MM/YYYY":
    case "DD-MM-YYYY":
    default:
      return [partsMap.day, partsMap.month, partsMap.year].join(separator);
  }
}
