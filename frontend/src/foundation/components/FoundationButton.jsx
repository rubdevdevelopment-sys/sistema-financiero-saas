import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

const variantStyles = {
  primary: {
    backgroundColor: theme.semantic.primary,
    color: theme.colors.neutral[0],
    borderColor: theme.semantic.primary
  },
  secondary: {
    backgroundColor: theme.colors.neutral[0],
    color: theme.semantic.text,
    borderColor: theme.semantic.border
  },
  ghost: {
    backgroundColor: "transparent",
    color: theme.semantic.text,
    borderColor: "transparent"
  },
  danger: {
    backgroundColor: theme.semantic.danger,
    color: theme.colors.neutral[0],
    borderColor: theme.semantic.danger
  }
};

const sizeStyles = {
  sm: {
    minHeight: "2.25rem",
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSizes.sm
  },
  md: {
    minHeight: "2.75rem",
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    fontSize: theme.typography.fontSizes.base
  },
  lg: {
    minHeight: "3.25rem",
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
    fontSize: theme.typography.fontSizes.lg
  }
};

export function FoundationButton({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leadingAdornment = null,
  trailingAdornment = null,
  style = {},
  ...props
}) {
  const resolvedVariant = variantStyles[variant] ?? variantStyles.primary;
  const resolvedSize = sizeStyles[size] ?? sizeStyles.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      style={{
        appearance: "none",
        width: fullWidth ? "100%" : "auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing[2],
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: theme.radius.xl,
        boxShadow: variant === "primary" ? theme.shadows.md : theme.shadows.sm,
        fontFamily: theme.typography.fontFamilies.sans,
        fontWeight: theme.typography.fontWeights.semibold,
        lineHeight: theme.typography.lineHeights.normal,
        transition: theme.transitions.presets.interactive,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.6 : 1,
        ...resolvedVariant,
        ...resolvedSize,
        ...style
      }}
      {...props}
    >
      {leadingAdornment}
      <span>{loading ? "Cargando..." : children}</span>
      {trailingAdornment}
    </button>
  );
}

export default FoundationButton;
