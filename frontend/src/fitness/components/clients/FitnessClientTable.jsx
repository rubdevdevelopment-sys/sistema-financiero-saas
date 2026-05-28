import { useMemo } from "react";

import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationTable } from "../../../foundation/tables/FoundationTable.jsx";
import { FoundationTableToolbar } from "../../../foundation/tables/FoundationTableToolbar.jsx";

function statusTone(status) {
  switch (status) {
    case "active":
      return "success";
    case "paused":
      return "warning";
    default:
      return "neutral";
  }
}

function levelTone(levelLabel) {
  switch (levelLabel) {
    case "Avanzado":
      return "danger";
    case "Intermedio":
      return "warning";
    default:
      return "success";
  }
}

export function FitnessClientTable({
  clients,
  search,
  onSearchChange,
  loading,
  emptyTitle,
  emptyDescription
}) {
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Cliente",
        minWidth: "14rem",
        render: (row) => (
          <div style={{ display: "grid", gap: "0.15rem" }}>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{row.name}</span>
            <span style={{ color: "#64748b", fontSize: "0.88rem" }}>{row.email || "Sin correo registrado"}</span>
          </div>
        )
      },
      {
        key: "goalLabel",
        label: "Objetivo"
      },
      {
        key: "levelLabel",
        label: "Nivel",
        render: (row) => <FoundationBadge tone={levelTone(row.levelLabel)}>{row.levelLabel}</FoundationBadge>
      },
      {
        key: "assignedTrainerLabel",
        label: "Entrenador"
      },
      {
        key: "routineLabel",
        label: "Rutina"
      },
      {
        key: "statusLabel",
        label: "Estado",
        render: (row) => <FoundationBadge tone={statusTone(row.status)}>{row.statusLabel}</FoundationBadge>
      },
      {
        key: "progressLabel",
        label: "Progreso",
        align: "center"
      },
      {
        key: "lastActivityLabel",
        label: "Ultima actividad"
      }
    ],
    []
  );

  return (
    <FoundationTable
      columns={columns}
      rows={clients}
      loading={loading}
      caption="Vista de clientes fitness con datos reales enriquecidos para la demo."
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      toolbar={
        <FoundationTableToolbar
          title="Seguimiento de clientes"
          description="Consulta de solo lectura con enfoque de entrenador y mensajes localizados para Colombia."
          searchLabel="Buscar cliente"
          searchHint="Filtra por nombre, objetivo, entrenador o plan activo."
          searchValue={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar cliente, objetivo o entrenador..."
          actions={
            <FoundationBadge tone="primary" outlined>
              Demo de staging
            </FoundationBadge>
          }
        />
      }
    />
  );
}

export default FitnessClientTable;
