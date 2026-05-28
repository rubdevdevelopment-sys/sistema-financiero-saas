import { useMemo } from "react";
import { useSettings } from "./useSettings.js";
import { buildRuntimeSettingsValue } from "./runtime-settings.shared.js";

export function useRuntimeSettings(runtimeSettings = null, options = {}) {
  const { settings } = useSettings();

  return useMemo(() => {
    const candidate =
      runtimeSettings && typeof runtimeSettings === "object" ? runtimeSettings : settings;

    return buildRuntimeSettingsValue(candidate, options);
  }, [
    options.companyId,
    options.source,
    runtimeSettings,
    settings
  ]);
}
