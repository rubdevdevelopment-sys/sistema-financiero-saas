import { useDeferredValue, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../services/api.js";
import { queryClient } from "../../services/queryClient.js";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { ParticipantForm } from "../../components/common/ParticipantForm.jsx";
import { ParticipantFilters } from "../../components/common/ParticipantFilters.jsx";
import { ParticipantTable } from "../../components/common/ParticipantTable.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { getApiErrorMessage } from "../../utils/api.js";
import { currency, integer, percent, formatDate, formatCurrency } from "../../utils/format.js";

const initialFilters = {
  search: "",
  payment_status: "",
  active: ""
};

export function ParticipantsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const deferredSearch = useDeferredValue(filters.search);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const participantParams = useMemo(
    () => ({
      page,
      page_size: 10,
      search: deferredSearch || undefined,
      payment_status: filters.payment_status || undefined,
      active: filters.active || undefined
    }),
    [deferredSearch, filters.active, filters.payment_status, page]
  );

  const companyQuery = useQuery({
    queryKey: ["company-current"],
    queryFn: async () => {
      const response = await api.get("/companies/current");
      return response.data.data;
    }
  });

  const participantsQuery = useQuery({
    queryKey: ["participants", participantParams],
    queryFn: async () => {
      const response = await api.get("/participants", { params: participantParams });
      return response.data.data;
    }
  });

  const detailQuery = useQuery({
    queryKey: ["participant-detail", selectedParticipant?.id],
    enabled: Boolean(selectedParticipant?.id),
    queryFn: async () => {
      const response = await api.get(`/participants/${selectedParticipant.id}`);
      return response.data.data;
    }
  });

  const participantMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      if (id) return api.put(`/participants/${id}`, payload);
      return api.post("/participants", payload);
    },
    onSuccess: async () => {
      toast.success(editing ? "Participante actualizado" : "Participante creado");
      setModalOpen(false);
      setEditing(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["participants"] }),
        queryClient.invalidateQueries({ queryKey: ["participant-options"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No fue posible guardar el participante"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/participants/${id}`),
    onSuccess: async () => {
      toast.success("Participante eliminado");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["participants"] }),
        queryClient.invalidateQueries({ queryKey: ["participant-options"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["category-options", "income"] })
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No fue posible eliminar el participante"));
    }
  });

  async function exportCsv() {
    try {
      const response = await api.get("/participants/exportar/csv", {
        params: participantParams,
        responseType: "blob"
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "participantes-emaus.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV generado");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No fue posible exportar el CSV"));
    }
  }

  function updateFilter(key, value) {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  const summary = participantsQuery.data?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Retiro Emaus"
        title="Participantes y recaudo"
        description="Controla aportantes, metas individuales, saldos pendientes e historial de cuotas."
        action={
          <div className="flex gap-3">
            <button className="btn-secondary" type="button" onClick={exportCsv}>
              Exportar CSV
            </button>
            <button className="btn-secondary" type="button" onClick={() => window.print()}>
              Exportar PDF
            </button>
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Nuevo participante
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Participantes" value={summary?.total_participants ?? 0} accent="bg-slate-900" formatter={integer} />
        <StatCard label="Meta global" value={summary?.total_target ?? 0} accent="bg-sky-500" />
        <StatCard label="Recaudado" value={summary?.total_paid ?? 0} accent="bg-emerald-500" />
        <StatCard label="Pendiente" value={summary?.total_pending ?? 0} accent="bg-amber-500" />
      </div>

      <section className="panel-soft p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Filtros de participantes</h3>
            <p className="text-sm text-slate-500">
              La meta por defecto actual es {formatCurrency(companyQuery.data?.valor_objetivo_emaus ?? 460000)} por participante.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Cumplimiento global:{" "}
            <span className="font-semibold text-slate-950">
              {percent(summary?.total_target ? (summary.total_paid / summary.total_target) * 100 : 0)}
            </span>
          </div>
        </div>

        <ParticipantFilters
          filters={filters}
          onChange={updateFilter}
          onReset={() => {
            setPage(1);
            setFilters(initialFilters);
          }}
        />
      </section>

      {participantsQuery.isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getApiErrorMessage(participantsQuery.error, "No fue posible cargar participantes")}
        </div>
      ) : null}

      <ParticipantTable
        rows={participantsQuery.data?.items ?? []}
        pagination={participantsQuery.data?.pagination}
        loading={participantsQuery.isLoading}
        onPageChange={setPage}
        onView={(participant) => {
          setSelectedParticipant(participant);
          setDetailOpen(true);
        }}
        onEdit={(participant) => {
          setEditing(participant);
          setModalOpen(true);
        }}
        onDelete={async (participant) => {
          const confirmed = window.confirm(
            `Se eliminara el participante "${participant.full_name}". Deseas continuar?`
          );
          if (!confirmed) return;
          await deleteMutation.mutateAsync(participant.id);
        }}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Editar participante" : "Nuevo participante"}
        description="Cada participante conserva su meta, total pagado y saldo pendiente por empresa."
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      >
        <ParticipantForm
          initialData={editing}
          defaultTargetAmount={companyQuery.data?.valor_objetivo_emaus ?? 460000}
          onSubmit={(payload) => participantMutation.mutateAsync({ id: editing?.id, payload })}
        />
      </Modal>

      <Modal
        open={detailOpen}
        title={selectedParticipant ? `Historial de ${selectedParticipant.full_name}` : "Historial"}
        description="Aportes cronologicos y estado actual del participante."
        onClose={() => {
          setDetailOpen(false);
          setSelectedParticipant(null);
        }}
      >
        <div className="space-y-5">
          {detailQuery.isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Cargando historial del participante...
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Pagado</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCurrency(detailQuery.data?.participant?.total_paid ?? 0)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Pendiente</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCurrency(detailQuery.data?.participant?.pending_balance ?? 0)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Ultimo aporte</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {detailQuery.data?.metrics?.ultimo_aporte
                  ? formatDate(detailQuery.data.metrics.ultimo_aporte)
                  : "Sin registro"}
              </p>
            </article>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Concepto</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Cuota</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Comprobante</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(detailQuery.data?.aportes ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No hay aportes registrados.
                    </td>
                  </tr>
                ) : (
                  (detailQuery.data?.aportes ?? []).map((aporte) => (
                    <tr key={aporte.id}>
                      <td className="px-4 py-4">{formatDate(aporte.movement_date)}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{aporte.title}</div>
                        <div className="text-xs text-slate-500">{aporte.category_name}</div>
                      </td>
                      <td className="px-4 py-4">{aporte.installment_number || "-"}</td>
                      <td className="px-4 py-4">{aporte.receipt_number || "-"}</td>
                      <td className="px-4 py-4 font-semibold">{formatCurrency(aporte.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ParticipantsPage;