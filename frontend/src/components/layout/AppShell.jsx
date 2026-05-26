import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";

const standardMenu = [
  { key: "dashboard", to: "/dashboard", label: "Dashboard" },
  { key: "participants", to: "/participantes", label: "Participantes" },
  { key: "contributions", to: "/ingresos", label: "Aportes" },
  { key: "incomes", to: "/ingresos", label: "Ingresos" },
  { key: "expenses", to: "/egresos", label: "Egresos" },
  { key: "users", to: "/admin/usuarios", label: "Usuarios", roles: ["super_admin", "admin"] },
  { key: "settings", to: "/configuracion", label: "Configuracion" }
];

const cooperativeFundMenu = [
  { key: "fund-dashboard", to: "/fondos", label: "Dashboard fondo" },
  { key: "fund-cycles", to: "/fondos/ciclos", label: "Ciclos" },
  { key: "fund-members", to: "/fondos/miembros", label: "Miembros fondo" },
  { key: "fund-shares", to: "/fondos/cupos", label: "Cupos" },
  { key: "fund-loans", to: "/fondos/prestamos", label: "Prestamos" },
  { key: "fund-penalties", to: "/fondos/multas", label: "Multas" },
  { key: "fund-settlement", to: "/fondos/cierre", label: "Cierre anual" },
  { key: "fund-distribution", to: "/fondos/reparto", label: "Reparto" },
  { key: "users", to: "/admin/usuarios", label: "Usuarios", roles: ["super_admin", "admin"] },
  { key: "settings", to: "/configuracion", label: "Configuracion" }
];

const fitnessMenu = [
  { key: "fitness-dashboard", to: "/fitness", label: "Rendimiento" },
  { key: "users", to: "/admin/usuarios", label: "Usuarios", roles: ["super_admin", "admin"] },
  { key: "settings", to: "/configuracion", label: "Configuracion" }
];

const standardOnlyPaths = ["/dashboard", "/participantes", "/ingresos", "/egresos"];
const cooperativeOnlyPrefix = "/fondos";
const fitnessOnlyPrefix = "/fitness";

export function AppShell() {
  const { user, logout } = useAuth();
  const { activeCompany, isSupportMode, exitCompanySupport } = useActiveCompany();
  const location = useLocation();
  const businessModel = activeCompany?.business_model || user?.business_model || "standard";
  const isCooperativeFund = businessModel === "cooperative_fund";
  const isFitness = businessModel === "fitness";
  const menu = isFitness ? fitnessMenu : isCooperativeFund ? cooperativeFundMenu : standardMenu;
  const productLabel = isCooperativeFund
    ? "Fondo solidario rotativo"
    : isFitness
      ? "Fitness performance SaaS"
    : "Gestion administrativa y recaudo";
  const headerTitle = isCooperativeFund
    ? "Capital colectivo, cupos y prestamos internos"
    : isFitness
      ? "Clientes, rutinas y progreso deportivo"
    : "Recaudo, ingresos y egresos por empresa";
  const defaultPath = isCooperativeFund ? "/fondos" : isFitness ? "/fitness" : "/dashboard";

  if (user?.role === "super_admin" && !activeCompany?.id) {
    return <Navigate to="/super-admin" replace />;
  }

  if (isCooperativeFund && standardOnlyPaths.includes(location.pathname)) {
    return <Navigate to="/fondos" replace />;
  }

  if (isFitness && (standardOnlyPaths.includes(location.pathname) || location.pathname.startsWith(cooperativeOnlyPrefix))) {
    return <Navigate to="/fitness" replace />;
  }

  if (!isCooperativeFund && location.pathname.startsWith(cooperativeOnlyPrefix)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isFitness && location.pathname.startsWith(fitnessOnlyPrefix)) {
    return <Navigate to={defaultPath} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-hero px-6 py-8 text-white">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-100/80">
              {isSupportMode ? "Soporte RubDev" : productLabel}
            </p>
            <h1 className="mt-3 text-2xl font-semibold">{activeCompany?.name}</h1>
            <p className="mt-2 text-sm text-slate-300">{productLabel}</p>
          </div>

          <nav className="space-y-2">
            {menu
              .filter((item) => !item.roles || item.roles.includes(user?.role))
              .map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end={item.to === defaultPath}
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
            {isSupportMode ? (
              <button
                className="mt-5 w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                type="button"
                onClick={exitCompanySupport}
              >
                Salir de soporte
              </button>
            ) : null}
            <button className="btn-primary mt-5 w-full" onClick={logout}>
              Cerrar sesion
            </button>
          </div>
        </aside>

        <main className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Panel administrativo multiempresa</p>
                <h2 className="text-xl font-semibold text-slate-950">
                  {headerTitle}
                </h2>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                Cliente activo: <span className="font-semibold">{activeCompany?.name}</span>
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
