import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { api } from "../../services/api.js";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { currency, shortDate } from "../../utils/format.js";

export function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const response = await api.get("/dashboard");
    setData(response.data.data);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resumen Ejecutivo"
        title="Dashboard financiero"
        description="Visualiza balance, ingresos, egresos y movimientos recientes con una base lista para escalar."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ingresos totales" value={data?.cards?.totalIncome ?? 0} accent="bg-brand-500" />
        <StatCard label="Egresos totales" value={data?.cards?.totalExpense ?? 0} accent="bg-rose-500" />
        <StatCard label="Balance" value={data?.cards?.balance ?? 0} accent="bg-sky-500" />
        <StatCard label="Disponible" value={data?.cards?.availableCash ?? 0} accent="bg-amber-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Tendencia mensual</h3>
          <p className="mt-1 text-sm text-slate-500">
            Compara ingresos y egresos de los ultimos seis meses.
          </p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlySummary ?? []}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="incomes" stroke="#16a34a" fill="url(#incomeFill)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expenseFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Ultimos movimientos</h3>
          <div className="mt-5 space-y-4">
            {(data?.recentMovements ?? []).map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-950">{currency(item.amount)}</p>
                    <p className="text-xs text-slate-500">{shortDate(item.movement_date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
