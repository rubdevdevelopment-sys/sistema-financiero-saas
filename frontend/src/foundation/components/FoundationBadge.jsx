import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

const toneMap = {
  neutral: {
    backgroundColor: theme.colors.neutral[100],
    color: theme.colors.neutral[700]
  },
  primary: {
    backgroundColor: theme.colors.primary[100],
    color: theme.colors.primary[700]
  },
  success: {
    backgroundColor: theme.colors.success[100],
    color: theme.colors.success[700]
  },
  warning: {
    backgroundColor: theme.colors.warning[100],
    color: theme.colors.warning[700]
  },
  danger: {
    backgroundColor: theme.colors.danger[100],
    color: theme.colors.danger[700]
  },
  info: {
    backgroundColor: theme.colors.info[100],
    color: theme.colors.info[700]
  }
};

export function FoundationBadge({ children, tone = "neutral", outlined = false, style = {}, ...props }) {
  const resolvedTone = toneMap[tone] ?? toneMap.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "1.875rem",
        padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
        borderRadius: theme.radius.pill,
        border: `1px solid ${outlined ? resolvedTone.color : "transparent"}`,
        backgroundColor: outlined ? "transparent" : resolvedTone.backgroundColor,
        color: resolvedTone.color,
        fontFamily: theme.typography.fontFamilies.sans,
        fontSize: theme.typography.fontSizes.xs,
        fontWeight: theme.typography.fontWeights.semibold,
        letterSpacing: theme.typography.letterSpacing.wide,
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export default FoundationBadge;
