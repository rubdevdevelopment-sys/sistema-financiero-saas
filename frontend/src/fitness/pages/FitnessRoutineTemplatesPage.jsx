import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getRoutineTemplateStructure,
  listRoutineTemplates
} from "../api/routineTemplatesApi.js";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { getApiErrorMessage } from "../../utils/api.js";
import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";
import { FoundationPageHeader } from "../../foundation/layouts/FoundationPageHeader.jsx";
import { FoundationPageLayout } from "../../foundation/layouts/FoundationPageLayout.jsx";
import { FoundationTable } from "../../foundation/tables/FoundationTable.jsx";
import { FoundationTableToolbar } from "../../foundation/tables/FoundationTableToolbar.jsx";

function formatLabel(value, fallback = "No definido") {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeLevelTone(value) {
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
  const { activeCompany, isSupportMode } = useActiveCompany();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const companyId = activeCompany?.id ?? null;

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
      [
        item?.name,
        item?.goal,
        item?.level
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    );
  }, [deferredSearch, templatesQuery.data]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        minWidth: "14rem"
      },
      {
        key: "goal",
        label: "Goal",
        render: (row) => formatLabel(row.goal)
      },
      {
        key: "level",
        label: "Level",
        render: (row) => (
          <FoundationBadge tone={normalizeLevelTone(row.level)}>
            {formatLabel(row.level)}
          </FoundationBadge>
        )
      },
      {
        key: "duration_weeks",
        label: "Duration Weeks",
        align: "center"
      },
      {
        key: "is_active",
        label: "Is Active",
        render: (row) => (
          <FoundationBadge tone={row.is_active ? "success" : "neutral"} outlined={!row.is_active}>
            {row.is_active ? "Active" : "Inactive"}
          </FoundationBadge>
        )
      },
      {
        key: "totalWeeks",
        label: "Total Weeks",
        align: "center"
      },
      {
        key: "totalDays",
        label: "Total Days",
        align: "center"
      },
      {
        key: "totalExercises",
        label: "Total Exercises",
        align: "center"
      }
    ],
    []
  );

  const totalTemplates = Array.isArray(templatesQuery.data) ? templatesQuery.data.length : 0;
  const totalWeeksVisible = filteredTemplates.reduce(
    (total, item) => total + (item.totalWeeks ?? 0),
    0
  );
  const totalExercisesVisible = filteredTemplates.reduce(
    (total, item) => total + (item.totalExercises ?? 0),
    0
  );

  return (
    <FoundationPageLayout>
      <FoundationPageHeader
        eyebrow="Fitness Foundation"
        title="Fitness Routine Templates"
        description="Plantillas demo del modulo Fitness Foundation"
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
          description="Selecciona una empresa activa para consultar las plantillas demo del modulo Fitness Foundation."
        >
          <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
            La pantalla se mantiene en modo seguro si no existe `companyId` temporal disponible y
            no intenta consultar la API.
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
          eyebrow="Templates"
          title={String(totalTemplates)}
          description="Plantillas activas enriquecidas con métricas de estructura."
          accent="#2563eb"
        />
        <FoundationCard
          eyebrow="Weeks"
          title={String(totalWeeksVisible)}
          description="Suma visible de semanas dentro del filtro actual."
          accent="#7c3aed"
        />
        <FoundationCard
          eyebrow="Exercises"
          title={String(totalExercisesVisible)}
          description="Asignaciones de ejercicios visibles en las plantillas cargadas."
          accent="#0f766e"
        />
      </div>

      {templatesQuery.isError ? (
        <FoundationCard
          title="No fue posible cargar las plantillas"
          description={getApiErrorMessage(
            templatesQuery.error,
            "La consulta Fitness Core fallo y la pantalla permanecio en modo seguro."
          )}
          accent="#dc2626"
        >
          <FoundationBadge tone="danger">Fallback seguro activo</FoundationBadge>
        </FoundationCard>
      ) : null}

      <FoundationTable
        columns={columns}
        rows={filteredTemplates}
        loading={Boolean(companyId) && templatesQuery.isLoading}
        caption="Listado demo de templates de rutinas Fitness Foundation en modo solo lectura."
        emptyTitle={companyId ? "No hay plantillas para mostrar" : "Sin empresa activa"}
        emptyDescription={
          companyId
            ? deferredSearch.trim()
              ? "No hay coincidencias para el filtro actual."
              : "La empresa activa no tiene plantillas demo visibles en este momento."
            : "La pantalla se mantiene aislada hasta contar con un companyId temporal."
        }
        toolbar={
          <FoundationTableToolbar
            title="Catalogo de plantillas"
            description="Consulta de solo lectura con métricas calculadas desde la estructura de cada rutina."
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar template, objetivo o nivel..."
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

export default FitnessRoutineTemplatesPage;
