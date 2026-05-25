import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { getFundCycles, saveFundCycle } from "../../services/fund.service.js";
import { queryClient } from "../../services/queryClient.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

const currentYear = new Date().getFullYear();

const emptyCycle = {
  year: currentYear,
  name: `Fondo ${currentYear}`,
  quota_value: 200000,
  monthly_contribution: 200000,
  start_date: `${currentYear}-01-01`,
  end_date: `${currentYear}-12-31`,
  status: "draft",
  is_active: false,
  notes: ""
};

export function FundCyclesPage() {
  const { activeCompany } = useActiveCompany();
  const [form, setForm] = useState(emptyCycle);
  const [editing, setEditing] = useState(null);

  const cyclesQuery = useQuery({
    queryKey: ["fund-cycles", activeCompany?.id],
    queryFn: () => getFundCycles(activeCompany?.id)
  });

  useEffect(() => {
    if (!editing) return;
    setForm({
      year: editing.year,
      name: editing.name,
      quota_value: editing.quota_value,
      monthly_contribution: editing.monthly_contribution,
      start_date: editing.start_date?.slice(0, 10),
      end_date: editing.end_date?.slice(0, 10),
      status: editing.status,
      is_active: Boolean(editing.is_active),
      notes: editing.notes || ""
    });
  }, [editing]);

  const mutation = useMutation({
    mutationFn: (payload) => saveFundCycle(payload, editing?.id),
    onSuccess: async () => {
      toast.success(editing ? "Ciclo actualizado" : "Ciclo creado");
      setEditing(null);
      setForm(emptyCycle);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-cycles"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No fue posible guardar el ciclo"));
    }
  });

  function submit(event) {
    event.preventDefault();
    mutation.mutate({
      ...form,
      company_id: activeCompany?.id,
      year: Number(form.year),
      quota_value: Number(form.quota_value),
      monthly_contribution: Number(form.monthly_contribution)
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyCycle);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fondo solidario"
        title="Ciclos funcionales"
        description="Administra anios de operacion, valor del cupo y aporte mensual. Solo un ciclo puede estar activo."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="panel-soft p-6" onSubmit={submit}>
          <h3 className="text-lg font-semibold text-slate-950">
            {editing ? "Editar ciclo" : "Nuevo ciclo"}
          </h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="input-light" type="number" min="2000" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} placeholder="Anio" required />
            <input className="input-light" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nombre del ciclo" required />
            <input className="input-light" type="number" min="1" value={form.quota_value} onChange={(event) => setForm({ ...form, quota_value: event.target.value })} placeholder="Valor cupo" required />
            <input className="input-light" type="number" min="1" value={form.monthly_contribution} onChange={(event) => setForm({ ...form, monthly_contribution: event.target.value })} placeholder="Aporte mensual" required />
            <input className="input-light" type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} required />
            <input className="input-light" type="date" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} required />
            <select className="input-light" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value, is_active: event.target.value === "active" })}>
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="closed">Cerrado</option>
            </select>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
              <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked, status: event.target.checked ? "active" : "draft" })} />
              Ciclo activo
            </label>
            <textarea className="input-light md:col-span-2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notas" rows="3" />
          </div>
          <div className="mt-5 flex gap-3">
            <button className="btn-primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : editing ? "Guardar cambios" : "Crear ciclo"}
            </button>
            {editing ? <button className="btn-secondary" type="button" onClick={cancelEdit}>Cancelar</button> : null}
          </div>
        </form>

        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Ciclos registrados</h3>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ciclo</th>
                  <th className="px-4 py-3">Cupo</th>
                  <th className="px-4 py-3">Mensual</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(cyclesQuery.data ?? []).map((cycle) => (
                  <tr key={cycle.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-950">{cycle.name} ({cycle.year})</p>
                      <p className="text-xs text-slate-500">{formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(cycle.quota_value)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(cycle.monthly_contribution)}</td>
                    <td className="px-4 py-3">
                      <span className={cycle.is_active ? "status-badge status-ok" : "status-badge"}>{cycle.is_active ? "Activo" : cycle.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="btn-secondary" type="button" onClick={() => setEditing(cycle)}>Editar</button>
                    </td>
                  </tr>
                ))}
                {!cyclesQuery.isLoading && (cyclesQuery.data ?? []).length === 0 ? (
                  <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">Aun no hay ciclos creados.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default FundCyclesPage;
