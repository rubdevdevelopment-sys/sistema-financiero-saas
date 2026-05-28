export const fontFamilies = {
  sans: '"Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif',
  display: '"Manrope", "Segoe UI", "Inter", sans-serif',
  mono: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace'
};

export const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem"
};

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

export const lineHeights = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.65
};

export const letterSpacing = {
  tight: "-0.02em",
  normal: "0",
  wide: "0.08em",
  display: "-0.03em"
};

export const textStyles = {
  eyebrow: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeights.normal
  },
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.relaxed
  },
  bodySmall: {
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.normal
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.display,
    lineHeight: lineHeights.snug
  },
  hero: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes["4xl"],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.display,
    lineHeight: lineHeights.tight
  }
};

export default {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  textStyles
};
