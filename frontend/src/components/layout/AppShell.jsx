import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const menu = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/ingresos", label: "Ingresos" },
  { to: "/egresos", label: "Egresos" },
  { to: "/admin/empresas", label: "Empresas", roles: ["super_admin"] },
  { to: "/admin/usuarios", label: "Usuarios", roles: ["super_admin", "admin"] },
  { to: "/configuracion", label: "Configuracion" }
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-hero px-6 py-8 text-white">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-100/80">
              SaaS financiero
            </p>
            <h1 className="mt-3 text-2xl font-semibold">{user?.company_name}</h1>
            <p className="mt-2 text-sm text-slate-300">{user?.role}</p>
          </div>

          <nav className="space-y-2">
            {menu
              .filter((item) => !item.roles || item.roles.includes(user?.role))
              .map((item) => (
                <NavLink
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

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="mt-1 text-xs text-slate-300">{user?.email}</p>
            <button className="btn-primary mt-5 w-full" onClick={logout}>
              Cerrar sesion
            </button>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Panel administrativo y financiero</p>
                <h2 className="text-xl font-semibold text-slate-950">
                  Operacion multiempresa preparada para SaaS
                </h2>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                Cliente activo: <span className="font-semibold">{user?.company_name}</span>
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
