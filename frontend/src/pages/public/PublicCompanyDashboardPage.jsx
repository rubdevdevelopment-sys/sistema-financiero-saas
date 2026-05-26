import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { formatCurrency, formatDate, integer, percent } from "../../utils/format.js";

function PublicKpiCard({ label, value }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/95 p-5 text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}

function PublicError({ error }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
        {getApiErrorMessage(error, "No fue posible cargar el portal publico")}
      </div>
    </div>
  );
}

function FitnessPortal({ data }) {
  const portal = data.portal ?? {};
  const cards = data.cards ?? {};

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: `radial-gradient(circle at top left, ${portal.accent_color || "#84cc16"}33, transparent 26%), radial-gradient(circle at top right, ${portal.secondary_color || "#0f172a"}55, transparent 30%), linear-gradient(180deg, #08111a 0%, #0f172a 42%, #111827 100%)`
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <section className="overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur sm:p-10 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-lime-300/40 bg-lime-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-lime-200">Portal fitness premium</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{portal.gym_name || data.company?.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200">{portal.hero_title || "Rendimiento, disciplina y progreso medible."}</p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{portal.hero_subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a className="inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg" href={portal.portal_cta_url || "/login"} style={{ backgroundColor: portal.accent_color || "#84cc16" }}>
                  {portal.portal_cta_text || "Iniciar ahora"}
                </a>
                <Link className="inline-flex items-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10" to="/login">
                  Login clientes
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <PublicKpiCard label="Clientes activos" value={integer(cards.clientesActivos ?? 0)} />
              <PublicKpiCard label="Rutinas activas" value={integer(cards.rutinasActivas ?? 0)} />
              <PublicKpiCard label="Entrenos del mes" value={integer(cards.entrenamientosMes ?? 0)} />
              <PublicKpiCard label="Carga del mes" value={`${integer(cards.cargaMensualKg ?? 0)} kg`} />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">Horarios</p>
            <p className="mt-4 text-lg font-semibold">{portal.hours_summary || "Lunes a sabado · 5:00 a.m. - 10:00 p.m."}</p>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">Contacto</p>
            <p className="mt-4 text-lg font-semibold">{portal.contact_phone || "Sin telefono"}</p>
            <p className="mt-2 text-sm text-slate-300">{portal.contact_email || "Sin correo publico"}</p>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">Membresias por vencer</p>
            <p className="mt-4 text-lg font-semibold">{integer(cards.membresiasPorVencer ?? 0)}</p>
            <p className="mt-2 text-sm text-slate-300">Seguimiento preventivo y renovacion oportuna.</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {(portal.plans?.length ? portal.plans : [{ name: "Mensual", price: "$180.000", description: "Acceso completo al piso y seguimiento base." }]).map((plan) => (
            <article key={`${plan.name}-${plan.price}`} className="rounded-[32px] border border-white/10 bg-white p-6 text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{plan.label || "Plan fitness"}</p>
              <h3 className="mt-3 text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-3 text-3xl font-semibold">{plan.price}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{plan.description || "Entrenamiento y acompanamiento personalizado."}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">Entrenadores</p>
            <div className="mt-5 grid gap-4">
              {(portal.trainers?.length ? portal.trainers : [{ name: "Coach principal", role: "Strength & Conditioning", bio: "Metodologia enfocada en progreso medible, tecnica y adherencia." }]).map((trainer) => (
                <div key={trainer.name} className="rounded-[28px] border border-white/10 bg-white/10 p-4">
                  <p className="font-semibold">{trainer.name}</p>
                  <p className="mt-1 text-sm text-lime-200">{trainer.role}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{trainer.bio}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">Testimonios</p>
            <div className="mt-5 grid gap-4">
              {(portal.testimonials?.length ? portal.testimonials : [{ name: "Atleta RubDev", quote: "La experiencia combina orden, energia y seguimiento real.", goal: "Recomposicion corporal" }]).map((testimonial) => (
                <div key={testimonial.name} className="rounded-[28px] border border-white/10 bg-white/10 p-4">
                  <p className="text-sm leading-7 text-slate-100">"{testimonial.quote}"</p>
                  <p className="mt-3 font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-lime-200">{testimonial.goal || "Fitness"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-10 text-sm text-slate-300">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>{portal.address || data.company?.name}</p>
            <p>Actualizado {formatDate(data.updatedAt)}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function StandardPortal({ data }) {
  const cards = data?.cards ?? {};
  const isFundLike = data?.dashboardType === "fund_like";
  const kpiRows = isFundLike
    ? [
        ["Capital recaudado", formatCurrency(cards.capitalRecaudado ?? 0)],
        ["Intereses", formatCurrency(cards.interesesPrestamos ?? 0)],
        ["Caja disponible", formatCurrency(cards.cajaDisponible ?? 0)],
        ["Prestamos activos", integer(cards.prestamosActivos ?? 0)]
      ]
    : [
        ["Total recaudado", formatCurrency(cards.totalRecaudado ?? 0)],
        ["Saldo actual caja", formatCurrency(cards.saldoActualCaja ?? 0)],
        ["Cumplimiento meta", percent(cards.porcentajeCumplimiento ?? 0)],
        ["Participantes", integer(cards.totalParticipantes ?? 0)]
      ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef4fb_42%,_#ffffff_100%)] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="rounded-[36px] border border-white/70 bg-white/90 p-8 shadow-[0_32px_90px_rgba(15,23,42,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-800">Portal publico informativo</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">{data.company?.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Consulta de solo lectura con indicadores agregados y actualizacion visible al cierre registrado.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiRows.map(([label, value]) => <PublicKpiCard key={label} label={label} value={value} />)}
          </div>
        </div>
      </div>
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

  if (dashboardQuery.isError) {
    return <PublicError error={dashboardQuery.error} />;
  }

  if (dashboardQuery.isLoading) {
    return <div className="min-h-screen bg-slate-950 px-4 py-16 text-center text-sm text-slate-300">Cargando portal publico...</div>;
  }

  return dashboardQuery.data?.dashboardType === "fitness" ? <FitnessPortal data={dashboardQuery.data} /> : <StandardPortal data={dashboardQuery.data} />;
}

export default PublicCompanyDashboardPage;
