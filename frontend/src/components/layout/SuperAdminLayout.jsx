import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";

const menu = [
  { to: "/super-admin", label: "Dashboard Global", end: true },
  { to: "/super-admin/empresas", label: "Empresas" },
  { to: "/super-admin/soporte", label: "Entrar como soporte" },
  { to: "/super-admin/usuarios", label: "Usuarios" },
  { to: "/super-admin/configuracion", label: "Configuracion Plataforma" },
  { to: "/super-admin/branding", label: "Branding" }
];

export function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const { supportCompany, exitCompanySupport } = useActiveCompany();

  if (user?.role !== "super_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="bg-platform px-6 py-8 text-white">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-200">
              RubDev SaaS
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Super Admin</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Control inteligente para negocios que crecen.
            </p>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => (
              <NavLink
                end={item.end}
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-white text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {supportCompany ? (
            <div className="mt-8 rounded-2xl border border-sky-300/20 bg-sky-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-sky-200">
                Soporte activo
              </p>
              <p className="mt-2 text-sm font-semibold">{supportCompany.name}</p>
              <button
                className="mt-4 w-full rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                type="button"
                onClick={exitCompanySupport}
              >
                Salir de soporte
              </button>
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="mt-1 text-xs text-slate-300">{user?.email}</p>
            <p className="mt-3 text-xs text-sky-200">rubdevdevelopment@gmail.com</p>
            <button className="btn-primary mt-5 w-full" onClick={logout}>
              Cerrar sesion
            </button>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Plataforma multiempresa</p>
                <h2 className="text-xl font-semibold text-slate-950">
                  Gobierno SaaS, soporte y configuracion global
                </h2>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Contexto: <span className="font-semibold">Plataforma RubDev</span>
              </div>
            </div>
          </header>

          <section className="flex-1 p-6">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
