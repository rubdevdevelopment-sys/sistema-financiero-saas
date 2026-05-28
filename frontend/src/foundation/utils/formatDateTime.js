import { resolveFormatterSettings, toSafeDate } from "./formatter-settings.shared.js";
import { formatDate } from "./formatDate.js";

export function formatDateTime(value, runtimeSettings = null, options = {}) {
  const settings = resolveFormatterSettings(runtimeSettings);
  const date = toSafeDate(value);

  if (!date) {
    return options.fallback ?? "-";
  }

  const formattedDate = formatDate(date, settings, options);

  try {
    const formattedTime = new Intl.DateTimeFormat(settings.locale, {
      timeZone: settings.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: options.hour12 ?? false
    }).format(date);

    return `${formattedDate} ${formattedTime}`;
  } catch (_error) {
    try {
      const formattedTime = new Intl.DateTimeFormat("es-CO", {
        timeZone: "America/Bogota",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(date);

      return `${formattedDate} ${formattedTime}`;
    } catch (_secondaryError) {
      return formattedDate;
    }
  }
}

export default formatDateTime;
