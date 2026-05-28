import { buildFoundationTheme } from "../theme/foundation-theme.js";
import { FoundationCard } from "../components/FoundationCard.jsx";

const theme = buildFoundationTheme();

export function FoundationPanel({
  title = null,
  description = null,
  toolbar = null,
  children,
  accent = null,
  style = {},
  bodyStyle = {},
  ...props
}) {
  return (
    <FoundationCard
      accent={accent}
      style={style}
      {...props}
    >
      {title || description || toolbar ? (
        <div
          style={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            gap: theme.spacing[4],
            flexWrap: "wrap"
          }}
        >
          <div>
            {title ? (
              <h3
                style={{
                  ...theme.typography.textStyles.title,
                  color: theme.semantic.text
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
          </div>
          {toolbar ? <div style={{ display: "flex", gap: theme.spacing[3], flexWrap: "wrap" }}>{toolbar}</div> : null}
        </div>
      ) : null}
      <div style={{ marginTop: title || description || toolbar ? theme.spacing[5] : 0, ...bodyStyle }}>
        {children}
      </div>
    </FoundationCard>
  );
}

export default FoundationPanel;
