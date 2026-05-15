import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../services/api.js";
import { queryClient } from "../../services/queryClient.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { getApiErrorMessage } from "../../utils/api.js";
import { currency } from "../../utils/format.js";

export function SettingsPage() {
  const { user } = useAuth();
  const canEdit = ["super_admin", "admin"].includes(user?.role);

  const companyQuery = useQuery({
    queryKey: ["company-current"],
    queryFn: async () => {
      const response = await api.get("/companies/current");
      return response.data.data;
    }
  });

  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      valor_objetivo_emaus: 460000
    }
  });

  useEffect(() => {
    if (companyQuery.data) {
      form.reset({
        name: companyQuery.data.name ?? "",
        phone: companyQuery.data.phone ?? "",
        email: companyQuery.data.email ?? "",
        valor_objetivo_emaus: companyQuery.data.valor_objetivo_emaus ?? 460000
      });
    }
  }, [companyQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (payload) => api.put("/companies/current", payload),
    onSuccess: async () => {
      toast.success("Configuracion actualizada");
      await queryClient.invalidateQueries({ queryKey: ["company-current"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No fue posible actualizar la configuracion"));
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuracion"
        title="Configuracion Emaus"
        description="Ajusta la meta por participante y los datos base de la empresa activa."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Meta actual por participante</h3>
          <p className="mt-2 text-sm text-slate-500">
            Valor usado por defecto al crear nuevos participantes.
          </p>
          <p className="mt-5 text-4xl font-semibold text-slate-950">
            {currency(companyQuery.data?.valor_objetivo_emaus ?? 460000)}
          </p>
        </div>

        <form className="panel-soft p-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <h3 className="text-lg font-semibold text-slate-950">Empresa activa</h3>
          <div className="mt-5 grid gap-4">
            <input className="input-light" placeholder="Nombre" disabled={!canEdit} {...form.register("name")} />
            <input className="input-light" placeholder="Telefono" disabled={!canEdit} {...form.register("phone")} />
            <input className="input-light" placeholder="Correo" disabled={!canEdit} {...form.register("email")} />
            <input
              className="input-light"
              type="number"
              step="0.01"
              min="0"
              placeholder="Meta por participante"
              disabled={!canEdit}
              {...form.register("valor_objetivo_emaus", { valueAsNumber: true })}
            />
            {canEdit ? (
              <button className="btn-primary" type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Guardar configuracion"}
              </button>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Solo administradores pueden modificar la configuracion.
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;