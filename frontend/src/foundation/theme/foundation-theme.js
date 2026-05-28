import { foundationColors, semanticColors } from "./tokens/colors.js";
import { spacingScale, layoutSpacing } from "./tokens/spacing.js";
import radiusScale from "./tokens/radius.js";
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  textStyles
} from "./tokens/typography.js";
import shadowScale from "./tokens/shadows.js";
import {
  transitionDurations,
  transitionEasings,
  transitionPresets
} from "./tokens/transitions.js";

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export const foundationThemeBase = {
  name: "rubdev-foundation",
  colors: foundationColors,
  semantic: semanticColors,
  spacing: spacingScale,
  layoutSpacing,
  radius: radiusScale,
  typography: {
    fontFamilies,
    fontSizes,
    fontWeights,
    lineHeights,
    letterSpacing,
    textStyles
  },
  shadows: shadowScale,
  transitions: {
    durations: transitionDurations,
    easings: transitionEasings,
    presets: transitionPresets
  }
};

export function buildFoundationTheme(branding = null) {
  return {
    ...foundationThemeBase,
    name: normalizeNullableString(branding?.theme_name) ?? foundationThemeBase.name,
    darkModeEnabled: Boolean(branding?.dark_mode_enabled),
    semantic: {
      ...foundationThemeBase.semantic,
      primary: normalizeNullableString(branding?.primary_color) ?? foundationThemeBase.semantic.primary,
      text: normalizeNullableString(branding?.text_color) ?? foundationThemeBase.semantic.text,
      accent: normalizeNullableString(branding?.accent_color) ?? foundationThemeBase.semantic.accent,
      background:
        normalizeNullableString(branding?.background_color) ?? foundationThemeBase.semantic.background
    },
    branding: {
      primary_color: normalizeNullableString(branding?.primary_color) ?? foundationThemeBase.semantic.primary,
      secondary_color:
        normalizeNullableString(branding?.secondary_color) ?? foundationThemeBase.colors.neutral[900],
      accent_color: normalizeNullableString(branding?.accent_color) ?? foundationThemeBase.semantic.accent,
      background_color:
        normalizeNullableString(branding?.background_color) ?? foundationThemeBase.semantic.background,
      text_color: normalizeNullableString(branding?.text_color) ?? foundationThemeBase.semantic.text
    }
  };
}

export default foundationThemeBase;
