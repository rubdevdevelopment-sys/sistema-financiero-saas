import { buildFoundationTheme } from "../theme/foundation-theme.js";
import { FoundationCard } from "../components/FoundationCard.jsx";
import { FoundationLoader } from "../components/FoundationLoader.jsx";
import { FoundationTableEmptyState } from "./FoundationTableEmptyState.jsx";
import { FoundationTableSkeleton } from "./FoundationTableSkeleton.jsx";

const theme = buildFoundationTheme();

function getCellValue(column, row, rowIndex) {
  if (typeof column.render === "function") {
    return column.render(row, rowIndex);
  }

  if (!column.key) {
    return "-";
  }

  return row?.[column.key] ?? "-";
}

export function FoundationTable({
  columns = [],
  rows = [],
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction = null,
  toolbar = null,
  pagination = null,
  caption = null,
  actionsLabel = "Actions",
  rowKey = "id",
  style = {}
}) {
  const hasActionsColumn = columns.some((column) => column.key === "actions" || column.type === "actions");
  const safeColumns = columns.length > 0 ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <FoundationCard
      padding="compact"
      style={{
        ...style
      }}
    >
      {toolbar ? <div style={{ marginBottom: theme.spacing[5] }}>{toolbar}</div> : null}

      {loading ? (
        <div style={{ display: "grid", gap: theme.spacing[4] }}>
          <FoundationLoader label="Cargando tabla foundation" />
          <FoundationTableSkeleton columns={Math.max(1, safeColumns.length)} rows={5} />
        </div>
      ) : safeRows.length === 0 ? (
        <FoundationTableEmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0
            }}
          >
            {caption ? (
              <caption
                style={{
                  ...theme.typography.textStyles.bodySmall,
                  color: theme.semantic.textMuted,
                  textAlign: "left",
                  marginBottom: theme.spacing[3]
                }}
              >
                {caption}
              </caption>
            ) : null}
            <thead>
              <tr>
                {safeColumns.map((column) => (
                  <th
                    key={column.key ?? column.label}
                    scope="col"
                    style={{
                      textAlign: column.align ?? "left",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      borderBottom: `1px solid ${theme.semantic.border}`,
                      color: theme.semantic.textMuted,
                      fontFamily: theme.typography.fontFamilies.sans,
                      fontSize: theme.typography.fontSizes.xs,
                      fontWeight: theme.typography.fontWeights.semibold,
                      letterSpacing: theme.typography.letterSpacing.wide,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {column.label ?? (column.type === "actions" ? actionsLabel : column.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeRows.map((row, rowIndex) => (
                <tr key={row?.[rowKey] ?? `row-${rowIndex}`}>
                  {safeColumns.map((column) => (
                    <td
                      key={`${row?.[rowKey] ?? rowIndex}-${column.key ?? column.label}`}
                      style={{
                        padding: `${theme.spacing[4]} ${theme.spacing[4]}`,
                        borderBottom:
                          rowIndex === safeRows.length - 1 ? "none" : `1px solid ${theme.colors.neutral[100]}`,
                        color: theme.semantic.text,
                        verticalAlign: "top",
                        textAlign: column.align ?? "left"
                      }}
                    >
                      <div
                        style={{
                          minWidth: column.minWidth ?? "auto",
                          display: hasActionsColumn && (column.type === "actions" || column.key === "actions")
                            ? "flex"
                            : "block",
                          justifyContent:
                            column.align === "right" ? "flex-end" : column.align === "center" ? "center" : "flex-start",
                          gap: theme.spacing[2],
                          flexWrap: "wrap"
                        }}
                      >
                        {getCellValue(column, row, rowIndex)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination ? (
        <div
          style={{
            marginTop: theme.spacing[5],
            paddingTop: theme.spacing[4],
            borderTop: `1px solid ${theme.semantic.border}`
          }}
        >
          {pagination}
        </div>
      ) : null}
    </FoundationCard>
  );
}

export default FoundationTable;
