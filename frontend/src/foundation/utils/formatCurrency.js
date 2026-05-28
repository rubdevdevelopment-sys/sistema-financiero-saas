import { resolveFormatterSettings } from "./formatter-settings.shared.js";

export function formatCurrency(value = 0, runtimeSettings = null, options = {}) {
  const settings = resolveFormatterSettings(runtimeSettings);
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const fractionDigits =
    typeof options.fractionDigits === "number" ? options.fractionDigits : settings.fractionDigits;

  try {
    return new Intl.NumberFormat(settings.locale, {
      style: "currency",
      currency: settings.currency,
      currencyDisplay: options.currencyDisplay ?? "symbol",
      minimumFractionDigits: fractionDigits ?? options.minimumFractionDigits ?? 0,
      maximumFractionDigits: fractionDigits ?? options.maximumFractionDigits ?? 2
    }).format(safeValue);
  } catch (_error) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(safeValue);
  }
}

export default formatCurrency;
