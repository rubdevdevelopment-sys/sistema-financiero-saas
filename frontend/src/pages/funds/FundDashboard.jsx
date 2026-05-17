import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { getFundOverview } from "../../services/fund.service.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { currency, integer } from "../../utils/format.js";

const moduleRoutes = {
  cycles: "/fondos/ciclos",
  memberships: "/fondos/miembros",
  shares: "/fondos/cupos",
  loans: "/fondos/prestamos",
  penalties: "/fondos/multas",
  settlements: "/fondos/cierre",
  distributions: "/fondos/reparto"
};

function StatusBadge({ children }) {
  return <span className="status-badge">{children}</span>;
}

export function FundDashboard() {
  const { activeCompany } = useActiveCompany();

  const overviewQuery = useQuery({
    queryKey: ["fund-overview", activeCompany?.id],
    queryFn: () => getFundOverview(activeCompany?.id),
    staleTime: 0,
    refetchOnMount: "always"
  });

  const data = overviewQuery.data;

  if (overviewQuery.isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {getApiErrorMessage(
          overviewQuery.error,
          "No fue posible cargar el modulo de fondos"
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fondo solidario rotativo"
        title="Dashboard fondo"
        description="Indicadores reales de capital, aportes, cupos, mora y caja disponible."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Capital recaudado" value={data?.cards?.capitalRecaudado ?? 0} accent="bg-brand-500" />
        <StatCard label="Aportes del mes" value={data?.cards?.aportesDelMes ?? 0} accent="bg-sky-500" />
        <StatCard label="Cuotas pendientes" value={data?.cards?.cuotasPendientes ?? 0} accent="bg-amber-500" formatter={integer} />
        <StatCard label="Caja disponible" value={data?.cards?.cajaDisponible ?? 0} accent="bg-slate-900" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cuotas vencidas" value={data?.cards?.cuotasVencidas ?? 0} accent="bg-rose-500" formatter={integer} />
        <StatCard label="Extraordinarias" value={data?.cards?.extraordinarias ?? 0} accent="bg-cyan-500" />
        <StatCard label="Miembros al dia" value={data?.cards?.miembrosAlDia ?? 0} accent="bg-emerald-500" formatter={integer} />
        <StatCard label="Miembros en mora" value={data?.cards?.miembrosEnMora ?? 0} accent="bg-rose-600" formatter={integer} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cartera pendiente" value={data?.cards?.carteraPendiente ?? 0} accent="bg-amber-500" />
        <StatCard label="Mora total" value={data?.cards?.mora ?? 0} accent="bg-rose-500" />
        <StatCard label="Miembros activos" value={data?.cards?.miembrosActivos ?? 0} accent="bg-teal-500" formatter={integer} />
        <StatCard label="Total cupos" value={data?.cards?.totalCupos ?? 0} accent="bg-violet-500" formatter={integer} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Estructura modular</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(data?.modules ?? []).map((item) => (
              <Link
                key={item.key}
                to={moduleRoutes[item.key] ?? "/fondos"}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-brand-500 hover:bg-brand-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <StatusBadge>Base</StatusBadge>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Indicadores operativos</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span>Ciclos activos</span>
              <strong className="text-slate-950">{integer(data?.cards?.ciclosActivos ?? 0)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span>Miembros activos</span>
              <strong className="text-slate-950">{integer(data?.cards?.miembrosActivos ?? 0)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span>Total cupos</span>
              <strong className="text-slate-950">{Number(data?.cards?.totalCupos ?? 0).toFixed(2)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span>Cartera pendiente</span>
              <strong className="text-slate-950">{currency(data?.cards?.carteraPendiente ?? 0)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span>Mora total</span>
              <strong className="text-slate-950">{currency(data?.cards?.mora ?? 0)}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default FundDashboard;
