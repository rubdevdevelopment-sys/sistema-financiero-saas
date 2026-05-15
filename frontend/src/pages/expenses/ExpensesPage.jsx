import { useDeferredValue, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../services/api.js";
import { queryClient } from "../../services/queryClient.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { FinanceForm } from "../../components/common/FinanceForm.jsx";
import { DataTable } from "../../components/common/DataTable.jsx";
import { CategoryManager } from "../../components/common/CategoryManager.jsx";
import { FinanceFilters } from "../../components/common/FinanceFilters.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { getApiErrorMessage } from "../../utils/api.js";
import { integer } from "../../utils/format.js";

const initialFilters = {
  search: "",
  status: "",
  category_id: "",
  date_from: "",
  date_to: ""
};

export function ExpensesPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const deferredSearch = useDeferredValue(filters.search);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);

  const movementParams = useMemo(
    () => ({
      page,
      page_size: 10,
      search: deferredSearch || undefined,
      status: filters.status || undefined,
      category_id: filters.category_id || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined
    }),
    [deferredSearch, filters, page]
  );

const categoryOptionsQuery = useQuery({
  queryKey: ["category-options", "expense"],

  queryFn: async () => {

    const response = await api.get("/categories", {
      params: {
        type: "expense",
        active: "true",
        page: 1,
        page_size: 100
      }
    });

    console.log("EXPENSE CATEGORY OPTIONS", response.data);

    return response.data.data.items || [];
  }
});

  const categoriesQuery = useQuery({
    queryKey: ["categories", "expense", categoryPage],
    queryFn: async () => {
      const response = await api.get("/categories", {
        params: { type: "expense", page: categoryPage, page_size: 8 }
      });
      return response.data.data;
    }
  });

queryFn: async () => {

  const response = await api.get("/expenses", {
    params: filters
  });

  console.log("EXPENSES RESPONSE", response.data);

  return response.data.data;
}

  const categoryOptions = categoryOptionsQuery.data ?? [];
  const totals = expensesQuery.data?.totals;

  const movementMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) return api.put(`/expenses/${id}`, payload);
      return api.post("/expenses", payload);
    },
    onSuccess: async () => {
      toast.success(editing ? "Gasto actualizado" : "Gasto registrado");
      setEditing(null);
      setModalOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No fue posible guardar el gasto"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/expenses/${id}`),
    onSuccess: async () => {
      toast.success("Gasto eliminado");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No fue posible eliminar el gasto"));
    }
  });

  const categoryMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) return api.put(`/categories/${id}`, payload);
      return api.post("/categories", { ...payload, company_id: user.company_id });
    },
    onSuccess: async (_, variables) => {
      toast.success(variables.id ? "Categoria actualizada" : "Categoria creada");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories", "expense"] }),
        queryClient.invalidateQueries({ queryKey: ["category-options", "expense"] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] })
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No fue posible guardar la categoria"));
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: async () => {
      toast.success("Categoria eliminada");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories", "expense"] }),
        queryClient.invalidateQueries({ queryKey: ["category-options", "expense"] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] })
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No fue posible eliminar la categoria"));
    }
  });

  function updateFilter(key, value) {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Retiro Emaus"
        title="Gastos operativos"
        description="Registra gastos con responsable, autorizacion y referencia de recibo."
        action={
          <button className="btn-primary" type="button" onClick={() => setModalOpen(true)}>
            Nuevo gasto
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gasto filtrado" value={totals?.total_amount ?? 0} accent="bg-rose-500" />
        <StatCard label="Gastos completados" value={totals?.completed_amount ?? 0} accent="bg-rose-700" />
        <StatCard label="Gastos pendientes" value={totals?.pending_amount ?? 0} accent="bg-amber-500" />
        <StatCard label="Movimientos filtrados" value={expensesQuery.data?.pagination?.total ?? 0} accent="bg-slate-900" formatter={integer} />
      </div>

      <section className="panel-soft p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-950">Filtros de gastos</h3>
          <p className="text-sm text-slate-500">
            Consulta por categoria, estado, texto y rango de fechas.
          </p>
        </div>
        <FinanceFilters
          filters={filters}
          categories={categoryOptions}
          onChange={updateFilter}
          onReset={() => {
            setPage(1);
            setFilters(initialFilters);
          }}
          searchPlaceholder="Buscar por concepto, descripcion o autorizado"
        />
      </section>

      {expensesQuery.isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getApiErrorMessage(expensesQuery.error, "No fue posible cargar los gastos")}
        </div>
      ) : null}

      <DataTable
        rows={expensesQuery.data?.items ?? []}
        onEdit={(row) => {
          setEditing(row);
          setModalOpen(true);
        }}
        onDelete={async (row) => {
          const confirmed = window.confirm(`Se eliminara el gasto "${row.title}". Deseas continuar?`);
          if (!confirmed) return;
          await deleteMutation.mutateAsync(row.id);
        }}
        showResponsible
        variant="expense"
        pagination={expensesQuery.data?.pagination}
        onPageChange={setPage}
        loading={expensesQuery.isLoading}
      />

      <CategoryManager
        type="expense"
        data={categoriesQuery.data}
        loading={categoriesQuery.isLoading}
        onPageChange={setCategoryPage}
        onCreate={(payload) => categoryMutation.mutateAsync({ payload })}
        onUpdate={(id, payload) => categoryMutation.mutateAsync({ id, payload })}
        onDelete={async (category) => {
          const confirmed = window.confirm(
            `Se eliminara la categoria "${category.name}". Deseas continuar?`
          );
          if (!confirmed) return;
          await deleteCategoryMutation.mutateAsync(category.id);
        }}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Editar gasto" : "Nuevo gasto"}
        description="Los gastos se conservan aislados por empresa y afectan el dashboard Emaus."
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <FinanceForm
          title={editing ? "Actualizar gasto" : "Guardar gasto"}
          categories={categoryOptions}
          mode="expense"
          initialData={editing}
          onSubmit={(payload) =>
            movementMutation.mutateAsync({
              id: editing?.id,
              payload
            })
          }
        />
      </Modal>
    </div>
  );
}

export default ExpensesPage;