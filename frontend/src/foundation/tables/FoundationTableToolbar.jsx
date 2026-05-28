import { buildFoundationTheme } from "../theme/foundation-theme.js";
import { FoundationInput } from "../components/FoundationInput.jsx";
import { FoundationButton } from "../components/FoundationButton.jsx";

const theme = buildFoundationTheme();

export function FoundationTableToolbar({
  searchValue = "",
  onSearchChange = () => {},
  searchPlaceholder = "Buscar...",
  actions = null,
  filters = null,
  title = null,
  description = null,
  style = {}
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: theme.spacing[4],
        ...style
      }}
    >
      {title || description ? (
        <div>
          {title ? (
            <h3 style={{ ...theme.typography.textStyles.title, color: theme.semantic.text }}>{title}</h3>
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
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
          gap: theme.spacing[4],
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", gap: theme.spacing[3], flex: "1 1 22rem", flexWrap: "wrap" }}>
          <div style={{ minWidth: "16rem", flex: "1 1 18rem" }}>
            <FoundationInput
              label="Search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              prefix="⌕"
              hint="Placeholder de busqueda simple para adopcion futura."
            />
          </div>
          {filters}
        </div>
        <div style={{ display: "flex", gap: theme.spacing[3], flexWrap: "wrap", alignItems: "center" }}>
          {actions}
          {!actions ? <FoundationButton variant="secondary">Accion</FoundationButton> : null}
        </div>
      </div>
    </div>
  );
}

export default FoundationTableToolbar;
