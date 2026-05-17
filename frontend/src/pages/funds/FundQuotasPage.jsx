import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import {
  generateFundContributions,
  getFundContributions,
  getFundCycles,
  getFundMembers,
  getFundQuotas,
  registerFundContributionPayment,
  saveFundQuota
} from "../../services/fund.service.js";
import { queryClient } from "../../services/queryClient.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { currency, integer } from "../../utils/format.js";

const now = new Date();

export function FundQuotasPage() {
  const { activeCompany } = useActiveCompany();
  const [quotaForm, setQuotaForm] = useState({ member_id: "", cycle_id: "", quota_count: 1, status: "active" });
  const [period, setPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() + 1, cycle_id: "" });
  const [payment, setPayment] = useState(null);

  const cyclesQuery = useQuery({ queryKey: ["fund-cycles", activeCompany?.id], queryFn: () => getFundCycles(activeCompany?.id) });
  const membersQuery = useQuery({ queryKey: ["fund-members", activeCompany?.id], queryFn: () => getFundMembers(activeCompany?.id) });
  const quotasQuery = useQuery({ queryKey: ["fund-quotas", activeCompany?.id, period.cycle_id], queryFn: () => getFundQuotas(activeCompany?.id, period.cycle_id) });
  const contributionsQuery = useQuery({
    queryKey: ["fund-contributions", activeCompany?.id, period],
    queryFn: () => getFundContributions(activeCompany?.id, {
      cycle_id: period.cycle_id || undefined,
      year: period.year,
      month: period.month
    })
  });

  const selectedCycle = useMemo(
    () => (cyclesQuery.data ?? []).find((cycle) => cycle.id === quotaForm.cycle_id),
    [cyclesQuery.data, quotaForm.cycle_id]
  );
  const projectedMonthly = Number(quotaForm.quota_count || 0) * Number(selectedCycle?.monthly_contribution || 0);

  const quotaMutation = useMutation({
    mutationFn: (payload) => saveFundQuota(payload),
    onSuccess: async () => {
      toast.success("Cupos asignados");
      setQuotaForm({ member_id: "", cycle_id: "", quota_count: 1, status: "active" });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-quotas"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-members"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible asignar cupos"))
  });

  const generateMutation = useMutation({
    mutationFn: () => generateFundContributions({ ...period, company_id: activeCompany?.id }),
    onSuccess: async (result) => {
      toast.success(`Aportes generados: ${result.generated}`);
      await queryClient.invalidateQueries({ queryKey: ["fund-contributions"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible generar aportes"))
  });

  const paymentMutation = useMutation({
    mutationFn: () => registerFundContributionPayment(payment.id, {
      paid_amount: Number(payment.paid_amount),
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      notes: payment.notes
    }),
    onSuccess: async () => {
      toast.success("Pago registrado");
      setPayment(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-contributions"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible registrar el pago"))
  });

  const totals = (contributionsQuery.data ?? []).reduce(
    (acc, item) => ({
      expected: acc.expected + Number(item.expected_amount || 0),
      paid: acc.paid + Number(item.paid_amount || 0),
      pending: acc.pending + Number(item.pending_amount || 0),
      overdue: acc.overdue + (item.status === "overdue" ? 1 : 0)
    }),
    { expected: 0, paid: 0, pending: 0, overdue: 0 }
  );

  function submitQuota(event) {
    event.preventDefault();
    quotaMutation.mutate({
      ...quotaForm,
      company_id: activeCompany?.id,
      quota_count: Number(quotaForm.quota_count)
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fondo solidario"
        title="Cupos y aportes mensuales"
        description="Asigna cupos, genera cuotas mensuales y registra pagos parciales o completos."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Esperado periodo" value={totals.expected} accent="bg-brand-500" />
        <StatCard label="Pagado periodo" value={totals.paid} accent="bg-emerald-500" />
        <StatCard label="Pendiente periodo" value={totals.pending} accent="bg-amber-500" />
        <StatCard label="Cuotas en mora" value={totals.overdue} accent="bg-rose-500" formatter={integer} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="panel-soft p-6" onSubmit={submitQuota}>
          <h3 className="text-lg font-semibold text-slate-950">Asignar cupos</h3>
          <div className="mt-5 grid gap-4">
            <select className="input-light" value={quotaForm.member_id} onChange={(event) => setQuotaForm({ ...quotaForm, member_id: event.target.value })} required>
              <option value="">Seleccionar miembro</option>
              {(membersQuery.data ?? []).map((member) => <option key={member.id} value={member.id}>{member.full_name}</option>)}
            </select>
            <select className="input-light" value={quotaForm.cycle_id} onChange={(event) => setQuotaForm({ ...quotaForm, cycle_id: event.target.value })} required>
              <option value="">Seleccionar ciclo</option>
              {(cyclesQuery.data ?? []).map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.name} ({cycle.year})</option>)}
            </select>
            <input className="input-light" type="number" min="1" value={quotaForm.quota_count} onChange={(event) => setQuotaForm({ ...quotaForm, quota_count: event.target.value })} placeholder="Cantidad de cupos" required />
            <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-slate-700">
              Pago mensual calculado: <strong>{currency(projectedMonthly)}</strong>
            </div>
            <button className="btn-primary" type="submit" disabled={quotaMutation.isPending}>Asignar cupos</button>
          </div>
        </form>

        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Cupos activos</h3>
          <div className="mt-5 grid gap-3">
            {(quotasQuery.data ?? []).map((quota) => (
              <div key={quota.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{quota.member_name}</p>
                    <p className="text-sm text-slate-500">{quota.cycle_name} | {quota.quota_count} cupos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-950">{currency(quota.monthly_payment)}</p>
                    <span className="status-badge">{quota.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel-soft p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Aportes mensuales</h3>
            <p className="mt-1 text-sm text-slate-500">Genera una cuota por cada asignacion activa del ciclo seleccionado.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <select className="input-light" value={period.cycle_id} onChange={(event) => setPeriod({ ...period, cycle_id: event.target.value })} required>
              <option value="">Ciclo</option>
              {(cyclesQuery.data ?? []).map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.name}</option>)}
            </select>
            <input className="input-light" type="number" min="2000" value={period.year} onChange={(event) => setPeriod({ ...period, year: Number(event.target.value) })} />
            <input className="input-light" type="number" min="1" max="12" value={period.month} onChange={(event) => setPeriod({ ...period, month: Number(event.target.value) })} />
            <button className="btn-primary" type="button" disabled={!period.cycle_id || generateMutation.isPending} onClick={() => generateMutation.mutate()}>
              Generar cuotas
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Miembro</th>
                <th className="px-4 py-3">Esperado</th>
                <th className="px-4 py-3">Pagado</th>
                <th className="px-4 py-3">Pendiente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(contributionsQuery.data ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">{item.member_name}</td>
                  <td className="px-4 py-3">{currency(item.expected_amount)}</td>
                  <td className="px-4 py-3">{currency(item.paid_amount)}</td>
                  <td className="px-4 py-3">{currency(item.pending_amount)}</td>
                  <td className="px-4 py-3"><span className="status-badge">{item.status}</span></td>
                  <td className="px-4 py-3"><button className="btn-secondary" type="button" onClick={() => setPayment({ ...item, paid_amount: item.paid_amount || item.expected_amount, payment_date: new Date().toISOString().slice(0, 10), payment_method: "transferencia", notes: "" })}>Registrar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {payment ? (
        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Registrar pago de {payment.member_name}</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <input className="input-light" type="number" min="0" value={payment.paid_amount} onChange={(event) => setPayment({ ...payment, paid_amount: event.target.value })} />
            <input className="input-light" type="date" value={payment.payment_date} onChange={(event) => setPayment({ ...payment, payment_date: event.target.value })} />
            <input className="input-light" value={payment.payment_method} onChange={(event) => setPayment({ ...payment, payment_method: event.target.value })} placeholder="Metodo" />
            <div className="flex gap-3">
              <button className="btn-primary" type="button" onClick={() => paymentMutation.mutate()}>Guardar</button>
              <button className="btn-secondary" type="button" onClick={() => setPayment(null)}>Cancelar</button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default FundQuotasPage;
