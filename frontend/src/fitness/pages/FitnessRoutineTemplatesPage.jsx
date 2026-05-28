import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getRoutineTemplateStructure, listRoutineTemplates } from "../api/routineTemplatesApi.js";
import { useFitnessCompanyScope } from "../hooks/useFitnessCompanyScope.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";
import { FoundationPageHeader } from "../../foundation/layouts/FoundationPageHeader.jsx";
import { FoundationTable } from "../../foundation/tables/FoundationTable.jsx";
import { FoundationTableToolbar } from "../../foundation/tables/FoundationTableToolbar.jsx";
import { FitnessStatCard } from "../components/FitnessStatCard.jsx";

function formatLabel(value, fallback = "No definido") {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function levelTone(value) {
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

function buildTemplateMetrics(structure) {
  const weeks = Array.isArray(structure?.weeks) ? structure.weeks : [];
  const totalWeeks = weeks.length;
  const totalDays = weeks.reduce((total, week) => total + (week.days?.length ?? 0), 0);
  const totalExercises = weeks.reduce(
    (total, week) =>
      total +
      (week.days ?? []).reduce((dayTotal, day) => dayTotal + (day.exercises?.length ?? 0), 0),
    0
  );

  return {
    totalWeeks,
    totalDays,
    totalExercises
  };
}

export function FitnessRoutineTemplatesPage() {
  const { companyId, company, isSupportMode, isDemoScope, isLoading: isScopeLoading } =
    useFitnessCompanyScope();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const templatesQuery = useQuery({
    queryKey: ["fitness-routine-templates", companyId],
    queryFn: async () => {
      const templates = await listRoutineTemplates(companyId, { isActive: true });
      const structures = await Promise.all(
        templates.map(async (template) => {
          const structure = await getRoutineTemplateStructure(companyId, template.id);
          return {
            ...template,
            ...buildTemplateMetrics(structure)
          };
        })
      );

      return structures;
    },
    enabled: Boolean(companyId)
  });

  const filteredTemplates = useMemo(() => {
    const rows = Array.isArray(templatesQuery.data) ? templatesQuery.data : [];
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((item) =>
      [item?.name, item?.goal, item?.level]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    );
  }, [deferredSearch, templatesQuery.data]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Plantilla",
        minWidth: "14rem",
        render: (row) => (
          <Link
            to={`/fitness/routines/${row.id}`}
            style={{ color: "#0f172a", fontWeight: 700, textDecoration: "none" }}
          >
            {row.name}
          </Link>
        )
      },
      {
        key: "goal",
        label: "Objetivo",
        render: (row) => formatLabel(row.goal)
      },
      {
        key: "level",
        label: "Nivel",
        render: (row) => (
          <FoundationBadge tone={levelTone(row.level)}>{formatLabel(row.level)}</FoundationBadge>
        )
      },
      {
        key: "duration_weeks",
        label: "Duracion",
        align: "center",
        render: (row) => `${row.duration_weeks} semanas`
      },
      {
        key: "is_active",
        label: "Estado",
        render: (row) => (
          <FoundationBadge tone={row.is_active ? "success" : "neutral"} outlined={!row.is_active}>
            {row.is_active ? "Activa" : "Inactiva"}
          </FoundationBadge>
        )
      },
      {
        key: "totalWeeks",
        label: "Semanas",
        align: "center"
      },
      {
        key: "totalDays",
        label: "Dias",
        align: "center"
      },
      {
        key: "totalExercises",
        label: "Ejercicios",
        align: "center"
      },
      {
        key: "actions",
        label: "Detalle",
        render: (row) => (
          <Link
            to={`/fitness/routines/${row.id}`}
            style={{ color: "#0f766e", fontWeight: 700, textDecoration: "none" }}
          >
            Abrir rutina
          </Link>
        )
      }
    ],
    []
  );

  const totalTemplates = Array.isArray(templatesQuery.data) ? templatesQuery.data.length : 0;
  const totalWeeksVisible = filteredTemplates.reduce((total, item) => total + (item.totalWeeks ?? 0), 0);
  const totalExercisesVisible = filteredTemplates.reduce(
    (total, item) => total + (item.totalExercises ?? 0),
    0
  );

  return (
    <>
      <FoundationPageHeader
        eyebrow="Fitness Foundation"
        title="Plantillas de rutina"
        description="Plantillas demo del modulo Fitness Foundation"
        meta={
          <>
            <FoundationBadge tone="primary" outlined>
              Solo lectura
            </FoundationBadge>
            {company?.name ? <FoundationBadge tone="info" outlined>{company.name}</FoundationBadge> : null}
            {isDemoScope ? <FoundationBadge tone="success">8 plantillas demo</FoundationBadge> : null}
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
          description="Selecciona o resuelve una empresa valida para consultar las plantillas fitness."
        >
          <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
            La experiencia mantiene tenant safety y no consulta la API hasta tener un scope valido.
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
          eyebrow="Plantillas"
          title={String(totalTemplates)}
          description="Programas activos enriquecidos con su estructura real."
          accent="#2563eb"
        />
        <FitnessStatCard
          eyebrow="Semanas visibles"
          title={String(totalWeeksVisible)}
          description="Suma visible de semanas dentro del filtro actual."
          accent="#7c3aed"
        />
        <FitnessStatCard
          eyebrow="Ejercicios visibles"
          title={String(totalExercisesVisible)}
          description="Asignaciones reales de ejercicios dentro de las rutinas cargadas."
          accent="#0f766e"
        />
        <FitnessStatCard
          eyebrow="Busqueda"
          title={deferredSearch.trim() ? "Filtro activo" : "Sin filtro"}
          description={
            deferredSearch.trim()
              ? `Coincidencias para: ${deferredSearch.trim()}`
              : "Explora por nombre, objetivo o nivel."
          }
          accent="#ea580c"
        />
      </div>

      {templatesQuery.isError ? (
        <FoundationCard
          title="No fue posible cargar las plantillas"
          description={getApiErrorMessage(
            templatesQuery.error,
            "La consulta Fitness Core fallo y la pantalla quedo en modo seguro."
          )}
          accent="#dc2626"
        >
          <FoundationBadge tone="danger">Fallback seguro activo</FoundationBadge>
        </FoundationCard>
      ) : null}

      <FoundationTable
        columns={columns}
        rows={filteredTemplates}
        loading={Boolean(companyId) && (templatesQuery.isLoading || isScopeLoading)}
        caption="Listado de plantillas fitness con metricas reales de estructura."
        emptyTitle={companyId ? "No hay plantillas para mostrar" : "Sin empresa activa"}
        emptyDescription={
          companyId
            ? deferredSearch.trim()
              ? "No encontramos plantillas que coincidan con tu busqueda."
              : "Esta empresa no tiene plantillas visibles en este momento."
            : "La vista se mantiene aislada hasta contar con una empresa segura."
        }
        toolbar={
          <FoundationTableToolbar
            title="Biblioteca de rutinas"
            description="Consulta de programas fitness con una jerarquia visual pensada para ventas, operacion y coaching."
            searchLabel="Buscar plantilla"
            searchHint="Filtra por nombre, objetivo o nivel."
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar plantilla, objetivo o nivel..."
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

export default FitnessRoutineTemplatesPage;
