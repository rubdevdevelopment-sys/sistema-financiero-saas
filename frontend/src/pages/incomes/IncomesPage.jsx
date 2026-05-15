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

function emptyToNull(value) {
  return value === "" || value === undefined
    ? null
    : value;
}

function normalizeIncomePayload(values) {
  const incomeType =
    values.income_type || "participant_payment";
  const isParticipantPayment =
    incomeType === "participant_payment";

  return {
    income_type: incomeType,
    category_id: values.category_id,
    participant_id: isParticipantPayment
      ? emptyToNull(values.participant_id)
      : null,
    title: values.title?.trim(),
    description: emptyToNull(values.description?.trim()),
    amount: Number(values.amount),
    movement_date: values.movement_date,
    payment_method: values.payment_method?.trim(),
    status: values.status || "completed",
    installment_number:
      isParticipantPayment &&
      values.installment_number !== ""
        ? Number(values.installment_number)
        : null,
    receipt_number: emptyToNull(values.receipt_number?.trim()),
    responsible: emptyToNull(values.responsible?.trim()),
    attachment_url: emptyToNull(values.attachment_url?.trim()),
    notes: emptyToNull(values.notes?.trim())
  };
}

export function IncomesPage() {
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
    queryKey: ["category-options", "income"],

    queryFn: async () => {
      const response = await api.get("/categories", {
        params: {
          type: "income",
          active: "true",
          page: 1,
          page_size: 100
        }
      });

      return (
        response.data?.data?.items ||
        response.data?.items ||
        []
      );
    }
  });

  const categoriesQuery = useQuery({
    queryKey: [
      "categories",
      "income",
      categoryPage
    ],

    queryFn: async () => {
      const response = await api.get("/categories", {
        params: {
          type: "income",
          page: categoryPage,
          page_size: 8
        }
      });

      return (
        response.data?.data || {
          items: [],
          pagination: {}
        }
      );
    }
  });

  const incomesQuery = useQuery({
    queryKey: [
      "incomes",
      movementParams
    ],

    queryFn: async () => {
      const response = await api.get("/incomes", {
        params: movementParams
      });

      return (
        response.data?.data || {
          items: [],
          pagination: {},
          totals: {}
        }
      );
    }
  });

  const participantsQuery = useQuery({
  queryKey: ["participants-options"],
  queryFn: async () => {
    const response = await api.get("/participants", {
      params: {
        page: 1,
        page_size: 100
      }
    });

    return (
      response.data?.data?.items ||
      response.data?.items ||
      []
    );
  }
});


const participants =
  participantsQuery.data || [];


const incomes = incomesQuery.data?.items || [];

  const categoryOptions =
    categoryOptionsQuery.data ?? [];

  const totals = incomesQuery.data?.totals;

  const movementMutation = useMutation({
   mutationFn: async ({ id, payload }) => {

  if (id) {
    return api.put(
      `/incomes/${id}`,
      payload
    );
  }

  return api.post(
    "/incomes",
    payload
  );
},

    onSuccess: async () => {
      toast.success(
        editing
          ? "Ingreso actualizado"
          : "Ingreso registrado"
      );

      setEditing(null);

      setModalOpen(false);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["incomes"]
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"]
        })
      ]);
    },

onError: (error) => {
  toast.error(
    getApiErrorMessage(
      error,
      "No fue posible guardar el ingreso"
    )
  );
}
  });

