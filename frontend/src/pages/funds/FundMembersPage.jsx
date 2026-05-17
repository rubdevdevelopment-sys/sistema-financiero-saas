import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { getFundMembers } from "../../services/fund.service.js";
import { currency } from "../../utils/format.js";

export function FundMembersPage() {
  const { activeCompany } = useActiveCompany();

  const membersQuery = useQuery({
    queryKey: ["fund-members", activeCompany?.id],
    queryFn: () => getFundMembers(activeCompany?.id)
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fondos"
        title="Miembros y cupos"
        description="Estructura base para participantes del fondo, cupos y aportes mensuales."
      />

      <section className="panel-soft p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Miembros del fondo</h3>
            <p className="mt-1 text-sm text-slate-500">
              Los cupos se mantienen separados de los participantes Emaus actuales.
            </p>
          </div>
          <span className="status-badge">Cupos proporcionales</span>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Miembro</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Cupos activos</th>
                <th className="px-4 py-3">Aporte mensual</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(membersQuery.data ?? []).map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-950">{member.full_name}</p>
                    <p className="text-xs text-slate-500">{member.member_code || "Sin codigo"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {member.document_number || "No registrado"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {Number(member.active_shares ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {currency(member.monthly_contribution ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="status-badge">{member.status}</span>
                  </td>
                </tr>
              ))}
              {!membersQuery.isLoading && (membersQuery.data ?? []).length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan="5">
                    Aun no hay miembros registrados en el fondo.
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

export default FundMembersPage;
