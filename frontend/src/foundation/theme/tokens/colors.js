export const foundationColors = {
  primary: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a"
  },
  neutral: {
    0: "#ffffff",
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617"
  },
  accent: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e"
  },
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    500: "#10b981",
    700: "#047857",
    900: "#064e3b"
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    700: "#b45309",
    900: "#78350f"
  },
  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    700: "#b91c1c",
    900: "#7f1d1d"
  },
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    700: "#1d4ed8",
    900: "#1e3a8a"
  }
};

export const semanticColors = {
  background: foundationColors.neutral[50],
  surface: foundationColors.neutral[0],
  surfaceMuted: foundationColors.neutral[100],
  text: foundationColors.neutral[900],
  textMuted: foundationColors.neutral[600],
  border: foundationColors.neutral[200],
  primary: foundationColors.primary[500],
  primaryHover: foundationColors.primary[600],
  accent: foundationColors.accent[400],
  success: foundationColors.success[500],
  warning: foundationColors.warning[500],
  danger: foundationColors.danger[500],
  info: foundationColors.info[500]
};

export default {
  foundationColors,
  semanticColors
};
