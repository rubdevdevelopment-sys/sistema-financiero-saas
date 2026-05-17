import { PageHeader } from "../../components/common/PageHeader.jsx";

const brandFields = [
  "Logo plataforma",
  "Logo empresa",
  "Favicon",
  "Slogan",
  "Color primario",
  "Color secundario",
  "Imagen portada/login",
  "Avatar empresa"
];

export function BrandingSettings() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Identidad visual"
        title="Branding RubDev"
        description="Infraestructura financiera moderna para empresas reales."
      />

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="panel-soft p-6">
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-xl font-bold text-white">
                RD
              </div>
              <p className="mt-4 font-semibold text-slate-950">RubDev</p>
              <p className="mt-1 text-sm text-slate-500">rubdevdevelopment@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">
            Configurables preparados
          </h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {brandFields.map((item) => (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4" key={item}>
                <p className="text-sm font-semibold text-slate-800">{item}</p>
                <p className="mt-1 text-xs text-slate-500">Campo listo para conectar a storage y settings.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default BrandingSettings;
