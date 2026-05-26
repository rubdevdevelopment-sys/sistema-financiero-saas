import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../services/api.js";
import { queryClient } from "../../services/queryClient.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { getApiErrorMessage } from "../../utils/api.js";
import { currency } from "../../utils/format.js";

function parseLines(value, mapper) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(mapper)
    .filter(Boolean);
}

export function SettingsPage() {
  const { user } = useAuth();
  const { activeCompany } = useActiveCompany();
  const canEdit = ["super_admin", "admin"].includes(user?.role);
  const isFitness = activeCompany?.business_model === "fitness" || user?.business_model === "fitness";

  if (user?.role === "client") {
    return <Navigate to="/fitness" replace />;
  }

  const companyQuery = useQuery({
    queryKey: ["company-current", activeCompany?.id],
    queryFn: async () => {
      const response = await api.get("/companies/current", {
        params: activeCompany?.id ? { company_id: activeCompany.id } : undefined
      });
      return response.data.data;
    },
    enabled: user?.role !== "super_admin" || Boolean(activeCompany?.id)
  });

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      valor_objetivo_emaus: 460000,
      public_dashboard_enabled: false,
      public_slug: "",
      gym_name: "",
      logo_url: "",
      hero_title: "",
      hero_subtitle: "",
      accent_color: "#84cc16",
      secondary_color: "#0f172a",
      contact_phone: "",
      contact_email: "",
      whatsapp: "",
      instagram: "",
      facebook: "",
      tiktok: "",
      address: "",
      hours_summary: "",
      portal_cta_text: "",
      portal_cta_url: "",
      trainers_text: "",
      testimonials_text: "",
      plans_text: ""
    }
  });

  useEffect(() => {
    if (!companyQuery.data) return;
    const settings = companyQuery.data.fitness_settings ?? {};
    form.reset({
      name: companyQuery.data.name ?? "",
      phone: companyQuery.data.phone ?? "",
      email: companyQuery.data.email ?? "",
      valor_objetivo_emaus: companyQuery.data.valor_objetivo_emaus ?? 460000,
      public_dashboard_enabled: companyQuery.data.public_dashboard_enabled ?? false,
      public_slug: companyQuery.data.public_slug ?? "",
      gym_name: settings.gym_name ?? "",
      logo_url: settings.logo_url ?? "",
      hero_title: settings.hero_title ?? "",
      hero_subtitle: settings.hero_subtitle ?? "",
      accent_color: settings.accent_color ?? "#84cc16",
      secondary_color: settings.secondary_color ?? "#0f172a",
      contact_phone: settings.contact_phone ?? "",
      contact_email: settings.contact_email ?? "",
      whatsapp: settings.whatsapp ?? "",
      instagram: settings.instagram ?? "",
      facebook: settings.facebook ?? "",
      tiktok: settings.tiktok ?? "",
      address: settings.address ?? "",
      hours_summary: settings.hours_summary ?? "",
      portal_cta_text: settings.portal_cta_text ?? "",
      portal_cta_url: settings.portal_cta_url ?? "",
      trainers_text: Array.isArray(settings.trainers) ? settings.trainers.map((item) => `${item.name} | ${item.role} | ${item.bio || ""} | ${item.image_url || ""}`).join("\n") : "",
      testimonials_text: Array.isArray(settings.testimonials) ? settings.testimonials.map((item) => `${item.name} | ${item.quote} | ${item.goal || ""}`).join("\n") : "",
      plans_text: Array.isArray(settings.plans) ? settings.plans.map((item) => `${item.name} | ${item.price} | ${item.label || ""} | ${item.description || ""}`).join("\n") : ""
    });
  }, [companyQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (values) => {
      const fitness_settings = isFitness ? {
        gym_name: values.gym_name || null,
        logo_url: values.logo_url || null,
        hero_title: values.hero_title || null,
        hero_subtitle: values.hero_subtitle || null,
        accent_color: values.accent_color || null,
        secondary_color: values.secondary_color || null,
        contact_phone: values.contact_phone || null,
        contact_email: values.contact_email || null,
        whatsapp: values.whatsapp || null,
        instagram: values.instagram || null,
        facebook: values.facebook || null,
        tiktok: values.tiktok || null,
        address: values.address || null,
        hours_summary: values.hours_summary || null,
        portal_cta_text: values.portal_cta_text || null,
        portal_cta_url: values.portal_cta_url || null,
        trainers: parseLines(values.trainers_text, (line) => {
          const [name, role, bio, image_url] = line.split("|").map((item) => item.trim());
          return name && role ? { name, role, bio: bio || null, image_url: image_url || null } : null;
        }),
        testimonials: parseLines(values.testimonials_text, (line) => {
          const [name, quote, goal] = line.split("|").map((item) => item.trim());
          return name && quote ? { name, quote, goal: goal || null } : null;
        }),
        plans: parseLines(values.plans_text, (line) => {
          const [name, price, label, description] = line.split("|").map((item) => item.trim());
          return name && price ? { name, price, label: label || null, description: description || null } : null;
        })
      } : undefined;

      return api.put("/companies/current", {
        name: values.name,
        phone: values.phone,
        email: values.email,
        valor_objetivo_emaus: values.valor_objetivo_emaus,
        public_dashboard_enabled: values.public_dashboard_enabled,
        public_slug: values.public_slug,
        fitness_settings
      }, {
        params: activeCompany?.id ? { company_id: activeCompany.id } : undefined
      });
    },
    onSuccess: async () => {
      toast.success("Configuracion actualizada");
      await queryClient.invalidateQueries({ queryKey: ["company-current"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible actualizar la configuracion"))
  });

  const publicDashboardEnabled = form.watch("public_dashboard_enabled");
  const publicSlug = form.watch("public_slug");
  const publicUrl = publicDashboardEnabled && publicSlug ? `${window.location.origin}/public/${publicSlug}` : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuracion"
        title={isFitness ? "Configuracion RubDev Fitness" : "Configuracion Emaus"}
        description={isFitness ? "Administra branding premium, portal publico, contacto, horarios y planes del gimnasio." : "Ajusta la meta por participante y los datos base de la empresa activa."}
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">{isFitness ? "Vista publica y marca" : "Meta actual por participante"}</h3>
          <p className="mt-2 text-sm text-slate-500">{isFitness ? "Controla la identidad publica del gimnasio y el acceso al portal fitness." : "Valor usado por defecto al crear nuevos participantes."}</p>
          <p className="mt-5 text-4xl font-semibold text-slate-950">{currency(companyQuery.data?.valor_objetivo_emaus ?? 460000)}</p>
          {publicUrl ? <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{publicUrl}</div> : null}
        </div>

        <form className="panel-soft p-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <h3 className="text-lg font-semibold text-slate-950">Empresa activa</h3>
          <div className="mt-5 grid gap-4">
            <input className="input-light" placeholder="Nombre" disabled={!canEdit} {...form.register("name")} />
            <input className="input-light" placeholder="Telefono" disabled={!canEdit} {...form.register("phone")} />
            <input className="input-light" placeholder="Correo" disabled={!canEdit} {...form.register("email")} />
            <input className="input-light" type="number" step="0.01" min="0" placeholder="Meta por participante" disabled={!canEdit} {...form.register("valor_objetivo_emaus", { valueAsNumber: true })} />
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>
                <span className="block font-semibold text-slate-900">Portal publico</span>
                <span className="block text-xs text-slate-500">Habilita una landing publica para la empresa activa.</span>
              </span>
              <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-brand-500 focus:ring-brand-500" disabled={!canEdit} {...form.register("public_dashboard_enabled")} />
            </label>
            <input className="input-light" placeholder="Slug publico" disabled={!canEdit || !publicDashboardEnabled} {...form.register("public_slug", { onChange: (event) => { event.target.value = event.target.value.toLowerCase().replace(/\s+/g, "-"); } })} />

            {isFitness ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="input-light" placeholder="Nombre del gimnasio" disabled={!canEdit} {...form.register("gym_name")} />
                  <input className="input-light" placeholder="Logo URL" disabled={!canEdit} {...form.register("logo_url")} />
                  <input className="input-light" placeholder="Color principal" disabled={!canEdit} {...form.register("accent_color")} />
                  <input className="input-light" placeholder="Color secundario" disabled={!canEdit} {...form.register("secondary_color")} />
                  <input className="input-light" placeholder="Telefono portal" disabled={!canEdit} {...form.register("contact_phone")} />
                  <input className="input-light" placeholder="Correo portal" disabled={!canEdit} {...form.register("contact_email")} />
                  <input className="input-light" placeholder="WhatsApp" disabled={!canEdit} {...form.register("whatsapp")} />
                  <input className="input-light" placeholder="Instagram" disabled={!canEdit} {...form.register("instagram")} />
                  <input className="input-light" placeholder="Facebook" disabled={!canEdit} {...form.register("facebook")} />
                  <input className="input-light" placeholder="TikTok" disabled={!canEdit} {...form.register("tiktok")} />
                </div>
                <input className="input-light" placeholder="Direccion / sede principal" disabled={!canEdit} {...form.register("address")} />
                <textarea className="input-light min-h-24" placeholder="Titulo hero" disabled={!canEdit} {...form.register("hero_title")} />
                <textarea className="input-light min-h-24" placeholder="Subtitulo hero" disabled={!canEdit} {...form.register("hero_subtitle")} />
                <textarea className="input-light min-h-20" placeholder="Horarios" disabled={!canEdit} {...form.register("hours_summary")} />
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="input-light" placeholder="CTA publico" disabled={!canEdit} {...form.register("portal_cta_text")} />
                  <input className="input-light" placeholder="URL CTA publica" disabled={!canEdit} {...form.register("portal_cta_url")} />
                </div>
                <textarea className="input-light min-h-28" placeholder="Entrenadores: nombre | rol | bio | imagen_url" disabled={!canEdit} {...form.register("trainers_text")} />
                <textarea className="input-light min-h-28" placeholder="Testimonios: nombre | quote | objetivo" disabled={!canEdit} {...form.register("testimonials_text")} />
                <textarea className="input-light min-h-28" placeholder="Planes: nombre | precio | etiqueta | descripcion" disabled={!canEdit} {...form.register("plans_text")} />
              </>
            ) : null}

            {canEdit ? <button className="btn-primary" type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Guardando..." : "Guardar configuracion"}</button> : <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Solo administradores pueden modificar la configuracion.</div>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
