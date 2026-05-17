import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../services/api.js";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";

export function CompanySelector() {
  const navigate = useNavigate();
  const { enterCompanySupport } = useActiveCompany();
  const [reason, setReason] = useState("Soporte tecnico solicitado");

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await api.get("/companies");
      return response.data.data;
    }
  });

  async function enterSupport(company) {
    await api.post("/super-admin/support-sessions", {
      company_id: company.id,
      reason
    });
    enterCompanySupport(company, reason);
    toast.success(`Soporte activo para ${company.name}`);
    navigate("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tenant switching"
        title="Entrar como soporte"
        description="Selecciona una empresa de forma explicita. El super admin no entra automaticamente a datos de clientes."
      />

      <section className="panel-soft p-6">
        <label className="text-sm font-semibold text-slate-700">
          Motivo de acceso
        </label>
        <input
          className="input-light mt-2"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ej: soporte tecnico solicitado por el cliente"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {(companiesQuery.data ?? []).map((company) => (
          <article className="panel-soft p-5" key={company.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-950">{company.name}</p>
                <p className="mt-1 text-sm text-slate-500">{company.slug}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {company.active ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              <p>Usuarios: {company.users_count}</p>
              <p>Modulos: {company.active_modules}</p>
            </div>
            <button
              className="btn-primary mt-5"
              type="button"
              disabled={!company.active}
              onClick={() => enterSupport(company)}
            >
              Entrar como soporte
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

export default CompanySelector;
