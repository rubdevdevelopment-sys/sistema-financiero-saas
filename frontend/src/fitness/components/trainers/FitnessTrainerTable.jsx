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

export function FitnessTrainerTable({
  trainers,
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
        label: "Entrenador",
        minWidth: "14rem",
        render: (row) => (
          <div style={{ display: "grid", gap: "0.15rem" }}>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{row.name}</span>
            <span style={{ color: "#64748b", fontSize: "0.88rem" }}>{row.specializationLabel}</span>
          </div>
        )
      },
      {
        key: "statusLabel",
        label: "Estado",
        render: (row) => <FoundationBadge tone={statusTone(row.status)}>{row.statusLabel}</FoundationBadge>
      },
      {
        key: "specializationLabel",
        label: "Especializacion"
      },
      {
        key: "email",
        label: "Correo",
        render: (row) => row.email || "Sin correo"
      },
      {
        key: "phone",
        label: "Telefono",
        render: (row) => row.phone || "Sin telefono"
      },
      {
        key: "assignedClientsCount",
        label: "Clientes asignados",
        align: "center"
      },
      {
        key: "supervisedRoutinesCount",
        label: "Rutinas supervisadas",
        align: "center"
      }
    ],
    []
  );

  return (
    <FoundationTable
      columns={columns}
      rows={trainers}
      loading={loading}
      caption="Vista de entrenadores del workspace fitness con foco comercial y operativo."
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      toolbar={
        <FoundationTableToolbar
          title="Equipo de entrenadores"
          description="Consulta de solo lectura para revisar estado, especialidades y capacidad visible del equipo."
          searchLabel="Buscar entrenador"
          searchHint="Filtra por nombre, especializacion o correo."
          searchValue={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar entrenador o especializacion..."
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

export default FitnessTrainerTable;
