import { useEffect, useState } from "react";

const initialState = {
  category_id: "",
  title: "",
  description: "",
  amount: "",
  movement_date: new Date().toISOString().slice(0, 10),
  payment_method: "Transferencia",
  status: "completed",
  attachment_url: "",
  notes: "",
  responsible: ""
};

export function FinanceForm({ title, categories, initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (initialData) {
      setForm({
        category_id: initialData.category_id ?? "",
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        amount: initialData.amount ?? "",
        movement_date: initialData.movement_date?.slice(0, 10) ?? "",
        payment_method: initialData.payment_method ?? "Transferencia",
        status: initialData.status ?? "completed",
        attachment_url: initialData.attachment_url ?? "",
        notes: initialData.notes ?? "",
        responsible: initialData.responsible ?? ""
      });
    } else {
      setForm(initialState);
    }
  }, [initialData]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialState);
  }

  return (
    <form className="panel-soft p-6" onSubmit={handleSubmit}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <select
          name="category_id"
          className="input-light"
          value={form.category_id}
          onChange={updateField}
          required
        >
          <option value="">Selecciona categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          className="input-light"
          name="title"
          placeholder="Titulo"
          value={form.title}
          onChange={updateField}
          required
        />
        <input
          className="input-light"
          name="amount"
          type="number"
          min="1"
          placeholder="Monto"
          value={form.amount}
          onChange={updateField}
          required
        />
        <input
          className="input-light"
          name="movement_date"
          type="date"
          value={form.movement_date}
          onChange={updateField}
          required
        />
        <input
          className="input-light"
          name="payment_method"
          placeholder="Metodo de pago"
          value={form.payment_method}
          onChange={updateField}
          required
        />
        <select
          name="status"
          className="input-light"
          value={form.status}
          onChange={updateField}
          required
        >
          <option value="completed">Completado</option>
          <option value="pending">Pendiente</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <input
          className="input-light md:col-span-2"
          name="description"
          placeholder="Descripcion"
          value={form.description}
          onChange={updateField}
        />
        <input
          className="input-light"
          name="responsible"
          placeholder="Responsable"
          value={form.responsible}
          onChange={updateField}
        />
        <input
          className="input-light"
          name="attachment_url"
          placeholder="URL de adjunto"
          value={form.attachment_url}
          onChange={updateField}
        />
        <textarea
          className="input-light md:col-span-2"
          name="notes"
          rows="3"
          placeholder="Observaciones"
          value={form.notes}
          onChange={updateField}
        />
      </div>

      <button className="btn-primary mt-5" type="submit">
        Guardar
      </button>
    </form>
  );
}
