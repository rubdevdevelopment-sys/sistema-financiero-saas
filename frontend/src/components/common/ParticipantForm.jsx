import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { participantSchema } from "../../schemas/participant.js";

const initialState = {
  document_number: "",
  full_name: "",
  phone: "",
  email: "",
  target_amount: 460000,
  observations: "",
  active: true
};

export function ParticipantForm({ initialData, defaultTargetAmount = 460000, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      ...initialState,
      target_amount: defaultTargetAmount
    }
  });

  useEffect(() => {
    form.reset(
      initialData
        ? {
            document_number: initialData.document_number ?? "",
            full_name: initialData.full_name ?? "",
            phone: initialData.phone ?? "",
            email: initialData.email ?? "",
            target_amount: initialData.target_amount ?? defaultTargetAmount,
            observations: initialData.observations ?? "",
            active: initialData.active ?? true
          }
        : {
            ...initialState,
            target_amount: defaultTargetAmount
          }
    );
  }, [defaultTargetAmount, form, initialData]);

  const errors = form.formState.errors;

  async function submit(values) {
    await onSubmit(values);
    form.reset({
      ...initialState,
      target_amount: defaultTargetAmount
    });
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
      <div>
        <input className="input-light" placeholder="Documento" {...form.register("document_number")} />
        {errors.document_number ? (
          <p className="mt-2 text-sm text-rose-600">{errors.document_number.message}</p>
        ) : null}
      </div>
      <div>
        <input className="input-light" placeholder="Nombre completo" {...form.register("full_name")} />
        {errors.full_name ? (
          <p className="mt-2 text-sm text-rose-600">{errors.full_name.message}</p>
        ) : null}
      </div>
      <div>
        <input className="input-light" placeholder="Telefono" {...form.register("phone")} />
      </div>
      <div>
        <input className="input-light" placeholder="Correo" {...form.register("email")} />
        {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p> : null}
      </div>
      <div>
        <input className="input-light" type="number" step="0.01" min="0" placeholder="Meta individual" {...form.register("target_amount")} />
        {errors.target_amount ? (
          <p className="mt-2 text-sm text-rose-600">{errors.target_amount.message}</p>
        ) : null}
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" {...form.register("active")} />
        Participante activo
      </label>
      <div className="md:col-span-2">
        <textarea
          className="input-light"
          rows="4"
          placeholder="Observaciones"
          {...form.register("observations")}
        />
      </div>
      <div className="md:col-span-2 flex justify-end">
        <button className="btn-primary" type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Guardando..." : "Guardar participante"}
        </button>
      </div>
    </form>
  );
}
