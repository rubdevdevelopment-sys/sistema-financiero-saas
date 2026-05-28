import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

export function FoundationPageHeader({
  eyebrow = null,
  title,
  description = null,
  actions = null,
  meta = null,
  style = {},
  ...props
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "end",
        justifyContent: "space-between",
        gap: theme.spacing[5],
        flexWrap: "wrap",
        ...style
      }}
      {...props}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow ? (
          <p
            style={{
              ...theme.typography.textStyles.eyebrow,
              color: theme.semantic.textMuted
            }}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          style={{
            ...theme.typography.textStyles.hero,
            color: theme.semantic.text,
            marginTop: eyebrow ? theme.spacing[2] : 0
          }}
        >
          {title}
        </h1>
        {description ? (
          <p
            style={{
              ...theme.typography.textStyles.body,
              color: theme.semantic.textMuted,
              maxWidth: "46rem",
              marginTop: theme.spacing[3]
            }}
          >
            {description}
          </p>
        ) : null}
        {meta ? (
          <div
            style={{
              marginTop: theme.spacing[4],
              display: "flex",
              gap: theme.spacing[3],
              flexWrap: "wrap"
            }}
          >
            {meta}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div
          style={{
            display: "flex",
            gap: theme.spacing[3],
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export default FoundationPageHeader;
