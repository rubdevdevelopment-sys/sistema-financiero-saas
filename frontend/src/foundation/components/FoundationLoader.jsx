import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

const sizeMap = {
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem"
};

export function FoundationLoader({ label = "Cargando", size = "md", inline = false, style = {} }) {
  const spinnerSize = sizeMap[size] ?? sizeMap.md;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: inline ? "inline-flex" : "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing[3],
        color: theme.semantic.textMuted,
        ...style
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: theme.radius.pill,
          border: `2px solid ${theme.colors.neutral[200]}`,
          borderTopColor: theme.semantic.primary,
          animation: "foundation-spin 0.9s linear infinite"
        }}
      />
      <span style={theme.typography.textStyles.bodySmall}>{label}</span>
      <style>
        {`@keyframes foundation-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}

export default FoundationLoader;
