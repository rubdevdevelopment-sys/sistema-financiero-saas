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
  active: true
};

function normalizeCompanySlug(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CompaniesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyCompany);
  const [editing, setEditing] = useState(null);

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

    const payload = {
      name: form.name.trim(),
      nit: form.nit.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      currency: form.currency || "COP",
      timezone: form.timezone || "America/Bogota",
      valor_objetivo_emaus: Number(form.valor_objetivo_emaus) || 0,
      active: Boolean(form.active)
    };

    if (editing) {
      await api.put(`/companies/${editing.id}`, payload);
    } else {
      await api.post("/companies", {
        ...payload,
        slug: normalizeCompanySlug(form.slug)
      });
    }

    setForm(emptyCompany);
    setEditing(null);
    await loadCompanies();
  }

  function startEdit(company) {
    setEditing(company);
    setForm({
      name: company.name || "",
      slug: company.slug || "",
      nit: company.nit || "",
      email: company.email || "",
      phone: company.phone || "",
      currency: company.currency || "COP",
      timezone: company.timezone || "America/Bogota",
      valor_objetivo_emaus: company.valor_objetivo_emaus ?? 460000,
      active: Boolean(company.active)
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyCompany);
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
          <h3 className="text-lg font-semibold text-slate-950">
            {editing ? "Editar empresa" : "Nueva empresa"}
          </h3>
          <div className="mt-5 grid gap-4">
            {[
              ["name", "Nombre de empresa"],
              ["slug", "Slug unico"],
              ["nit", "NIT"],
              ["email", "Correo"],
              ["phone", "Telefono"],
              ["valor_objetivo_emaus", "Meta Emaus por participante"]
            ].map(([key, label]) => (
              <input
                key={key}
                className="input-light"
                type={key === "valor_objetivo_emaus" ? "number" : "text"}
                placeholder={label}
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                required={key === "name" || (!editing && key === "slug")}
                disabled={editing && key === "slug"}
              />
            ))}
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm({
                    ...form,
                    active: event.target.checked
                  })
                }
              />
              Empresa activa
            </label>
            <div className="flex gap-3">
              <button className="btn-primary" type="submit">
                {editing ? "Guardar cambios" : "Crear empresa"}
              </button>

              {editing ? (
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={cancelEdit}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
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
                </div>
                <div className="mt-4">
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => startEdit(row)}
                  >
                    Editar
                  </button>
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
