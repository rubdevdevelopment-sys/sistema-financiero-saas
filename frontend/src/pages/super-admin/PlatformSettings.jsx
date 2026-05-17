import { PageHeader } from "../../components/common/PageHeader.jsx";

const platformItems = [
  ["Frontend", "Vercel", "VITE_API_URL apunta al backend publico terminado en /api."],
  ["Backend", "Render", "NODE_ENV, PORT, JWT_SECRET y DATABASE_URL deben estar configuradas."],
  ["Base de datos", "Supabase PostgreSQL", "Migraciones versionadas y backups activos por tenant."],
  ["Multi tenant", "Company context", "El super admin opera plataforma y solo entra a tenant mediante soporte explicito."]
];

const futureModules = [
  "Fondos de inversion",
  "Capital privado",
  "Prestamos con interes mensual",
  "Recaudo empresarial",
  "Cooperativas",
  "Cuentas de capital",
  "Rendimiento mensual",
  "Productos financieros por tenant"
];

export function PlatformSettings() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuracion Plataforma"
        title="Entorno y escalabilidad"
        description="Base operativa para administrar despliegue, tenant settings, branding y crecimiento modular sin tocar la configuracion online."
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {platformItems.map(([title, value, description]) => (
          <article className="panel-soft p-5" key={title}>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">{value}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </section>

      <section className="panel-soft p-6">
        <h3 className="text-lg font-semibold text-slate-950">Arquitectura preparada</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {futureModules.map((item) => (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-700" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PlatformSettings;
