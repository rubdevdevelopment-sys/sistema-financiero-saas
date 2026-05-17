import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { getFundMembers, getFundPenalties, saveFundPenalty } from "../../services/fund.service.js";
import { queryClient } from "../../services/queryClient.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { currency } from "../../utils/format.js";

const emptyPenalty = {
  member_id: "",
  amount: 10000,
  reason: "Mora en aporte mensual",
  status: "pending"
};

export function FundPenaltiesPage() {
  const { activeCompany } = useActiveCompany();
  const [form, setForm] = useState(emptyPenalty);

  const membersQuery = useQuery({ queryKey: ["fund-members", activeCompany?.id], queryFn: () => getFundMembers(activeCompany?.id) });
  const penaltiesQuery = useQuery({ queryKey: ["fund-penalties", activeCompany?.id], queryFn: () => getFundPenalties(activeCompany?.id) });

  const mutation = useMutation({
    mutationFn: (payload) => saveFundPenalty(payload),
    onSuccess: async () => {
      toast.success("Multa registrada");
      setForm(emptyPenalty);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-penalties"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible registrar la multa"))
  });

  function submit(event) {
    event.preventDefault();
    mutation.mutate({
      ...form,
      company_id: activeCompany?.id,
      amount: Number(form.amount)
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fondo solidario"
        title="Multas y mora"
        description="Registra multas basicas por mora u otros conceptos del fondo."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form className="panel-soft p-6" onSubmit={submit}>
          <h3 className="text-lg font-semibold text-slate-950">Nueva multa</h3>
          <div className="mt-5 grid gap-4">
            <select className="input-light" value={form.member_id} onChange={(event) => setForm({ ...form, member_id: event.target.value })} required>
              <option value="">Seleccionar miembro</option>
              {(membersQuery.data ?? []).map((member) => <option key={member.id} value={member.id}>{member.full_name}</option>)}
            </select>
            <input className="input-light" type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="Valor multa" required />
            <textarea className="input-light" rows="3" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Motivo" required />
            <select className="input-light" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagada</option>
              <option value="waived">Condonada</option>
            </select>
            <button className="btn-primary" type="submit" disabled={mutation.isPending}>Registrar multa</button>
          </div>
        </form>

        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Multas registradas</h3>
          <div className="mt-5 space-y-3">
            {(penaltiesQuery.data ?? []).map((penalty) => (
              <article key={penalty.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{penalty.member_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{penalty.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-950">{currency(penalty.amount)}</p>
                    <span className="status-badge">{penalty.status}</span>
                  </div>
                </div>
              </article>
            ))}
            {!penaltiesQuery.isLoading && (penaltiesQuery.data ?? []).length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Aun no hay multas registradas.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default FundPenaltiesPage;