const columns = [
  {
    header: "Concepto",
    accessorKey: "title"
  },
  {
    header: "Categoría",
    cell: ({ row }) =>
      row.original.category?.name ||
      row.original.category_name ||
      "-"
  },
  {
    header: "Participante",
    cell: ({ row }) =>
      row.original.participant?.full_name ||
      row.original.participant_name ||
      "-"
  },
  {
    header: "Monto",
    cell: ({ row }) =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
      }).format(row.original.amount || 0)
  },
  {
    header: "Estado",
    cell: ({ row }) => {
      const status =
        row.original.status;

      return (
        <span>
          {status === "completed"
            ? "Completado"
            : status === "pending"
            ? "Pendiente"
            : "Cancelado"}
        </span>
      );
    }
  },
  {
  header: "Fecha",
  cell: ({ row }) =>
    row.original.movement_date
},
{
  header: "Acciones",
  cell: ({ row }) => (
    <div className="flex gap-2">
      <button
        className="btn-secondary"
        onClick={() => {
          setEditing(row.original);
          setModalOpen(true);
        }}
      >
        Editar
      </button>

      <button
        className="btn-danger"
        onClick={async () => {
          const confirmed =
            window.confirm(
              `Se eliminara el ingreso "${row.original.title}". Deseas continuar?`
            );

          if (!confirmed) return;

          await deleteMutation.mutateAsync(
            row.original.id
          );
        }}
      >
        Eliminar
      </button>
    </div>
  )
}
];

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/incomes/${id}`),

    onSuccess: async () => {
      toast.success("Ingreso eliminado");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["incomes"]
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"]
        })
      ]);
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "No fue posible eliminar el ingreso"
        )
      );
    }
  });

  const categoryMutation = useMutation({
    mutationFn: async ({
      id,
      payload
    }) => {
      if (id) {
        return api.put(
          `/categories/${id}`,
          payload
        );
      }

      return api.post("/categories", {
        ...payload,
        company_id: user.company_id
      });
    },

    onSuccess: async (_, variables) => {
      toast.success(
        variables.id
          ? "Categoria actualizada"
          : "Categoria creada"
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["categories", "income"]
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "category-options",
            "income"
          ]
        }),

        queryClient.invalidateQueries({
          queryKey: ["incomes"]
        })
      ]);
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "No fue posible guardar la categoria"
        )
      );
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) =>
      api.delete(`/categories/${id}`),

    onSuccess: async () => {
      toast.success("Categoria eliminada");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["categories", "income"]
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "category-options",
            "income"
          ]
        }),

        queryClient.invalidateQueries({
          queryKey: ["incomes"]
        })
      ]);
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "No fue posible eliminar la categoria"
        )
      );
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
        title="Ingresos y recaudos"
        description="Gestiona aportes y recaudos."
        action={
          <button
            className="btn-primary"
            type="button"
            onClick={() =>
              setModalOpen(true)
            }
          >
            Nuevo ingreso
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ingreso filtrado"
          value={totals?.total_amount ?? 0}
          accent="bg-emerald-500"
        />

        <StatCard
          label="Ingresos completados"
          value={
            totals?.completed_amount ?? 0
          }
          accent="bg-emerald-700"
        />

        <StatCard
          label="Ingresos pendientes"
          value={totals?.pending_amount ?? 0}
          accent="bg-amber-500"
        />

        <StatCard
          label="Movimientos filtrados"
          value={
            incomesQuery.data?.pagination
              ?.total ?? 0
          }
          accent="bg-slate-900"
          formatter={integer}
        />
      </div>

      <section className="panel-soft p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-950">
            Filtros de ingresos
          </h3>

          <p className="text-sm text-slate-500">
            Consulta por categoria,
            estado, texto y rango de
            fechas.
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
          searchPlaceholder="Buscar por concepto o descripcion"
        />
      </section>

      {incomesQuery.isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getApiErrorMessage(
            incomesQuery.error,
            "No fue posible cargar los ingresos"
          )}
        </div>
      ) : null}

<DataTable
  columns={columns}
  data={
    incomesQuery.data?.items ||
    incomesQuery.data?.data?.items ||
    []
  }

  onEdit={(row) => {
    setEditing(row);
    setModalOpen(true);
  }}
  onDelete={async (row) => {
    const confirmed =
      window.confirm(
        `Se eliminara el ingreso "${row.title}". Deseas continuar?`
      );

    if (!confirmed) return;

    await deleteMutation.mutateAsync(
      row.id
    );
  }}
  variant="income"
pagination={
  incomesQuery.data?.pagination ||
  incomesQuery.data?.data?.pagination
}
  onPageChange={setPage}
  loading={incomesQuery.isLoading}
/>

      <CategoryManager
        type="income"
        data={categoriesQuery.data}
        loading={categoriesQuery.isLoading}
        onPageChange={setCategoryPage}
        onCreate={(payload) =>
          categoryMutation.mutateAsync({
            payload
          })
        }
        onUpdate={(id, payload) =>
          categoryMutation.mutateAsync({
            id,
            payload
          })
        }
        onDelete={async (category) => {
          const confirmed =
            window.confirm(
              `Se eliminara la categoria "${category.name}". Deseas continuar?`
            );

          if (!confirmed) return;

          await deleteCategoryMutation.mutateAsync(
            category.id
          );
        }}
      />

      <Modal
        open={modalOpen}
        title={
          editing
            ? "Editar ingreso"
            : "Nuevo ingreso"
        }
        description="Los ingresos se conservan aislados por empresa y afectan el dashboard Emaus."
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      >
<FinanceForm
  title={
    editing
      ? "Actualizar ingreso"
      : "Guardar ingreso"
  }
  categories={categoryOptions}
  participants={participants}
  mode="income"
  initialData={editing}
onSubmit={async (values) => {
  await movementMutation.mutateAsync({
    id: editing?.id,
    payload: normalizeIncomePayload(values)
  });
}}
/>
      </Modal>
    </div>
  );
}

export default IncomesPage;
