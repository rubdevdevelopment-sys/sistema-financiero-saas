import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { FinanceForm } from "../../components/common/FinanceForm.jsx";
import { DataTable } from "../../components/common/DataTable.jsx";
import { CategoryQuickCreate } from "../../components/common/CategoryQuickCreate.jsx";

export function IncomesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [incomeResponse, categoryResponse] = await Promise.all([
      api.get("/incomes"),
      api.get("/categories?type=income")
    ]);

    setRows(incomeResponse.data.data);
    setCategories(categoryResponse.data.data);
  }

  async function handleSubmit(payload) {
    if (editing) {
      await api.put(`/incomes/${editing.id}`, payload);
    } else {
      await api.post("/incomes", payload);
    }
    setEditing(null);
    await loadData();
  }

  async function handleDelete(row) {
    await api.delete(`/incomes/${row.id}`);
    await loadData();
  }

  async function handleCreateCategory(payload) {
    await api.post("/categories", payload);
    await loadData();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Modulo Financiero"
        title="Gestion de ingresos"
        description="Administra entradas de dinero, categorias, historial, notas y estados."
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <FinanceForm
            title={editing ? "Editar ingreso" : "Nuevo ingreso"}
            categories={categories}
            initialData={editing}
            onSubmit={handleSubmit}
            onCancel={editing ? () => setEditing(null) : null}
          />
          <CategoryQuickCreate companyId={user.company_id} type="income" onCreate={handleCreateCategory} />
        </div>

        <div className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Resumen del modulo</h3>
          <p className="mt-2 text-sm text-slate-500">
            Este modulo ya queda preparado para filtros avanzados, exportaciones y adjuntos via Supabase Storage.
          </p>
          <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Registros actuales</p>
            <p className="mt-2 text-4xl font-semibold">{rows.length}</p>
          </div>
        </div>
      </div>

      <DataTable rows={rows} onEdit={setEditing} onDelete={handleDelete} showResponsible />
    </div>
  );
}
