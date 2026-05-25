import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { formatCurrency, formatDate, integer, percent } from "../../utils/format.js";

function PublicKpiCard({ label, value, tone = "navy" }) {
  const tones = {
    emerald: "from-emerald-500/15 to-emerald-100 border-emerald-200 text-emerald-950",
    cyan: "from-cyan-500/15 to-cyan-100 border-cyan-200 text-cyan-950",
    amber: "from-amber-500/15 to-amber-100 border-amber-200 text-amber-950",
    rose: "from-rose-500/15 to-rose-100 border-rose-200 text-rose-950",
    navy: "from-slate-900/10 to-slate-100 border-slate-200 text-slate-950"
  };

  return (
    <article
      className={`rounded-[28px] border bg-gradient-to-br p-5 shadow-sm ${tones[tone] ?? tones.navy}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function CompanyMark({ name }) {
  const initials = useMemo(() => {
    return (name ?? "PF")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() ?? "")
      .join("");
  }, [name]);

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-950 text-lg font-semibold text-white shadow-lg shadow-slate-900/20">
      {initials}
    </div>
  );
}

export function PublicCompanyDashboardPage() {
  const { slug } = useParams();

  const dashboardQuery = useQuery({
    queryKey: ["public-dashboard", slug],
    queryFn: async () => {
      const response = await api.get(`/public/company/${slug}/dashboard`);
      return response.data.data;
    },
    enabled: Boolean(slug),
    retry: false
  });

  const data = dashboardQuery.data;
  const cards = data?.cards ?? {};

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_45%,_#ffffff_100%)] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="overflow-hidden rounded-[36px] border border-white/80 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <section className="relative overflow-hidden border-b border-slate-100 px-6 py-8 sm:px-8 lg:px-10">
            <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(90deg,_rgba(15,23,42,0.04),_rgba(14,165,233,0.12),_rgba(16,185,129,0.08))]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <CompanyMark name={data?.company?.name} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Portal Publico Informativo
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {data?.company?.name ?? "Portal financiero"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                    Consulta publica de indicadores generales del recaudo y estado financiero. Este espacio es
                    exclusivamente informativo y no permite operaciones administrativas.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Ultima actualizacion
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {formatDate(data?.updatedAt)}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Acceso</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">Solo lectura</p>
                </div>
              </div>
            </div>
          </section>

          {dashboardQuery.isError ? (
            <div className="px-6 py-10 sm:px-8 lg:px-10">
              <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {getApiErrorMessage(dashboardQuery.error, "No fue posible cargar el portal publico")}
              </div>
            </div>
          ) : (
            <>
              <section className="px-6 py-8 sm:px-8 lg:px-10">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <PublicKpiCard
                    label="Aportes participantes"
                    value={formatCurrency(cards.aportesParticipantes ?? 0)}
                    tone="emerald"
                  />
                  <PublicKpiCard
                    label="Otros ingresos"
                    value={formatCurrency(cards.otrosIngresos ?? 0)}
                    tone="cyan"
                  />
                  <PublicKpiCard
                    label="Ingresos generales"
                    value={formatCurrency(cards.totalIngresosGenerales ?? 0)}
                    tone="navy"
                  />
                  <PublicKpiCard
                    label="Total gastos"
                    value={formatCurrency(cards.totalGastos ?? 0)}
                    tone="rose"
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <PublicKpiCard
                    label="Total recaudado"
                    value={formatCurrency(cards.totalRecaudado ?? 0)}
                    tone="emerald"
                  />
                  <PublicKpiCard
                    label="Saldo actual caja"
                    value={formatCurrency(cards.saldoActualCaja ?? 0)}
                    tone="cyan"
                  />
                  <PublicKpiCard
                    label="Cumplimiento meta"
                    value={percent(cards.porcentajeCumplimiento ?? 0)}
                    tone="amber"
                  />
                  <PublicKpiCard
                    label="Recaudo del mes"
                    value={formatCurrency(cards.recaudoDelMes ?? 0)}
                    tone="navy"
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <PublicKpiCard
                    label="Participantes"
                    value={integer(cards.totalParticipantes ?? 0)}
                    tone="navy"
                  />
                  <PublicKpiCard
                    label="Pagos completos"
                    value={integer(cards.participantesCompletos ?? 0)}
                    tone="emerald"
                  />
                  <PublicKpiCard
                    label="Pendientes"
                    value={integer(cards.participantesPendientes ?? 0)}
                    tone="amber"
                  />
                  <PublicKpiCard
                    label="Aportes pendientes"
                    value={formatCurrency(cards.aportesPendientes ?? 0)}
                    tone="rose"
                  />
                </div>
              </section>

              <section className="grid gap-6 border-t border-slate-100 bg-slate-50/70 px-6 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Lectura financiera general
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-950">Resumen del estado actual</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    La vista publica consolida el comportamiento general del recaudo, la meta acumulada y el balance
                    de caja. No incluye participantes individuales, movimientos privados ni datos de contacto.
                  </p>
                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,_#0f172a,_#0ea5e9,_#10b981)]"
                      style={{
                        width: `${Math.max(0, Math.min(cards.porcentajeCumplimiento ?? 0, 100))}%`
                      }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>Avance sobre la meta general</span>
                    <span className="font-semibold text-slate-900">{percent(cards.porcentajeCumplimiento ?? 0)}</span>
                  </div>
                </article>

                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Alcance del portal
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <li>Informacion agregada y publica del recaudo.</li>
                    <li>Sin autenticacion ni acceso a modulos internos.</li>
                    <li>Sin nombres, documentos, correos, telefonos o datos bancarios.</li>
                    <li>Disponible solo cuando la empresa habilita expresamente este portal.</li>
                  </ul>
                </article>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicCompanyDashboardPage;
