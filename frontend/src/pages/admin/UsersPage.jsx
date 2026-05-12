import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";

const emptyUser = {
  company_id: "11111111-1111-1111-1111-111111111111",
  full_name: "",
  email: "",
  password: "",
  role: "operator",
  active: true
};

export function UsersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    ...emptyUser
  });

  useEffect(() => {
    if (user?.role === "super_admin" || user?.role === "admin") {
      loadData();
    }
  }, [user?.role]);

  async function loadData() {
    const requests = [api.get("/users")];
    if (user?.role === "super_admin") {
      requests.push(api.get("/companies"));
    }

    const [usersResponse, companiesResponse] = await Promise.all(requests);
    setRows(usersResponse.data.data);

    if (companiesResponse) {
      setCompanies(companiesResponse.data.data);
    } else {
      setCompanies([{ id: user.company_id, name: user.company_name }]);
      setForm((current) => ({ ...current, company_id: user.company_id }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...form,
      company_id: user.role === "super_admin" ? form.company_id : user.company_id
    };
    await api.post("/users", payload);
    setForm({
      ...emptyUser,
      company_id: user.role === "super_admin" ? form.company_id : user.company_id
    });
    await loadData();
  }

  if (user?.role !== "super_admin" && user?.role !== "admin") {
    return (
      <div className="panel-soft p-8 text-sm text-slate-600">
        Este modulo esta disponible para administradores.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control de Acceso"
        title="Usuarios y roles"
        description="Gestiona operadores, administradores y Super Admin con enfoque multiempresa."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="panel-soft p-6" onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold text-slate-950">Nuevo usuario</h3>
          <div className="mt-5 grid gap-4">
            <select
              className="input-light"
              value={form.company_id}
              onChange={(event) => setForm({ ...form, company_id: event.target.value })}
              disabled={user.role !== "super_admin"}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <input
              className="input-light"
              placeholder="Nombre completo"
              value={form.full_name}
              onChange={(event) => setForm({ ...form, full_name: event.target.value })}
              required
            />
            <input
              className="input-light"
              type="email"
              placeholder="Correo"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
            <input
              className="input-light"
              type="password"
              placeholder="Contrasena temporal"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
            <select
              className="input-light"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              {user.role === "super_admin" && <option value="super_admin">Super Admin</option>}
              <option value="admin">Administrador</option>
              <option value="operator">Operador</option>
            </select>
            <button className="btn-primary" type="submit">
              Crear usuario
            </button>
          </div>
        </form>

        <div className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Usuarios registrados</h3>
          <div className="mt-5 space-y-4">
            {rows.map((row) => (
              <div key={row.id} className="rounded-3xl border border-slate-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{row.full_name}</p>
                    <p className="text-sm text-slate-500">{row.email}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-700">
                    {row.role}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{row.company_name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
