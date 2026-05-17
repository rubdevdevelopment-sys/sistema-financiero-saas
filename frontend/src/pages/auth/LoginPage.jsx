import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const capabilities = [
  ["Multiempresa", "Aislamiento operativo por cliente y soporte controlado."],
  ["Fondos rotativos", "Ciclos, cupos, aportes, mora y capital colectivo."],
  ["Control ejecutivo", "Indicadores claros para operar con confianza."]
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "superadmin@demo.local",
    password: "Admin123*"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const payload = await login(form);
      navigate(payload.user?.role === "super_admin" ? "/super-admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message ?? "No fue posible iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden bg-platform px-6 py-10 sm:px-10 lg:px-14">
          <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col justify-between">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-semibold tracking-tight">RubDev</p>
                <p className="mt-1 text-xs uppercase tracking-[0.32em] text-brand-100/80">
                  Financial Operating System
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200">
                SaaS Platform
              </span>
            </header>

            <div className="py-16 lg:py-24">
              <p className="text-sm uppercase tracking-[0.36em] text-brand-100">
                Financial Operating System
              </p>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl">
                Control inteligente para empresas y fondos
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Una plataforma premium para operar recaudo administrativo, fondos solidarios
                rotativos y modelos financieros multiempresa desde una experiencia unificada.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {capabilities.map(([title, description]) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-panel backdrop-blur">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 px-6 py-12 text-slate-950">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-600">
                Acceso seguro
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Iniciar sesion</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ingresa a tu espacio operativo con credenciales autorizadas.
              </p>
            </div>

            <form className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-panel" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Correo</span>
                  <input
                    className="input-light mt-2"
                    type="email"
                    placeholder="correo@empresa.com"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Contrasena</span>
                  <input
                    className="input-light mt-2"
                    type="password"
                    placeholder="Tu contrasena"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    required
                  />
                </label>
              </div>

              {error ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
                {loading ? "Ingresando..." : "Entrar a RubDev"}
              </button>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                Plataforma multiempresa con modelos independientes para administracion,
                recaudo y fondos solidarios.
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
