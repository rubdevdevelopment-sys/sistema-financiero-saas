import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "../../schemas/category.js";
import { Modal } from "./Modal.jsx";
import { PaginationControls } from "./PaginationControls.jsx";

const categoryDefaults = {
  type: "income",
  name: "",
  color: "#22c55e",
  active: true
};

export function CategoryManager({
  type,
  data,
  loading,
  onPageChange,
  onCreate,
  onUpdate,
  onDelete
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const defaults = useMemo(
    () => ({
      ...categoryDefaults,
      type,
      color: type === "income" ? "#22c55e" : "#ef4444"
    }),
    [type]
  );

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: defaults
  });

  function openCreate() {
    setEditing(null);
    form.reset(defaults);
    setOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    form.reset({
      type: category.type,
      name: category.name,
      color: category.color ?? defaults.color,
      active: category.active
    });
    setOpen(true);
  }

  async function submit(values) {
    if (editing) {
      await onUpdate(editing.id, values);
    } else {
      await onCreate(values);
    }
    setOpen(false);
    setEditing(null);
    form.reset(defaults);
  }

  return (
    <section className="panel-soft overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Categorias</h3>
          <p className="mt-1 text-sm text-slate-500">
            Administra categorias del modulo sin salir de la pantalla.
          </p>
        </div>
        <button className="btn-primary" type="button" onClick={openCreate}>
          Nueva categoria
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Color</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Cargando categorias...
                </td>
              </tr>
            ) : data?.items?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No hay categorias registradas.
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-4 font-medium text-slate-900">{category.name}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: category.color ?? "#cbd5e1" }}
                      />
                      <span className="text-slate-500">{category.color ?? "Sin color"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={category.active ? "status-badge status-ok" : "status-badge"}>
                      {category.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button className="btn-secondary" type="button" onClick={() => openEdit(category)}>
                        Editar
                      </button>
                      <button
                        className="btn-danger"
                        type="button"
                        onClick={() => onDelete(category)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={data?.pagination?.page ?? 1}
        totalPages={data?.pagination?.total_pages ?? 1}
        total={data?.pagination?.total ?? 0}
        pageSize={data?.pagination?.page_size ?? 12}
        onPageChange={onPageChange}
      />

      <Modal
        open={open}
        title={editing ? "Editar categoria" : "Nueva categoria"}
        description="Las categorias se mantienen aisladas por empresa."
        onClose={() => setOpen(false)}
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
          <input type="hidden" {...form.register("type")} />
          <div className="md:col-span-2">
            <input
              className="input-light"
              placeholder="Nombre de la categoria"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="mt-2 text-sm text-rose-600">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Color</label>
            <input
              className="h-12 w-full rounded-2xl border border-slate-200 p-2"
              type="color"
              {...form.register("color")}
            />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...form.register("active")} />
            Categoria activa
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button className="btn-secondary" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Guardar categoria"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
