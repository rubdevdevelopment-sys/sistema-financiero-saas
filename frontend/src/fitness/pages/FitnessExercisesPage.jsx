import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listExercises } from "../api/exercisesApi.js";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { getApiErrorMessage } from "../../utils/api.js";
import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";
import { FoundationPageHeader } from "../../foundation/layouts/FoundationPageHeader.jsx";
import { FoundationPageLayout } from "../../foundation/layouts/FoundationPageLayout.jsx";
import { FoundationTable } from "../../foundation/tables/FoundationTable.jsx";
import { FoundationTableToolbar } from "../../foundation/tables/FoundationTableToolbar.jsx";

function normalizeDifficultyTone(value) {
  switch (value) {
    case "advanced":
      return "danger";
    case "intermediate":
      return "warning";
    case "beginner":
      return "success";
    default:
      return "neutral";
  }
}

function formatLabel(value, fallback = "No definido") {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function FitnessExercisesPage() {
  const { activeCompany, isSupportMode } = useActiveCompany();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const companyId = activeCompany?.id ?? null;

  const exercisesQuery = useQuery({
    queryKey: ["fitness-exercises", companyId],
    queryFn: () => listExercises(companyId, { isActive: true }),
    enabled: Boolean(companyId)
  });

  const filteredExercises = useMemo(() => {
    const rows = Array.isArray(exercisesQuery.data) ? exercisesQuery.data : [];
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((item) =>
      [
        item?.name,
        item?.category,
        item?.muscle_group,
        item?.equipment,
        item?.difficulty
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    );
  }, [deferredSearch, exercisesQuery.data]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        minWidth: "12rem"
      },
      {
        key: "category",
        label: "Category",
        render: (row) => formatLabel(row.category)
      },
      {
        key: "muscle_group",
        label: "Muscle Group",
        render: (row) => formatLabel(row.muscle_group)
      },
      {
        key: "equipment",
        label: "Equipment",
        render: (row) => formatLabel(row.equipment)
      },
      {
        key: "difficulty",
        label: "Difficulty",
        render: (row) => (
          <FoundationBadge tone={normalizeDifficultyTone(row.difficulty)}>
            {formatLabel(row.difficulty)}
          </FoundationBadge>
        )
      },
      {
        key: "is_active",
        label: "Is Active",
        render: (row) => (
          <FoundationBadge tone={row.is_active ? "success" : "neutral"} outlined={!row.is_active}>
            {row.is_active ? "Active" : "Inactive"}
          </FoundationBadge>
        )
      }
    ],
    []
  );

  const totalExercises = Array.isArray(exercisesQuery.data) ? exercisesQuery.data.length : 0;

  return (
    <FoundationPageLayout>
      <FoundationPageHeader
        eyebrow="Fitness Foundation"
        title="Fitness Exercises"
        description="Ejercicios demo del modulo Fitness Foundation"
        meta={
          <>
            <FoundationBadge tone="info" outlined>
              Lectura aislada
            </FoundationBadge>
            <FoundationBadge tone={companyId ? "success" : "warning"} outlined={!companyId}>
              {companyId ? "CompanyId activo" : "Sin companyId"}
            </FoundationBadge>
            {isSupportMode ? (
              <FoundationBadge tone="warning" outlined>
                Soporte temporal
              </FoundationBadge>
            ) : null}
          </>
        }
      />

      {!companyId ? (
        <FoundationCard
          title="Empresa activa requerida"
          description="Selecciona una empresa activa para consultar los ejercicios demo del modulo Fitness Foundation."
        >
          <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
            Esta pantalla no crea datos ni hace wiring global. Si no hay `companyId` disponible,
            mantiene un fallback seguro y no consulta la API.
          </p>
        </FoundationCard>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))"
        }}
      >
        <FoundationCard
          eyebrow="Dataset"
          title={String(totalExercises)}
          description="Ejercicios demo activos cargados desde Fitness Core API."
          accent="#2563eb"
        />
        <FoundationCard
          eyebrow="Search"
          title={deferredSearch.trim() ? "Filtro aplicado" : "Sin filtro"}
          description={
            deferredSearch.trim()
              ? `Busqueda local: ${deferredSearch.trim()}`
              : "Puedes filtrar por nombre, categoria, grupo muscular, equipo o dificultad."
          }
          accent="#0f766e"
        />
      </div>

      {exercisesQuery.isError ? (
        <FoundationCard
          title="No fue posible cargar los ejercicios"
          description={getApiErrorMessage(
            exercisesQuery.error,
            "La consulta Fitness Core fallo y la pantalla permanecio en modo seguro."
          )}
          accent="#dc2626"
        >
          <FoundationBadge tone="danger">Fallback seguro activo</FoundationBadge>
        </FoundationCard>
      ) : null}

      <FoundationTable
        columns={columns}
        rows={filteredExercises}
        loading={Boolean(companyId) && exercisesQuery.isLoading}
        caption="Listado demo de ejercicios Fitness Foundation en modo solo lectura."
        emptyTitle={companyId ? "No hay ejercicios para mostrar" : "Sin empresa activa"}
        emptyDescription={
          companyId
            ? deferredSearch.trim()
              ? "No hay coincidencias para el filtro actual."
              : "La empresa activa no tiene ejercicios demo visibles en este momento."
            : "La pantalla se mantiene aislada hasta contar con un companyId temporal."
        }
        toolbar={
          <FoundationTableToolbar
            title="Catalogo de ejercicios"
            description="Consulta de solo lectura con componentes Foundation y filtro local seguro."
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar ejercicio, categoria, grupo muscular..."
            actions={
              <FoundationBadge tone="primary" outlined>
                Demo staging
              </FoundationBadge>
            }
          />
        }
      />
    </FoundationPageLayout>
  );
}

export default FitnessExercisesPage;
