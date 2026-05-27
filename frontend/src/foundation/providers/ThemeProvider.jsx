import { createContext, useContext, useMemo, useState } from "react";
import { BrandingContext } from "./BrandingProvider.jsx";

function buildThemeFromBranding(branding) {
  return {
    name: branding?.theme_name ?? "rubdev-default",
    darkModeEnabled: branding?.dark_mode_enabled ?? false,
    colors: {
      primary: branding?.primary_color ?? "#14b8a6",
      secondary: branding?.secondary_color ?? "#0f172a",
      accent: branding?.accent_color ?? "#38bdf8",
      background: branding?.background_color ?? null,
      text: branding?.text_color ?? null
    },
    ready: Boolean(branding?.ready)
  };
}

const defaultThemeState = buildThemeFromBranding(null);

export const ThemeContext = createContext({
  theme: defaultThemeState,
  setTheme: () => {},
  resetTheme: () => {}
});

export function ThemeProvider({ children, initialTheme = null }) {
  const { branding } = useContext(BrandingContext);
  const [manualTheme, setManualTheme] = useState(() =>
    initialTheme ? buildThemeFromBranding(initialTheme) : null
  );

  function setTheme(nextTheme) {
    setManualTheme(buildThemeFromBranding(nextTheme));
  }

  function resetTheme() {
    setManualTheme(null);
  }

  const theme = useMemo(
    () => manualTheme ?? buildThemeFromBranding(branding),
    [branding, manualTheme]
  );
  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resetTheme
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
