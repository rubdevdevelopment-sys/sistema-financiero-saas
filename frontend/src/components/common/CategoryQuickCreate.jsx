import { useState } from "react";

export function CategoryQuickCreate({ companyId, type, onCreate }) {
  const [name, setName] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await onCreate({
      company_id: companyId,
      type,
      name,
      color: type === "income" ? "#22c55e" : "#ef4444",
      active: true
    });
    setName("");
  }

  return (
    <form className="panel-soft p-5" onSubmit={handleSubmit}>
      <p className="text-sm font-semibold text-slate-900">Crear categoria rapida</p>
      <p className="mt-1 text-sm text-slate-500">
        Agrega nuevas categorias sin salir del modulo.
      </p>
      <div className="mt-4 flex gap-3">
        <input
          className="input-light"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre de categoria"
        />
        <button className="btn-primary" type="submit">
          Crear
        </button>
      </div>
    </form>
  );
}
