import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import {
  approveFundLoan,
  getFundCycles,
  getFundLoanInstallments,
  getFundLoans,
  getFundMembers,
  registerFundLoanInstallmentPayment,
  saveFundLoan
} from "../../services/fund.service.js";
import { queryClient } from "../../services/queryClient.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { currency, integer } from "../../utils/format.js";

const today = new Date().toISOString().slice(0, 10);

const emptyLoan = {
  member_id: "",
  cycle_id: "",
  principal_amount: 1000000,
  interest_rate: 5,
  installment_count: 5,
  first_due_date: today,
  status: "draft",
  notes: ""
};

function statusClass(status) {
  if (status === "paid") return "status-badge status-ok";
  if (status === "overdue") return "status-badge status-danger-soft";
  if (status === "partial" || status === "active") return "status-badge status-warn";
  return "status-badge";
}

export function FundLoansPage() {
  const { activeCompany } = useActiveCompany();
  const [form, setForm] = useState(emptyLoan);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [payment, setPayment] = useState(null);

  const membersQuery = useQuery({ queryKey: ["fund-members", activeCompany?.id], queryFn: () => getFundMembers(activeCompany?.id) });
  const cyclesQuery = useQuery({ queryKey: ["fund-cycles", activeCompany?.id], queryFn: () => getFundCycles(activeCompany?.id) });
  const loansQuery = useQuery({ queryKey: ["fund-loans", activeCompany?.id], queryFn: () => getFundLoans(activeCompany?.id) });
  const installmentsQuery = useQuery({
    queryKey: ["fund-loan-installments", activeCompany?.id, selectedLoanId],
    queryFn: () => getFundLoanInstallments(activeCompany?.id, selectedLoanId)
  });

  const projected = useMemo(() => {
    const principal = Number(form.principal_amount || 0);
    const monthlyInterest = principal * (Number(form.interest_rate || 0) / 100);
    const totalInterest = monthlyInterest * Number(form.installment_count || 1);
    const total = principal + totalInterest;
    const finalInstallment = principal + monthlyInterest;
    return { total, monthlyInterest, totalInterest, finalInstallment };
  }, [form.installment_count, form.interest_rate, form.principal_amount]);

  const totals = (loansQuery.data ?? []).reduce(
    (acc, loan) => ({
      activePortfolio: acc.activePortfolio + (["approved", "active", "overdue"].includes(loan.status) ? Number(loan.outstanding_balance || 0) : 0),
      interest: acc.interest + Number(loan.total_interest || 0),
      pendingInterest: acc.pendingInterest + Number(loan.pending_interest || 0),
      pending: acc.pending + Number(loan.outstanding_balance || 0),
      collected: acc.collected + Number(loan.paid_amount || 0),
      overdue: acc.overdue + (loan.status === "overdue" ? 1 : 0)
    }),
    { activePortfolio: 0, interest: 0, pendingInterest: 0, pending: 0, collected: 0, overdue: 0 }
  );

  const createMutation = useMutation({
    mutationFn: (payload) => saveFundLoan(payload),
    onSuccess: async () => {
      toast.success("Prestamo creado");
      setForm(emptyLoan);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-loans"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-loan-installments"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible crear el prestamo"))
  });

  const approveMutation = useMutation({
    mutationFn: (loan) => approveFundLoan(loan.id, { company_id: activeCompany?.id }),
    onSuccess: async () => {
      toast.success("Prestamo aprobado y cuotas generadas");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-loans"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-loan-installments"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible aprobar el prestamo"))
  });

  const paymentMutation = useMutation({
    mutationFn: () => registerFundLoanInstallmentPayment(payment.id, {
      paid_amount: Number(payment.paid_amount),
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      notes: payment.notes
    }),
    onSuccess: async () => {
      toast.success("Pago de prestamo registrado");
      setPayment(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-loans"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-loan-installments"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible registrar el pago"))
  });

  function submit(event) {
    event.preventDefault();
    createMutation.mutate({
      ...form,
      company_id: activeCompany?.id,
      principal_amount: Number(form.principal_amount),
      interest_rate: Number(form.interest_rate),
      installment_count: Number(form.installment_count)
    });
  }

  function openPayment(installment) {
    setPayment({
      ...installment,
      paid_amount: installment.paid_amount || installment.expected_amount,
      payment_date: today,
      payment_method: "transferencia",
      notes: ""
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fondo solidario"
        title="Prestamos internos"
        description="Modelo fondo solidario: intereses mensuales y capital completo en la ultima cuota."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Capital prestado" value={totals.activePortfolio} accent="bg-brand-500" />
        <StatCard label="Intereses pendientes" value={totals.pendingInterest} accent="bg-emerald-500" />
        <StatCard label="Recaudo prestamos" value={totals.collected} accent="bg-sky-500" />
        <StatCard label="Saldo pendiente" value={totals.pending} accent="bg-amber-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Intereses totales" value={totals.interest} accent="bg-cyan-500" />
        <StatCard label="Prestamos vencidos" value={totals.overdue} accent="bg-rose-500" formatter={integer} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form className="panel-soft p-6" onSubmit={submit}>
          <h3 className="text-lg font-semibold text-slate-950">Nuevo prestamo</h3>
          <div className="mt-5 grid gap-4">
            <select className="input-light" value={form.member_id} onChange={(event) => setForm({ ...form, member_id: event.target.value })} required>
              <option value="">Seleccionar miembro</option>
              {(membersQuery.data ?? []).map((member) => <option key={member.id} value={member.id}>{member.full_name}</option>)}
            </select>
            <select className="input-light" value={form.cycle_id} onChange={(event) => setForm({ ...form, cycle_id: event.target.value })} required>
              <option value="">Seleccionar ciclo</option>
              {(cyclesQuery.data ?? []).map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.name} ({cycle.year})</option>)}
            </select>
            <input className="input-light" type="number" min="1" value={form.principal_amount} onChange={(event) => setForm({ ...form, principal_amount: event.target.value })} placeholder="Capital" required />
            <input className="input-light" type="number" min="0" step="0.01" value={form.interest_rate} onChange={(event) => setForm({ ...form, interest_rate: event.target.value })} placeholder="Interes %" required />
            <input className="input-light" type="number" min="1" value={form.installment_count} onChange={(event) => setForm({ ...form, installment_count: event.target.value })} placeholder="Numero de cuotas" required />
            <input className="input-light" type="date" value={form.first_due_date} onChange={(event) => setForm({ ...form, first_due_date: event.target.value })} required />
            <select className="input-light" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="draft">Borrador</option>
              <option value="approved">Crear aprobado</option>
            </select>
            <textarea className="input-light" rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notas" />
            <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-slate-700">
              Interes mensual: <strong>{currency(projected.monthlyInterest)}</strong>
              <br />
              Ultima cuota: <strong>{currency(projected.finalInstallment)}</strong> | Total: <strong>{currency(projected.total)}</strong>
            </div>
            <button className="btn-primary" type="submit" disabled={createMutation.isPending}>Crear prestamo</button>
          </div>
        </form>

        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Prestamos registrados</h3>
          <div className="mt-5 space-y-3">
            {(loansQuery.data ?? []).map((loan) => (
              <article key={loan.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{loan.member_name}</p>
                    <p className="text-sm text-slate-500">
                      {loan.cycle_name} | {loan.installment_count - 1} intereses de {currency(loan.monthly_interest_amount)} y cierre de {currency(Number(loan.principal_amount) + Number(loan.monthly_interest_amount))}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={statusClass(loan.status)}>{loan.status}</span>
                    <button className="btn-secondary" type="button" onClick={() => setSelectedLoanId(loan.id)}>Ver cuotas</button>
                    {loan.status === "draft" ? (
                      <button className="btn-primary" type="button" onClick={() => approveMutation.mutate(loan)}>Aprobar</button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                  <p>Capital: {currency(loan.principal_amount)}</p>
                  <p>Total: {currency(loan.total_payable || loan.total_amount)}</p>
                  <p>Saldo: {currency(loan.outstanding_balance)}</p>
                  <p>Interes: {Number(loan.interest_rate).toFixed(2)}%</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="panel-soft p-6">
        <h3 className="text-lg font-semibold text-slate-950">Cuotas de prestamo</h3>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Cuota</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Vence</th>
                <th className="px-4 py-3">Esperado</th>
                <th className="px-4 py-3">Pagado</th>
                <th className="px-4 py-3">Pendiente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(installmentsQuery.data ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">#{item.installment_number}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.installment_type === "final_settlement" ? "Interes + capital" : "Solo interes"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.due_date}</td>
                  <td className="px-4 py-3">{currency(item.expected_amount)}</td>
                  <td className="px-4 py-3">{currency(item.paid_amount)}</td>
                  <td className="px-4 py-3">{currency(item.pending_amount)}</td>
                  <td className="px-4 py-3"><span className={statusClass(item.status)}>{item.status}</span></td>
                  <td className="px-4 py-3"><button className="btn-secondary" type="button" onClick={() => openPayment(item)}>Registrar pago</button></td>
                </tr>
              ))}
              {!installmentsQuery.isLoading && (installmentsQuery.data ?? []).length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-slate-500" colSpan="8">Selecciona un prestamo para ver sus cuotas.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {payment ? (
        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Registrar pago cuota #{payment.installment_number}</h3>
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

export default FundLoansPage;
