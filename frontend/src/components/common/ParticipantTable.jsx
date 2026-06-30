import { currency } from "../../utils/format.js";
import { PaginationControls } from "./PaginationControls.jsx";

function paymentStatusClass(status) {
  if (status === "completed") return "status-badge status-ok";
  if (status === "partial") return "status-badge status-warn";
  return "status-badge status-danger-soft";
}

function paymentStatusLabel(status) {
  if (status === "completed") return "Completo";
  if (status === "partial") return "Parcial";
  return "Pendiente";
}

export function ParticipantTable({
  rows,
  pagination,
  loading,
  onPageChange,
  onEdit,
  onDelete,
  onView
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Participante</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Documento</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Meta</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Pagado</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Por confirmar</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Pendiente</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Cargando participantes...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  No hay participantes para mostrar.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const progress =
                  row.target_amount > 0 ? Math.min((row.total_paid / row.target_amount) * 100, 100) : 0;

                return (
                  <tr key={row.id}>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{row.full_name}</div>
                      <div className="text-xs text-slate-500">{row.phone || row.email || "Sin contacto"}</div>
                    </td>
                    <td className="px-4 py-4">{row.document_number}</td>
                    <td className="px-4 py-4 font-semibold">{currency(row.target_amount)}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-950">{currency(row.total_paid)}</div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${
                            row.payment_status === "completed"
                              ? "bg-emerald-500"
                              : row.payment_status === "partial"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-amber-700">
                      {currency(row.pending_income_amount)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{currency(row.pending_balance)}</td>
                    <td className="px-4 py-4">
                      <span className={paymentStatusClass(row.payment_status)}>{paymentStatusLabel(row.payment_status)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button className="btn-secondary" type="button" onClick={() => onView(row)}>
                          Historial
                        </button>
                        <button className="btn-secondary" type="button" onClick={() => onEdit(row)}>
                          Editar
                        </button>
                        <button className="btn-danger" type="button" onClick={() => onDelete(row)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        page={pagination?.page ?? 1}
        totalPages={pagination?.total_pages ?? 1}
        total={pagination?.total ?? 0}
        pageSize={pagination?.page_size ?? 10}
        onPageChange={onPageChange}
      />
    </div>
  );
}
