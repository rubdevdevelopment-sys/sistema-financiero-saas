import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

export function FoundationSection({
  title = null,
  description = null,
  actions = null,
  children,
  gap = theme.layoutSpacing.stackGap,
  style = {},
  ...props
}) {
  return (
    <section
      style={{
        display: "grid",
        gap,
        ...style
      }}
      {...props}
    >
      {title || description || actions ? (
        <div
          style={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            gap: theme.spacing[4],
            flexWrap: "wrap"
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title ? (
              <h2
                style={{
                  ...theme.typography.textStyles.title,
                  color: theme.semantic.text
                }}
              >
                {title}
              </h2>
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
          </div>
          {actions ? <div style={{ display: "flex", gap: theme.spacing[3], flexWrap: "wrap" }}>{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export default FoundationSection;
