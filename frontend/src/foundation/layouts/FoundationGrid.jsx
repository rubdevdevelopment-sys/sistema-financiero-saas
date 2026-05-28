import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

function resolveColumns(columns) {
  if (typeof columns === "number") {
    return `repeat(${columns}, minmax(0, 1fr))`;
  }

  if (typeof columns === "string" && columns.trim() !== "") {
    return columns;
  }

  return "repeat(auto-fit, minmax(16rem, 1fr))";
}

export function FoundationGrid({
  children,
  columns,
  gap = theme.layoutSpacing.stackGap,
  minItemWidth = "16rem",
  autoFit = false,
  style = {},
  ...props
}) {
  const gridTemplateColumns = autoFit
    ? `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
    : resolveColumns(columns);

  return (
    <div
      style={{
        display: "grid",
        gap,
        gridTemplateColumns,
        minWidth: 0,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default FoundationGrid;
