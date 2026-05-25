import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { formatCurrency, formatDate, integer, percent } from "../../utils/format.js";

function PublicKpiCard({ label, value, tone = "navy" }) {
  const tones = {
    emerald: "border-emerald-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(236,253,245,0.94))] text-emerald-950",
    cyan: "border-cyan-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(236,254,255,0.94))] text-cyan-950",
    amber: "border-amber-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,251,235,0.94))] text-amber-950",
    rose: "border-rose-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,241,242,0.94))] text-rose-950",
    navy: "border-slate-200/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(241,245,249,0.96))] text-slate-950"
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)] ${tones[tone] ?? tones.navy}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(15,23,42,0.9),rgba(14,165,233,0.65),rgba(16,185,129,0.5))] opacity-70 transition group-hover:opacity-100" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight md:text-[2rem]">{value}</p>
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
    <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/60 bg-[linear-gradient(160deg,#0f172a_0%,#0f3b5b_55%,#0ea5e9_140%)] text-xl font-semibold tracking-[0.18em] text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-[1px] rounded-[26px] border border-white/10" />
      <span className="relative">{initials}</span>
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
  const isFundLike = data?.dashboardType === "fund_like";
  const kpiRows = isFundLike
    ? [
        [
          ["Capital recaudado", formatCurrency(cards.capitalRecaudado ?? 0), "emerald"],
          ["Intereses", formatCurrency(cards.interesesPrestamos ?? 0), "cyan"],
          ["Capital mas intereses", formatCurrency(cards.totalCapitalMasIntereses ?? 0), "navy"],
          ["Prestamos activos", integer(cards.prestamosActivos ?? 0), "rose"]
        ],
        [
          ["Caja disponible", formatCurrency(cards.cajaDisponible ?? 0), "emerald"],
          ["Cartera pendiente", formatCurrency(cards.carteraPendiente ?? 0), "cyan"],
          ["Cumplimiento cartera", percent(cards.porcentajeCumplimiento ?? 0), "amber"],
          ["Recaudo del mes", formatCurrency(cards.recaudoDelMes ?? 0), "navy"]
        ],
        [
          ["Miembros activos", integer(cards.miembrosActivos ?? 0), "navy"],
          ["Cuotas pagadas", integer(cards.cuotasPagadas ?? 0), "emerald"],
          ["Cuotas pendientes", integer(cards.cuotasPendientes ?? 0), "amber"],
          ["Cuotas abiertas", integer(cards.cuotasAbiertas ?? 0), "rose"]
        ]
      ]
    : [
        [
          ["Aportes participantes", formatCurrency(cards.aportesParticipantes ?? 0), "emerald"],
          ["Otros ingresos", formatCurrency(cards.otrosIngresos ?? 0), "cyan"],
          ["Ingresos generales", formatCurrency(cards.totalIngresosGenerales ?? 0), "navy"],
          ["Total gastos", formatCurrency(cards.totalGastos ?? 0), "rose"]
        ],
        [
          ["Total recaudado", formatCurrency(cards.totalRecaudado ?? 0), "emerald"],
          ["Saldo actual caja", formatCurrency(cards.saldoActualCaja ?? 0), "cyan"],
          ["Cumplimiento meta", percent(cards.porcentajeCumplimiento ?? 0), "amber"],
          ["Recaudo del mes", formatCurrency(cards.recaudoDelMes ?? 0), "navy"]
        ],
        [
          ["Participantes", integer(cards.totalParticipantes ?? 0), "navy"],
          ["Pagos completos", integer(cards.participantesCompletos ?? 0), "emerald"],
          ["Pendientes", integer(cards.participantesPendientes ?? 0), "amber"],
          ["Aportes pendientes", formatCurrency(cards.aportesPendientes ?? 0), "rose"]
        ]
      ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef4fb_42%,_#ffffff_100%)] text-slate-950">
      <div className="mx-auto max-w-[118rem] px-4 py-5 sm:px-6 lg:px-10 lg:py-10 xl:px-12 2xl:px-16">
        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white/88 shadow-[0_32px_90px_rgba(15,23,42,0.08)] backdrop-blur">
          <section className="relative overflow-hidden border-b border-slate-100 px-5 py-8 sm:px-8 lg:px-12 lg:py-10 xl:px-14">
            <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(90deg,_rgba(15,23,42,0.06),_rgba(14,165,233,0.12),_rgba(16,185,129,0.10))]" />
            <div className="absolute -right-20 top-10 h-48 w-48 rounded-full bg-cyan-200/25 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-slate-200/55 blur-3xl" />
            <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)] xl:items-end">
              <div className="flex items-start gap-5">
                <CompanyMark name={data?.company?.name} />
                <div className="min-w-0">
                  <div className="inline-flex items-center rounded-full border border-cyan-200/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-800 shadow-sm">
                    Portal Publico Informativo
                  </div>
                  <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl xl:text-5xl">
                    {data?.company?.name ?? "Portal financiero"}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base xl:text-[1.02rem]">
                    {isFundLike
                      ? "Consulta publica de capital colectivo, cartera e indicadores agregados del fondo. Este espacio es exclusivamente informativo y no permite operaciones administrativas."
                      : "Consulta publica de indicadores generales del recaudo y estado financiero. Este espacio es exclusivamente informativo y no permite operaciones administrativas."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Portal
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">Informativo y solo lectura</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/90 bg-white/80 px-4 py-3 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Actualizado
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(data?.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[30px] border border-slate-200/90 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(241,245,249,0.92))] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Panorama general
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {percent(cards.porcentajeCumplimiento ?? 0)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {isFundLike
                      ? "Nivel de recuperacion de cartera y capital consolidado del fondo."
                      : "Nivel de cumplimiento sobre la meta consolidada de la empresa o fondo."}
                  </p>
                </div>
                <div className="rounded-[30px] border border-slate-200/90 bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(15,59,91,0.92),rgba(8,47,73,0.95))] p-5 text-white shadow-[0_22px_55px_rgba(15,23,42,0.14)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/90">
                    Acceso publico
                  </p>
                  <p className="mt-3 text-xl font-semibold">Consulta segura</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Visualizacion corporativa de indicadores agregados, sin datos personales ni modulos internos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {dashboardQuery.isError ? (
            <div className="px-5 py-10 sm:px-8 lg:px-12 xl:px-14">
              <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
                {getApiErrorMessage(dashboardQuery.error, "No fue posible cargar el portal publico")}
              </div>
            </div>
          ) : (
            <>
              <section className="px-5 py-8 sm:px-8 lg:px-12 xl:px-14">
                {kpiRows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={`${rowIndex > 0 ? "mt-5" : ""} grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4`}
                  >
                    {row.map(([label, value, tone]) => (
                      <PublicKpiCard key={label} label={label} value={value} tone={tone} />
                    ))}
                  </div>
                ))}
              </section>

              <section className="grid gap-6 border-t border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.6),rgba(255,255,255,0.94))] px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.85fr)] lg:px-12 xl:px-14">
                <article className="rounded-[30px] border border-slate-200/90 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Lectura financiera general
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 lg:text-[2rem]">Resumen del estado actual</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 lg:text-[0.98rem]">
                    {isFundLike
                      ? "La vista publica consolida capital recaudado, cartera pendiente, actividad de prestamos y caja disponible. No incluye miembros individuales, movimientos privados ni datos de contacto."
                      : "La vista publica consolida el comportamiento general del recaudo, la meta acumulada y el balance de caja. No incluye participantes individuales, movimientos privados ni datos de contacto."}
                  </p>
                  <div className="mt-7 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,_#0f172a,_#0ea5e9,_#10b981)]"
                      style={{
                        width: `${Math.max(0, Math.min(cards.porcentajeCumplimiento ?? 0, 100))}%`
                      }}
                    />
                  </div>
                  <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>{isFundLike ? "Avance sobre la recuperacion consolidada" : "Avance sobre la meta general"}</span>
                    <span className="font-semibold text-slate-900">{percent(cards.porcentajeCumplimiento ?? 0)}</span>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {isFundLike ? "Caja disponible" : "Caja actual"}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {formatCurrency(isFundLike ? cards.cajaDisponible ?? 0 : cards.saldoActualCaja ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {isFundLike ? "Intereses" : "Recaudo mensual"}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {formatCurrency(isFundLike ? cards.interesesPrestamos ?? 0 : cards.recaudoDelMes ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {isFundLike ? "Prestamos activos" : "Pendiente"}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {isFundLike
                          ? integer(cards.prestamosActivos ?? 0)
                          : formatCurrency(cards.aportesPendientes ?? 0)}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[30px] border border-slate-200/90 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Alcance del portal
                  </p>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                    <li className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                      {isFundLike
                        ? "Informacion agregada y publica sobre capital, cartera y prestamos del fondo."
                        : "Informacion agregada y publica del recaudo."}
                    </li>
                    <li className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">Sin autenticacion ni acceso a modulos internos.</li>
                    <li className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">Sin nombres, documentos, correos, telefonos o datos bancarios.</li>
                    <li className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">Disponible solo cuando la empresa habilita expresamente este portal.</li>
                  </ul>
                  <div className="mt-6 rounded-[24px] border border-cyan-100 bg-[linear-gradient(145deg,rgba(239,246,255,0.95),rgba(236,254,255,0.92))] px-5 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-800">
                      Timestamp
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{formatDate(data?.updatedAt)}</p>
                    <p className="mt-1 text-sm text-slate-600">Ultima fecha de consolidacion visible para visitantes.</p>
                  </div>
                </article>
              </section>

              <footer className="border-t border-slate-100 bg-white/70 px-5 py-5 text-sm text-slate-500 sm:px-8 lg:px-12 xl:px-14">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <p className="font-medium text-slate-700">Portal publico informativo</p>
                  <p>Consulta de solo lectura con indicadores agregados y actualizacion visible al cierre registrado.</p>
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicCompanyDashboardPage;
