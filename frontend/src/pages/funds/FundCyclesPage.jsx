import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { getFundCycles } from "../../services/fund.service.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export function FundCyclesPage() {
  const { activeCompany } = useActiveCompany();

  const cyclesQuery = useQuery({
    queryKey: ["fund-cycles", activeCompany?.id],
    queryFn: () => getFundCycles(activeCompany?.id)
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fondos"
        title="Ciclos anuales"
        description="Base para administrar temporadas, valor de cupo y aporte mensual por cupo."
      />

      <section className="panel-soft p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Ciclos configurados</h3>
            <p className="mt-1 text-sm text-slate-500">
              La creacion y cierre contable se implementaran en una fase posterior.
            </p>
          </div>
          <span className="status-badge">Modelo base</span>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Ciclo</th>
                <th className="px-4 py-3">Periodo</th>
                <th className="px-4 py-3">Valor cupo</th>
                <th className="px-4 py-3">Aporte mensual</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(cyclesQuery.data ?? []).map((cycle) => (
                <tr key={cycle.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">
                    {cycle.name} ({cycle.cycle_year})
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(cycle.starts_on)} - {formatDate(cycle.ends_on)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(cycle.share_value)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(cycle.monthly_contribution_per_share)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="status-badge">{cycle.status}</span>
                  </td>
                </tr>
              ))}
              {!cyclesQuery.isLoading && (cyclesQuery.data ?? []).length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan="5">
                    Aun no hay ciclos creados para este fondo.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FundCyclesPage;
