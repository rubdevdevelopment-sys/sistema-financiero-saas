import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { financeSchema } from "../../schemas/finance.js";

const initialState = {
  category_id: "",
  income_type: "participant_payment",
  participant_id: "",
  title: "",
  description: "",
  amount: "",
  movement_date: new Date().toISOString().slice(0, 10),
  payment_method: "Transferencia",
  status: "completed",
  installment_number: "",
  receipt_number: "",
  attachment_url: "",
  notes: "",
  responsible: "",
  authorized_by: "",
  receipt_reference: ""
};

function getInitialState(mode) {
  return {
    ...initialState,
    income_type:
      mode === "income"
        ? "participant_payment"
        : "other"
  };
}

export function FinanceForm({
  title,
  categories,
  participants = [],
  mode = "income",
  initialData,
  onSubmit
}) {
const form = useForm({
  resolver: zodResolver(financeSchema),
  defaultValues: getInitialState(mode)
});

useEffect(() => {
  if (initialData) {
    form.reset({
      income_type:
        initialData.income_type ||
        getInitialState(mode).income_type,

      category_id:
        initialData.category_id || "",

      participant_id:
        initialData.participant_id || "",

      title:
        initialData.title || "",

      amount:
        Number(initialData.amount) || 0,

      movement_date:
        initialData.movement_date
          ?.split("T")[0] || "",

      payment_method:
        initialData.payment_method || "",

      status:
        initialData.status || "completed",

      installment_number:
        initialData.installment_number || "",

      receipt_number:
        initialData.receipt_number || "",

      description:
        initialData.description || "",

      responsible:
        initialData.responsible || "",

      attachment_url:
        initialData.attachment_url || "",

      notes:
        initialData.notes || "",

      authorized_by:
        initialData.authorized_by || "",

      receipt_reference:
        initialData.receipt_reference || ""
    });

    return;
  }

  form.reset(getInitialState(mode));
}, [initialData, mode, form]);

  const errors = form.formState.errors;

  const selectedIncomeType =
    form.watch("income_type");

  const showParticipant =
    mode === "income" &&
    (selectedIncomeType ??
      "participant_payment") ===
      "participant_payment";

async function submit(values) {

  await onSubmit(values);

  form.reset(getInitialState(mode));
}

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={form.handleSubmit(submit)}
    >
      {mode === "income" ? (
        <div>
          <select
            className="input-light"
            {...form.register("income_type")}
          >
            <option value="participant_payment">
              Aporte participante
            </option>

            <option value="donation">
              Donacion
            </option>

            <option value="sponsorship">
              Patrocinio
            </option>

            <option value="event_income">
              Ingreso de evento
            </option>

            <option value="other">
              Otro ingreso
            </option>
          </select>
        </div>
      ) : (
        <div>
          <input
            className="input-light"
            placeholder="Autorizado por"
            {...form.register("authorized_by")}
          />
        </div>
      )}

      {showParticipant ? (
        <div>
          <select
            className="input-light"
            {...form.register("participant_id")}
          >
            <option value="">
              Selecciona participante
            </option>

            {participants.map((participant) => (
             <option
              key={participant.id}
              value={participant.id}
            >
            {
  participant.full_name ||
  participant.name ||
  `${participant.first_name || ""} ${participant.last_name || ""}`
}
            </option>
            ))}
          </select>

          {errors.participant_id ? (
            <p className="mt-2 text-sm text-rose-600">
              {errors.participant_id.message}
            </p>
          ) : null}
        </div>
      ) : (
        <div>
          {mode === "income" ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Este ingreso no afectara saldos de participantes.
            </div>
          ) : (
            <input
              className="input-light"
              placeholder="Referencia del recibo"
              {...form.register("receipt_reference")}
            />
          )}
        </div>
      )}

      <div>
        <select
          className="input-light"
          {...form.register("category_id")}
        >
          <option value="">
            Selecciona categoria
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        {errors.category_id ? (
          <p className="mt-2 text-sm text-rose-600">
            {errors.category_id.message}
          </p>
        ) : null}
      </div>

      <div>
        <input
          className="input-light"
          placeholder="Titulo"
          {...form.register("title")}
        />

        {errors.title ? (
          <p className="mt-2 text-sm text-rose-600">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div>
       <input
  type="number"
  step="0.01"
  className="input-light"
  placeholder="Monto"
  {...form.register("amount", {
    valueAsNumber: true
  })}
/>

        {errors.amount ? (
          <p className="mt-2 text-sm text-rose-600">
            {errors.amount.message}
          </p>
        ) : null}
      </div>

      <div>
        <input
          type="date"
          className="input-light"
          {...form.register("movement_date")}
        />

        {errors.movement_date ? (
          <p className="mt-2 text-sm text-rose-600">
            {errors.movement_date.message}
          </p>
        ) : null}
      </div>

      <div>
        <input
          className="input-light"
          placeholder="Metodo de pago"
          {...form.register("payment_method")}
        />

        {errors.payment_method ? (
          <p className="mt-2 text-sm text-rose-600">
            {errors.payment_method.message}
          </p>
        ) : null}
      </div>

      <div>
        <select
          className="input-light"
          {...form.register("status")}
        >
          <option value="completed">
            Completado
          </option>

          <option value="pending">
            Pendiente
          </option>

          <option value="cancelled">
            Cancelado
          </option>
        </select>
      </div>

      {showParticipant ? (
        <>
          <div>
            <input
              className="input-light"
              type="number"
              min="1"
              placeholder="Numero de cuota"
              {...form.register(
                "installment_number"
              )}
            />
          </div>

          <div>
            <input
              className="input-light"
              placeholder="Numero de comprobante"
              {...form.register(
                "receipt_number"
              )}
            />
          </div>
        </>
      ) : mode === "expense" ? (
        <div>
          <input
            className="input-light"
            placeholder="Referencia del recibo"
            {...form.register(
              "receipt_reference"
            )}
          />
        </div>
      ) : (
        <div>
          <input
            className="input-light"
            placeholder="Numero de comprobante"
            {...form.register(
              "receipt_number"
            )}
          />
        </div>
      )}

      <div className="md:col-span-2">
        <input
          className="input-light"
          placeholder="Descripcion"
          {...form.register("description")}
        />
      </div>

      <div>
        <input
          className="input-light"
          placeholder="Responsable"
          {...form.register("responsible")}
        />
      </div>

      <div>
        <input
          className="input-light"
          placeholder="URL de adjunto"
          {...form.register("attachment_url")}
        />

        {errors.attachment_url ? (
          <p className="mt-2 text-sm text-rose-600">
            {errors.attachment_url.message}
          </p>
        ) : null}
      </div>

      <div className="md:col-span-2">
        <textarea
          className="input-light"
          rows="4"
          placeholder="Observaciones"
          {...form.register("notes")}
        />
      </div>

<div className="md:col-span-2 flex justify-end">
  <button type="submit" className="btn-primary">
    {title}
  </button>
</div>
</form>
);
}

export default FinanceForm;
