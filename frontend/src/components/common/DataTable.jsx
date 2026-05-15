import React from "react";

function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No hay registros",
  className = ""
}) {
  const safeData = Array.isArray(data)
    ? data
    : data?.data && Array.isArray(data.data)
      ? data.data
      : [];

  const safeColumns = Array.isArray(columns)
    ? columns
    : [];

  if (loading) {
    return (
      <div className="panel-soft p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
          <div className="h-10 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className={`panel-soft overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {safeColumns.map((column, index) => (
                <th
                  key={index}
                  className="
                    px-5
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                    border-b
                    border-slate-200
                  "
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {safeData.length === 0 ? (
              <tr>
                <td
                  colSpan={safeColumns.length || 1}
                  className="
                    px-6
                    py-12
                    text-center
                    text-sm
                    text-slate-500
                  "
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              safeData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="
                    border-b
                    border-slate-100
                    hover:bg-slate-50
                    transition-colors
                  "
                >
                  {safeColumns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="
                        px-5
                        py-4
                        text-sm
                        text-slate-700
                        whitespace-nowrap
                      "
                    >
                      {column.cell
                        ? column.cell({
                            row: {
                              original: row
                            }
                          })
                        : row[column.accessorKey] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {safeData.length > 0 && (
        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-4
            text-sm
            text-slate-500
            border-t
            border-slate-100
            bg-slate-50
          "
        >
          <span>
            {safeData.length} registro
            {safeData.length !== 1 ? "s" : ""}
          </span>

          <span>Tabla actualizada</span>
        </div>
      )}
    </div>
  );
}

export { DataTable };

export default DataTable;