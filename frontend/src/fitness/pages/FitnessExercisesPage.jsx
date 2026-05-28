import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listExercises } from "../api/exercisesApi.js";
import { useFitnessCompanyScope } from "../hooks/useFitnessCompanyScope.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";
import { FoundationPageHeader } from "../../foundation/layouts/FoundationPageHeader.jsx";
import { FoundationTable } from "../../foundation/tables/FoundationTable.jsx";
import { FoundationTableToolbar } from "../../foundation/tables/FoundationTableToolbar.jsx";
import { FitnessStatCard } from "../components/FitnessStatCard.jsx";

function difficultyTone(value) {
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
  const { companyId, company, isSupportMode, isDemoScope, isLoading: isScopeLoading } =
    useFitnessCompanyScope();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

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
      [item?.name, item?.category, item?.muscle_group, item?.equipment, item?.difficulty]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    );
  }, [deferredSearch, exercisesQuery.data]);

  const columns = useMemo(
    () => [
      { key: "name", label: "Ejercicio", minWidth: "12rem" },
      {
        key: "category",
        label: "Categoria",
        render: (row) => formatLabel(row.category)
      },
      {
        key: "muscle_group",
        label: "Grupo muscular",
        render: (row) => formatLabel(row.muscle_group)
      },
      {
        key: "equipment",
        label: "Equipo",
        render: (row) => formatLabel(row.equipment)
      },
      {
        key: "difficulty",
        label: "Dificultad",
        render: (row) => (
          <FoundationBadge tone={difficultyTone(row.difficulty)}>
            {formatLabel(row.difficulty)}
          </FoundationBadge>
        )
      },
      {
        key: "is_active",
        label: "Estado",
        render: (row) => (
          <FoundationBadge tone={row.is_active ? "success" : "neutral"} outlined={!row.is_active}>
            {row.is_active ? "Activo" : "Inactivo"}
          </FoundationBadge>
        )
      }
    ],
    []
  );

  const totalExercises = Array.isArray(exercisesQuery.data) ? exercisesQuery.data.length : 0;
  const categoriesVisible = new Set(filteredExercises.map((item) => item.category).filter(Boolean)).size;
  const equipmentVisible = new Set(filteredExercises.map((item) => item.equipment).filter(Boolean)).size;

  return (
    <>
      <FoundationPageHeader
        eyebrow="Fitness Foundation"
        title="Ejercicios"
        description="Ejercicios demo del modulo Fitness Foundation"
        meta={
          <>
            <FoundationBadge tone="primary" outlined>
              Solo lectura
            </FoundationBadge>
            {company?.name ? <FoundationBadge tone="info" outlined>{company.name}</FoundationBadge> : null}
            {isDemoScope ? <FoundationBadge tone="success">54 ejercicios demo</FoundationBadge> : null}
            {isSupportMode ? (
              <FoundationBadge tone="warning" outlined>
                Modo soporte
              </FoundationBadge>
            ) : null}
          </>
        }
      />

      {!companyId && !isScopeLoading ? (
        <FoundationCard
          title="Necesitas una empresa activa"
          description="Selecciona o resuelve una empresa valida para consultar el catalogo de ejercicios."
        >
          <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
            Si no existe `companyId`, la pantalla conserva un fallback seguro y evita cualquier llamada a la API.
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
        <FitnessStatCard
          eyebrow="Catalogo"
          title={String(totalExercises)}
          description="Ejercicios activos cargados desde la API fitness."
          accent="#0f766e"
        />
        <FitnessStatCard
          eyebrow="Categorias"
          title={String(categoriesVisible)}
          description="Categorias visibles con el filtro actual."
          accent="#2563eb"
        />
        <FitnessStatCard
          eyebrow="Equipos"
          title={String(equipmentVisible)}
          description="Variantes de equipo disponibles dentro de la empresa."
          accent="#7c3aed"
        />
        <FitnessStatCard
          eyebrow="Busqueda"
          title={deferredSearch.trim() ? "Filtro activo" : "Sin filtro"}
          description={
            deferredSearch.trim()
              ? `Coincidencias para: ${deferredSearch.trim()}`
              : "Explora por ejercicio, grupo muscular, categoria o equipo."
          }
          accent="#ea580c"
        />
      </div>

      {exercisesQuery.isError ? (
        <FoundationCard
          title="No fue posible cargar los ejercicios"
          description={getApiErrorMessage(
            exercisesQuery.error,
            "La consulta Fitness Core fallo y la pantalla quedo en modo seguro."
          )}
          accent="#dc2626"
        >
          <FoundationBadge tone="danger">Fallback seguro activo</FoundationBadge>
        </FoundationCard>
      ) : null}

      <FoundationTable
        columns={columns}
        rows={filteredExercises}
        loading={Boolean(companyId) && (exercisesQuery.isLoading || isScopeLoading)}
        caption="Catalogo visual de ejercicios fitness en modo lectura."
        emptyTitle={companyId ? "No hay ejercicios para mostrar" : "Sin empresa activa"}
        emptyDescription={
          companyId
            ? deferredSearch.trim()
              ? "No encontramos ejercicios que coincidan con tu busqueda."
              : "Esta empresa no tiene ejercicios visibles en este momento."
            : "La vista se mantiene aislada hasta contar con una empresa segura."
        }
        toolbar={
          <FoundationTableToolbar
            title="Catalogo de ejercicios"
            description="Un listado pensado para navegar rapido entre movimientos, equipos y niveles de dificultad."
            searchLabel="Buscar ejercicio"
            searchHint="Filtra por nombre, grupo muscular, categoria, equipo o dificultad."
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar ejercicio, categoria o equipo..."
            actions={
              <FoundationBadge tone="primary" outlined>
                Demo de staging
              </FoundationBadge>
            }
          />
        }
      />
    </>
  );
}

export default FitnessExercisesPage;
