import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

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
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message ?? "No fue posible iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="bg-hero px-8 py-12 text-white">
        <div className="mx-auto flex h-full max-w-2xl flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-100">SaaS listo para crecer</p>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight">
              Control administrativo y financiero profesional desde el primer cliente.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-300">
              Base moderna para ingresos, egresos, dashboard ejecutivo, roles y operacion
              multiempresa.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "JWT y roles",
              "Supabase + PostgreSQL",
              "Escalable tipo SaaS"
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-100 px-6 py-12">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-panel">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-600">Acceso seguro</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Iniciar sesion</h2>
          <p className="mt-2 text-sm text-slate-500">
            Usa el usuario demo inicial o tus credenciales reales.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
              placeholder="Contrasena"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
            {error && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}
            <button className="btn-primary w-full" disabled={loading} type="submit">
              {loading ? "Ingresando..." : "Entrar al sistema"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
