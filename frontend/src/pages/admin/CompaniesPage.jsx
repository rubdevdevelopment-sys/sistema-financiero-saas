import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";

const emptyCompany = {
  name: "",
  slug: "",
  nit: "",
  email: "",
  phone: "",
  currency: "COP",
  timezone: "America/Bogota",
  valor_objetivo_emaus: 460000,
  active: true,
  public_dashboard_enabled: false,
  public_slug: ""
};

export function CompaniesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyCompany);

  useEffect(() => {
    if (user?.role === "super_admin") {
      loadCompanies();
    }
  }, [user?.role]);

  async function loadCompanies() {
    const response = await api.get("/companies");
    setRows(response.data.data);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post("/companies", form);
    setForm(emptyCompany);
    await loadCompanies();
  }

  if (user?.role !== "super_admin") {
    return (
      <div className="panel-soft p-8 text-sm text-slate-600">
        Este modulo esta disponible solo para Super Admin.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel Global"
        title="Empresas"
        description="Crea y gestiona empresas aisladas desde la capa inicial multiempresa."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="panel-soft p-6" onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold text-slate-950">Nueva empresa</h3>
          <div className="mt-5 grid gap-4">
            {[
              ["name", "Nombre de empresa"],
              ["slug", "Slug unico"],
              ["nit", "NIT"],
              ["email", "Correo"],
              ["phone", "Telefono"],
              ["valor_objetivo_emaus", "Meta Emaus por participante"],
              ["public_slug", "Slug portal publico"]
            ].map(([key, label]) => (
              <input
                key={key}
                className="input-light"
                type={key === "valor_objetivo_emaus" ? "number" : "text"}
                placeholder={label}
                value={form[key]}
                disabled={key === "public_slug" && !form.public_dashboard_enabled}
                onChange={(event) =>
                  setForm({
                    ...form,
                    [key]: key === "public_slug" || key === "slug"
                      ? event.target.value.toLowerCase().replace(/\s+/g, "-")
                      : event.target.value
                  })
                }
                required={key === "name" || key === "slug" || (key === "public_slug" && form.public_dashboard_enabled)}
              />
            ))}
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>
                <span className="block font-semibold text-slate-900">Portal publico informativo</span>
                <span className="block text-xs text-slate-500">Crea la empresa con el portal publico opcional.</span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                checked={form.public_dashboard_enabled}
                onChange={(event) =>
                  setForm({
                    ...form,
                    public_dashboard_enabled: event.target.checked,
                    public_slug: event.target.checked ? form.public_slug : ""
                  })
                }
              />
            </label>
            <button className="btn-primary" type="submit">
              Crear empresa
            </button>
          </div>
        </form>

        <div className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Empresas registradas</h3>
          <div className="mt-5 space-y-4">
            {rows.map((row) => (
              <div key={row.id} className="rounded-3xl border border-slate-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{row.name}</p>
                    <p className="text-sm text-slate-500">{row.slug}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                    {row.active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  <p>Usuarios: {row.users_count}</p>
                  <p>Modulos activos: {row.active_modules}</p>
                  <p>Meta Emaus: {row.valor_objetivo_emaus}</p>
                  <p>Portal publico: {row.public_dashboard_enabled ? "Activo" : "Inactivo"}</p>
                  <p>Slug publico: {row.public_slug || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompaniesPage;
