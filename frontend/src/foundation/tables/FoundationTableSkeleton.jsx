import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

export function FoundationTableSkeleton({
  columns = 5,
  rows = 5,
  style = {}
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gap: theme.spacing[3],
        ...style
      }}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`skeleton-row-${rowIndex}`}
          style={{
            display: "grid",
            gap: theme.spacing[3],
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <span
              key={`skeleton-cell-${rowIndex}-${columnIndex}`}
              style={{
                display: "block",
                height: "1rem",
                borderRadius: theme.radius.pill,
                background:
                  "linear-gradient(90deg, rgba(226,232,240,0.8) 0%, rgba(241,245,249,1) 50%, rgba(226,232,240,0.8) 100%)",
                backgroundSize: "200% 100%",
                animation: "foundation-table-pulse 1.4s ease-in-out infinite"
              }}
            />
          ))}
        </div>
      ))}
      <style>
        {`@keyframes foundation-table-pulse { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}
      </style>
    </div>
  );
}

export default FoundationTableSkeleton;
