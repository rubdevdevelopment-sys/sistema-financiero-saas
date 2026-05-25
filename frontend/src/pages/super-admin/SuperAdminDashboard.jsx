import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api.js";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { formatDate, integer } from "../../utils/format.js";

export function SuperAdminDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ["super-admin-dashboard"],
    queryFn: async () => {
      const response = await api.get("/super-admin/dashboard");
      return response.data.data;
    }
  });

  const data = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RubDev Plataforma"
        title="Dashboard global SaaS"
        description="Vista ejecutiva de plataforma sin exponer recaudos ni datos financieros internos de clientes."
        action={
          <Link className="btn-primary" to="/super-admin/empresas">
            Gestionar empresas
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Empresas activas"
          value={data?.cards?.activeCompanies ?? 0}
          accent="bg-sky-600"
          formatter={integer}
        />
        <StatCard
          label="Empresas totales"
          value={data?.cards?.totalCompanies ?? 0}
          accent="bg-slate-900"
          formatter={integer}
        />
        <StatCard
          label="Usuarios registrados"
          value={data?.cards?.registeredUsers ?? 0}
          accent="bg-cyan-500"
          formatter={integer}
        />
        <StatCard
          label="Ingresos plataforma"
          value={data?.cards?.platformRevenue ?? 0}
          accent="bg-emerald-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel-soft p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Empresas creadas recientemente
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Onboarding y estado operativo de tenants.
              </p>
            </div>
            <Link className="btn-secondary" to="/super-admin/soporte">
              Entrar como soporte
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {(data?.recentCompanies ?? []).map((company) => (
              <div
                className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_auto]"
                key={company.id}
              >
                <div>
                  <p className="font-semibold text-slate-950">{company.name}</p>
                  <p className="text-sm text-slate-500">{company.slug}</p>
                </div>
                <div className="text-sm text-slate-500">
                  {formatDate(company.created_at)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Estado sistema</h3>
          <div className="mt-5 space-y-3 text-sm">
            {(data?.systemStatus ?? []).map((item) => (
              <div
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                key={item.label}
              >
                <span className="text-slate-600">{item.label}</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel-soft p-6">
        <h3 className="text-lg font-semibold text-slate-950">Actividad reciente</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(data?.recentActivity ?? []).map((item) => (
            <div className="rounded-2xl border border-slate-100 p-4" key={item.id}>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                {formatDate(item.created_at)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SuperAdminDashboard;
