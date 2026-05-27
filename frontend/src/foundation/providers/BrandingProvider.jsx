import { createContext, useMemo, useState } from "react";

function buildDefaultBrandingState(initialBranding = null) {
  return {
    logo_url: initialBranding?.logo_url ?? null,
    favicon_url: initialBranding?.favicon_url ?? null,
    primary_color: initialBranding?.primary_color ?? "#14b8a6",
    secondary_color: initialBranding?.secondary_color ?? "#0f172a",
    accent_color: initialBranding?.accent_color ?? "#38bdf8",
    background_color: initialBranding?.background_color ?? null,
    text_color: initialBranding?.text_color ?? null,
    dark_mode_enabled: initialBranding?.dark_mode_enabled ?? false,
    theme_name: initialBranding?.theme_name ?? "rubdev-default",
    ready: Boolean(initialBranding)
  };
}

const defaultBrandingState = buildDefaultBrandingState();

export const BrandingContext = createContext({
  branding: defaultBrandingState,
  setBranding: () => {},
  resetBranding: () => {}
});

export function BrandingProvider({ children, initialBranding = null }) {
  const [branding, setBrandingState] = useState(() =>
    buildDefaultBrandingState(initialBranding)
  );

  function setBranding(nextBranding) {
    setBrandingState(buildDefaultBrandingState(nextBranding));
  }

  function resetBranding() {
    setBrandingState(buildDefaultBrandingState());
  }

  const value = useMemo(
    () => ({
      branding,
      setBranding,
      resetBranding
    }),
    [branding]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}
