import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

export function FoundationEmptyState({
  title,
  description,
  action = null,
  icon = null,
  style = {}
}) {
  return (
    <section
      style={{
        display: "grid",
        justifyItems: "start",
        gap: theme.spacing[4],
        border: `1px dashed ${theme.semantic.border}`,
        borderRadius: theme.radius["3xl"],
        backgroundColor: theme.semantic.surfaceMuted,
        padding: theme.layoutSpacing.cardPadding,
        ...style
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "3rem",
          height: "3rem",
          display: "grid",
          placeItems: "center",
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.primary[100],
          color: theme.colors.primary[700],
          fontSize: theme.typography.fontSizes.xl,
          fontWeight: theme.typography.fontWeights.bold
        }}
      >
        {icon ?? "?"}
      </div>
      <div>
        <h3 style={{ ...theme.typography.textStyles.title, color: theme.semantic.text }}>{title}</h3>
        <p
          style={{
            ...theme.typography.textStyles.body,
            color: theme.semantic.textMuted,
            marginTop: theme.spacing[2]
          }}
        >
          {description}
        </p>
      </div>
      {action}
    </section>
  );
}

export default FoundationEmptyState;
