import { useQuery } from "@tanstack/react-query";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { api } from "../../services/api.js";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";

import { getApiErrorMessage } from "../../utils/api.js";

import {
  formatCurrency,
  formatDate,
  integer
} from "../../utils/format.js";

const plainValue = (value) => value;

function estadoColor(status) {
  if (status === "completed") return "bg-emerald-500";
  if (status === "partial") return "bg-amber-500";
  return "bg-rose-500";
}

function tipoMovimientoLabel(type) {
  return type === "income"
    ? "aporte"
    : "gasto";
}

function incomeTypeLabel(type) {
  if (type === "registration")
    return "Inscripcion";

  if (type === "monthly_fee")
    return "Mensualidad";

  if (type === "donation")
    return "Donacion";

  return type;
}

export function DashboardPage() {
  const { activeCompany } = useActiveCompany();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", activeCompany?.id],
    staleTime: 0,
    refetchOnMount: "always",

    queryFn: async () => {
      const response =
        await api.get("/dashboard", {
          params: activeCompany?.id ? { company_id: activeCompany.id } : undefined
        });

      return response.data.data;
    }
  });

  const data = dashboardQuery.data;

  if (dashboardQuery.isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {getApiErrorMessage(
          dashboardQuery.error,
          "No fue posible cargar el dashboard"
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Retiro Emaus"
        title="Dashboard de recaudo"
        description="Monitorea recaudo, gastos, cumplimiento de meta, participantes y movimientos recientes."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Aportes participantes"
          value={data?.cards?.aportesParticipantes ?? 0}
          accent="bg-emerald-500"
        />

        <StatCard
          label="Otros ingresos"
          value={data?.cards?.otrosIngresos ?? 0}
          accent="bg-violet-500"
        />

        <StatCard
          label="Ingresos generales"
          value={data?.cards?.totalIngresosGenerales ?? 0}
          accent="bg-brand-500"
        />

        <StatCard
          label="Total gastos"
          value={data?.cards?.totalGastos ?? 0}
          accent="bg-rose-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total recaudado"
          value={data?.cards?.totalRecaudado ?? 0}
          accent="bg-emerald-500"
        />

        <StatCard
          label="Saldo actual caja"
          value={data?.cards?.saldoActualCaja ?? 0}
          accent="bg-sky-500"
        />

        <StatCard
          label="Cumplimiento meta"
          value={`${Math.round(
            data?.cards?.porcentajeCumplimiento ?? 0
          )}%`}
          accent="bg-amber-500"
          formatter={plainValue}
        />

        <StatCard
          label="Recaudo del mes"
          value={data?.cards?.recaudoDelMes ?? 0}
          accent="bg-cyan-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Participantes"
          value={data?.cards?.totalParticipantes ?? 0}
          accent="bg-slate-900"
          formatter={integer}
        />

        <StatCard
          label="Pago completo"
          value={
            data?.cards?.participantesCompletos ?? 0
          }
          accent="bg-emerald-500"
          formatter={integer}
        />

        <StatCard
          label="Pendientes"
          value={
            data?.cards?.participantesPendientes ?? 0
          }
          accent="bg-amber-500"
          formatter={integer}
        />

        <StatCard
          label="Aportes pendientes"
          value={
            data?.cards?.movimientosPendientes ?? 0
          }
          accent="bg-rose-500"
          formatter={integer}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">
            Tendencia mensual
          </h3>

          <div className="mt-6 h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={data?.monthlySummary ?? []}
              >
                <defs>
                  <linearGradient
                    id="incomeFill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#22c55e"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor="#22c55e"
                      stopOpacity={0.05}
                    />
                  </linearGradient>

                  <linearGradient
                    id="expenseFill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#ef4444"
                      stopOpacity={0.45}
                    />

                    <stop
                      offset="95%"
                      stopColor="#ef4444"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>

                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="incomes"
                  stroke="#16a34a"
                  fill="url(#incomeFill)"
                />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  fill="url(#expenseFill)"
                />

                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#0f172a"
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">
            Ultimos movimientos
          </h3>

          <div className="mt-5 space-y-4">
            {(data?.recentMovements ?? []).map(
              (item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.title}
                      </p>

                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {tipoMovimientoLabel(
                          item.type
                        )}{" "}
                        | {item.category_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.participant_name ||
                          "Operacion general"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-slate-950">
                        {formatCurrency(item.amount)}
                      </p>

                      <p className="text-xs text-slate-500">
                        {formatDate(
                          item.movement_date
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
