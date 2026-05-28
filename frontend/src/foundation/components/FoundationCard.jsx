import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

export function FoundationCard({
  eyebrow,
  title,
  description,
  children,
  footer = null,
  accent = null,
  interactive = false,
  padding = "default",
  style = {},
  ...props
}) {
  const paddingMap = {
    compact: theme.layoutSpacing.compactCardPadding,
    default: theme.layoutSpacing.cardPadding,
    roomy: theme.spacing[8]
  };

  return (
    <article
      style={{
        border: `1px solid ${theme.semantic.border}`,
        borderRadius: theme.radius["3xl"],
        backgroundColor: theme.semantic.surface,
        boxShadow: interactive ? theme.shadows.lg : theme.shadows.md,
        padding: paddingMap[padding] ?? paddingMap.default,
        transition: theme.transitions.presets.interactive,
        overflow: "hidden",
        ...style
      }}
      {...props}
    >
      {accent ? (
        <div
          aria-hidden="true"
          style={{
            height: "0.375rem",
            width: "6rem",
            borderRadius: theme.radius.pill,
            backgroundColor: accent
          }}
        />
      ) : null}
      {eyebrow ? (
        <p
          style={{
            ...theme.typography.textStyles.eyebrow,
            color: theme.semantic.textMuted,
            marginTop: accent ? theme.spacing[4] : 0
          }}
        >
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h3
          style={{
            ...theme.typography.textStyles.title,
            color: theme.semantic.text,
            marginTop: eyebrow || accent ? theme.spacing[3] : 0
          }}
        >
          {title}
        </h3>
      ) : null}
      {description ? (
        <p
          style={{
            ...theme.typography.textStyles.bodySmall,
            color: theme.semantic.textMuted,
            marginTop: theme.spacing[2]
          }}
        >
          {description}
        </p>
      ) : null}
      <div style={{ marginTop: title || description ? theme.spacing[5] : 0 }}>{children}</div>
      {footer ? (
        <div
          style={{
            marginTop: theme.spacing[5],
            paddingTop: theme.spacing[4],
            borderTop: `1px solid ${theme.semantic.border}`
          }}
        >
          {footer}
        </div>
      ) : null}
    </article>
  );
}

export default FoundationCard;
