import { createContext, useMemo, useState } from "react";

function buildDefaultSettingsState(initialSettings = null) {
  return {
    timezone: initialSettings?.timezone ?? "America/Bogota",
    locale: initialSettings?.locale ?? null,
    language: initialSettings?.language ?? null,
    currency: initialSettings?.currency ?? "COP",
    date_format: initialSettings?.date_format ?? null,
    number_format: initialSettings?.number_format ?? null,
    ready: Boolean(initialSettings)
  };
}

const defaultSettingsState = buildDefaultSettingsState();

export const SettingsContext = createContext({
  settings: defaultSettingsState,
  setSettings: () => {},
  resetSettings: () => {}
});

export function SettingsProvider({ children, initialSettings = null }) {
  const [settings, setSettingsState] = useState(() =>
    buildDefaultSettingsState(initialSettings)
  );

  function setSettings(nextSettings) {
    setSettingsState(buildDefaultSettingsState(nextSettings));
  }

  function resetSettings() {
    setSettingsState(buildDefaultSettingsState());
  }

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      resetSettings
    }),
    [settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
