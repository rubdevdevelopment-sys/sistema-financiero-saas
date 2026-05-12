import { currency, shortDate } from "../../utils/format.js";

export function DataTable({ rows, onEdit, onDelete, showResponsible = false }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Titulo</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Categoria</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Monto</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Fecha</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
              {showResponsible && (
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Responsable
                </th>
              )}
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={showResponsible ? 7 : 6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No hay registros para mostrar.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">{row.title}</div>
                    <div className="text-xs text-slate-500">{row.description}</div>
                  </td>
                  <td className="px-4 py-4">{row.category_name}</td>
                  <td className="px-4 py-4 font-semibold">{currency(row.amount)}</td>
                  <td className="px-4 py-4">{shortDate(row.movement_date)}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-700">
                      {row.status}
                    </span>
                  </td>
                  {showResponsible && <td className="px-4 py-4">{row.responsible || "-"}</td>}
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button className="btn-secondary" onClick={() => onEdit(row)}>
                        Editar
                      </button>
                      <button
                        className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
                        onClick={() => onDelete(row)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
