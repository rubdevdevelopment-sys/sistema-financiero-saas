import { resolveFormatterSettings } from "./formatter-settings.shared.js";

export function formatNumber(value = 0, runtimeSettings = null, options = {}) {
  const settings = resolveFormatterSettings(runtimeSettings);
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const fractionDigits =
    typeof options.fractionDigits === "number" ? options.fractionDigits : settings.fractionDigits;

  try {
    return new Intl.NumberFormat(settings.locale, {
      minimumFractionDigits: fractionDigits ?? options.minimumFractionDigits ?? 0,
      maximumFractionDigits: fractionDigits ?? options.maximumFractionDigits ?? 2,
      useGrouping: options.useGrouping ?? true
    }).format(safeValue);
  } catch (_error) {
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(safeValue);
  }
}

export default formatNumber;
