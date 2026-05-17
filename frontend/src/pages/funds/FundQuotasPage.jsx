import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import {
  generateExtraordinaryContribution,
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

const ordinaryMonths = [
  [1, "Ene"],
  [2, "Feb"],
  [3, "Mar"],
  [4, "Abr"],
  [5, "May"],
  [6, "Jun"],
  [7, "Jul"],
  [8, "Ago"],
  [9, "Sep"],
  [10, "Oct"],
  [11, "Nov"]
];

const statusStyles = {
  paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-sky-100 text-sky-700",
  overdue: "bg-rose-100 text-rose-700",
  pending: "bg-amber-100 text-amber-700"
};

const currentYear = new Date().getFullYear();

function statusLabel(status) {
  if (status === "paid") return "Pagado";
  if (status === "partial") return "Parcial";
  if (status === "overdue") return "Vencido";
  return "Pendiente";
}

function StatusPill({ item, onClick }) {
  if (!item) {
    return <span className="inline-flex min-w-20 justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">-</span>;
  }

  return (
    <button
      className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status] ?? statusStyles.pending}`}
      type="button"
      onClick={() => onClick(item)}
    >
      {statusLabel(item.status)}
    </button>
  );
}

export function FundQuotasPage() {
  const { activeCompany } = useActiveCompany();
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [quotaForm, setQuotaForm] = useState({ member_id: "", cycle_id: "", quota_count: 1, status: "active" });
  const [extraForm, setExtraForm] = useState({ title: "Cuota extraordinaria", due_date: `${currentYear}-07-10`, value_per_quota: 50000 });
  const [payment, setPayment] = useState(null);

  const cyclesQuery = useQuery({ queryKey: ["fund-cycles", activeCompany?.id], queryFn: () => getFundCycles(activeCompany?.id) });
  const membersQuery = useQuery({ queryKey: ["fund-members", activeCompany?.id], queryFn: () => getFundMembers(activeCompany?.id) });
  const quotasQuery = useQuery({ queryKey: ["fund-quotas", activeCompany?.id, selectedCycleId], queryFn: () => getFundQuotas(activeCompany?.id, selectedCycleId) });
  const contributionsQuery = useQuery({
    queryKey: ["fund-contributions", activeCompany?.id, selectedCycleId, selectedYear],
    queryFn: () => getFundContributions(activeCompany?.id, {
      cycle_id: selectedCycleId || undefined,
      year: selectedYear || undefined
    })
  });

  const selectedCycle = useMemo(
    () => (cyclesQuery.data ?? []).find((cycle) => cycle.id === quotaForm.cycle_id),
    [cyclesQuery.data, quotaForm.cycle_id]
  );
  const projectedMonthly = Number(quotaForm.quota_count || 0) * Number(selectedCycle?.monthly_contribution || 0);

  const contributions = contributionsQuery.data ?? [];
  const matrix = useMemo(() => {
    const byMember = new Map();

    for (const quota of quotasQuery.data ?? []) {
      byMember.set(quota.member_id, {
        member_id: quota.member_id,
        member_name: quota.member_name,
        quota_count: quota.quota_count,
        ordinary: {},
        extraordinary: [],
        overdue: 0,
        pending: 0
      });
    }

    for (const item of contributions) {
      const row = byMember.get(item.member_id) ?? {
        member_id: item.member_id,
        member_name: item.member_name,
        quota_count: item.quota_count,
        ordinary: {},
        extraordinary: [],
        overdue: 0,
        pending: 0
      };

      if (item.contribution_type === "ordinary") {
        row.ordinary[item.month] = item;
      } else {
        row.extraordinary.push(item);
      }

      row.pending += Number(item.pending_amount || 0);
      if (item.status === "overdue") row.overdue += Number(item.pending_amount || 0);
      byMember.set(item.member_id, row);
    }

    return Array.from(byMember.values()).sort((a, b) => a.member_name.localeCompare(b.member_name));
  }, [contributions, quotasQuery.data]);

  const totals = contributions.reduce(
    (acc, item) => ({
      expected: acc.expected + Number(item.expected_amount || 0),
      paid: acc.paid + Number(item.paid_amount || 0),
      pending: acc.pending + Number(item.pending_amount || 0),
      overdue: acc.overdue + (item.status === "overdue" ? 1 : 0),
      extraordinary: acc.extraordinary + (item.contribution_type === "extraordinary" ? Number(item.expected_amount || 0) : 0)
    }),
    { expected: 0, paid: 0, pending: 0, overdue: 0, extraordinary: 0 }
  );

  const quotaMutation = useMutation({
    mutationFn: (payload) => saveFundQuota(payload),
    onSuccess: async () => {
      toast.success("Cupos asignados y cuotas ordinarias generadas");
      setQuotaForm({ member_id: "", cycle_id: "", quota_count: 1, status: "active" });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-quotas"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-contributions"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-members"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible asignar cupos"))
  });

  const generateMutation = useMutation({
    mutationFn: () => generateFundContributions({ company_id: activeCompany?.id, cycle_id: selectedCycleId }),
    onSuccess: async (result) => {
      toast.success(`Cuotas ordinarias procesadas: ${result.generated}`);
      await queryClient.invalidateQueries({ queryKey: ["fund-contributions"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible generar cuotas"))
  });

  const extraMutation = useMutation({
    mutationFn: () => generateExtraordinaryContribution({
      ...extraForm,
      company_id: activeCompany?.id,
      cycle_id: selectedCycleId,
      value_per_quota: Number(extraForm.value_per_quota)
    }),
    onSuccess: async (result) => {
      toast.success(`Extraordinarias generadas: ${result.generated}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-contributions"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible generar la extraordinaria"))
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

  function submitQuota(event) {
    event.preventDefault();
    quotaMutation.mutate({
      ...quotaForm,
      company_id: activeCompany?.id,
      quota_count: Number(quotaForm.quota_count)
    });
    setSelectedCycleId(quotaForm.cycle_id || selectedCycleId);
  }

  function openPayment(item) {
    setPayment({
      ...item,
      paid_amount: item.paid_amount || item.expected_amount,
      payment_date: new Date().toISOString().slice(0, 10),
      payment_method: "transferencia",
      notes: ""
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fondo solidario"
        title="Cuotas mensuales"
        description="Gestiona cupos, cuotas ordinarias enero-noviembre, extraordinarias, pagos y mora basica."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Esperado" value={totals.expected} accent="bg-brand-500" />
        <StatCard label="Recaudado" value={totals.paid} accent="bg-emerald-500" />
        <StatCard label="Pendiente" value={totals.pending} accent="bg-amber-500" />
        <StatCard label="Extraordinarias" value={totals.extraordinary} accent="bg-cyan-500" />
        <StatCard label="Vencidas" value={totals.overdue} accent="bg-rose-500" formatter={integer} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
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
          <div className="grid gap-3 md:grid-cols-[1fr_120px_auto] md:items-end">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Ciclo</span>
              <select className="input-light mt-2" value={selectedCycleId} onChange={(event) => setSelectedCycleId(event.target.value)}>
                <option value="">Todos los ciclos</option>
                {(cyclesQuery.data ?? []).map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.name} ({cycle.year})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Anio</span>
              <input className="input-light mt-2" type="number" min="2000" value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} />
            </label>
            <button className="btn-secondary" type="button" disabled={!selectedCycleId || generateMutation.isPending} onClick={() => generateMutation.mutate()}>
              Regenerar ordinarias
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-950">Generar cuota extraordinaria</h4>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_150px_150px_auto]">
              <input className="input-light" value={extraForm.title} onChange={(event) => setExtraForm({ ...extraForm, title: event.target.value })} placeholder="Nombre" />
              <input className="input-light" type="date" value={extraForm.due_date} onChange={(event) => setExtraForm({ ...extraForm, due_date: event.target.value })} />
              <input className="input-light" type="number" min="1" value={extraForm.value_per_quota} onChange={(event) => setExtraForm({ ...extraForm, value_per_quota: event.target.value })} placeholder="Valor por cupo" />
              <button className="btn-primary" type="button" disabled={!selectedCycleId || extraMutation.isPending} onClick={() => extraMutation.mutate()}>
                Generar
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="panel-soft p-6">
        <h3 className="text-lg font-semibold text-slate-950">Panel de cuotas</h3>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-[1180px] divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Miembro</th>
                <th className="px-4 py-3">Cupos</th>
                {ordinaryMonths.map(([, label]) => <th key={label} className="px-3 py-3 text-center">{label}</th>)}
                <th className="px-4 py-3">Extra</th>
                <th className="px-4 py-3">Mora</th>
                <th className="px-4 py-3">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {matrix.map((row) => (
                <tr key={row.member_id}>
                  <td className="px-4 py-3 font-semibold text-slate-950">{row.member_name}</td>
                  <td className="px-4 py-3 text-slate-600">{row.quota_count}</td>
                  {ordinaryMonths.map(([month]) => (
                    <td key={month} className="px-3 py-3 text-center">
                      <StatusPill item={row.ordinary[month]} onClick={openPayment} />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {row.extraordinary.map((item) => (
                        <StatusPill key={item.id} item={item} onClick={openPayment} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-rose-600">{currency(row.overdue)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-950">{currency(row.pending)}</td>
                </tr>
              ))}
              {!contributionsQuery.isLoading && matrix.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-slate-500" colSpan="16">Asigna cupos para generar cuotas ordinarias automaticamente.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {payment ? (
        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Registrar pago de {payment.member_name}</h3>
          <p className="mt-1 text-sm text-slate-500">{payment.title} | Esperado: {currency(payment.expected_amount)}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-[160px_170px_1fr_auto]">
            <input className="input-light" type="number" min="0" value={payment.paid_amount} onChange={(event) => setPayment({ ...payment, paid_amount: event.target.value })} />
            <input className="input-light" type="date" value={payment.payment_date} onChange={(event) => setPayment({ ...payment, payment_date: event.target.value })} />
            <input className="input-light" value={payment.payment_method} onChange={(event) => setPayment({ ...payment, payment_method: event.target.value })} placeholder="Metodo de pago" />
            <div className="flex gap-3">
              <button className="btn-primary" type="button" disabled={paymentMutation.isPending} onClick={() => paymentMutation.mutate()}>Guardar</button>
              <button className="btn-secondary" type="button" onClick={() => setPayment(null)}>Cancelar</button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default FundQuotasPage;
