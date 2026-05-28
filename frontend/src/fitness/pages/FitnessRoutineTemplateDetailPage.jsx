import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import {
  getRoutineTemplateById,
  getRoutineTemplateStructure
} from "../api/routineTemplatesApi.js";
import { useFitnessCompanyScope } from "../hooks/useFitnessCompanyScope.js";
import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationButton } from "../../foundation/components/FoundationButton.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";
import { FoundationLoader } from "../../foundation/components/FoundationLoader.jsx";
import { FoundationPageHeader } from "../../foundation/layouts/FoundationPageHeader.jsx";
import { getApiErrorMessage } from "../../utils/api.js";
import { RoutineMetricCard } from "../components/routines/RoutineMetricCard.jsx";
import { RoutineStructureSidebar } from "../components/routines/RoutineStructureSidebar.jsx";
import { RoutineWeekCard } from "../components/routines/RoutineWeekCard.jsx";
import {
  localizeFitnessGoal,
  localizeFitnessLevel,
  localizeRoutineName
} from "../utils/fitnessLocalization.js";

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

function buildMetrics(structure) {
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
    totalExercises,
    averageExercisesPerDay:
      totalDays > 0 ? (totalExercises / totalDays).toFixed(1) : "0.0"
  };
}

export function FitnessRoutineTemplateDetailPage() {
  const { id: templateId } = useParams();
  const { companyId, company, isDemoScope, isLoading: isScopeLoading } = useFitnessCompanyScope();
  const [activeWeekId, setActiveWeekId] = useState(null);
  const weekRefs = useRef({});

  const detailQuery = useQuery({
    queryKey: ["fitness-routine-template-detail", companyId, templateId],
    queryFn: async () => {
      const [template, structure] = await Promise.all([
        getRoutineTemplateById(companyId, templateId),
        getRoutineTemplateStructure(companyId, templateId)
      ]);

      return {
        template,
        structure
      };
    },
    enabled: Boolean(companyId && templateId)
  });

  const structure = detailQuery.data?.structure ?? null;
  const template = detailQuery.data?.template ?? structure ?? null;
  const weeks = Array.isArray(structure?.weeks) ? structure.weeks : [];
  const metrics = useMemo(() => buildMetrics(structure), [structure]);

  useEffect(() => {
    if (!activeWeekId && weeks[0]?.id) {
      setActiveWeekId(weeks[0].id);
    }
  }, [activeWeekId, weeks]);

  function handleSelectWeek(weekId) {
    setActiveWeekId(weekId);
    const section = weekRefs.current[weekId];
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const isLoading = Boolean(companyId && templateId) && (detailQuery.isLoading || isScopeLoading);

  return (
    <>
      <FoundationPageHeader
        eyebrow="Fitness Foundation"
        title={template?.name ? localizeRoutineName(template.name) : "Detalle de rutina"}
        description={template?.description ?? "Visualizacion detallada de una rutina demo del modulo Fitness Foundation"}
        actions={
          <Link to="/fitness/routines" style={{ textDecoration: "none" }}>
            <FoundationButton variant="secondary">Volver a plantillas</FoundationButton>
          </Link>
        }
        meta={
          <>
            {company?.name ? (
              <FoundationBadge tone="primary" outlined>
                {company.name}
              </FoundationBadge>
            ) : null}
            {template?.goal ? (
              <FoundationBadge tone="info" outlined>
                {localizeFitnessGoal(template.goal)}
              </FoundationBadge>
            ) : null}
            {template?.level ? (
              <FoundationBadge tone={levelTone(template.level)}>
                {localizeFitnessLevel(template.level)}
              </FoundationBadge>
            ) : null}
            <FoundationBadge tone={template?.is_active ? "success" : "neutral"} outlined={!template?.is_active}>
              {template?.is_active ? "Activa" : "Inactiva"}
            </FoundationBadge>
            {isDemoScope ? <FoundationBadge tone="success">Empresa demo</FoundationBadge> : null}
          </>
        }
      />

      {!companyId && !isScopeLoading ? (
        <FoundationCard
          title="Empresa activa requerida"
          description="No hay companyId resuelto para consultar la estructura detallada de la rutina."
        >
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
            La experiencia permanece en fallback seguro hasta contar con una empresa valida.
          </p>
        </FoundationCard>
      ) : null}

      {detailQuery.isError ? (
        <FoundationCard
          title="No fue posible cargar la rutina"
          description={getApiErrorMessage(
            detailQuery.error,
            "La estructura detallada no pudo cargarse y la vista quedo en modo seguro."
          )}
          accent="#dc2626"
        >
          <FoundationBadge tone="danger">Fallback seguro activo</FoundationBadge>
        </FoundationCard>
      ) : null}

      {isLoading ? (
        <FoundationCard title="Cargando rutina" description="Recuperando la estructura completa de la plantilla seleccionada.">
          <FoundationLoader label="Cargando semanas, dias y ejercicios..." />
        </FoundationCard>
      ) : null}

      {!isLoading && template ? (
        <>
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))"
            }}
          >
            <RoutineMetricCard eyebrow="Semanas" title={String(metrics.totalWeeks)} description="Semanas visibles en esta plantilla." accent="#2563eb" />
            <RoutineMetricCard eyebrow="Dias" title={String(metrics.totalDays)} description="Dias de entrenamiento distribuidos en la rutina." accent="#7c3aed" />
            <RoutineMetricCard eyebrow="Ejercicios" title={String(metrics.totalExercises)} description="Asignaciones totales de ejercicios en la estructura." accent="#0f766e" />
            <RoutineMetricCard eyebrow="Promedio" title={String(metrics.averageExercisesPerDay)} description="Promedio de ejercicios por dia de entrenamiento." accent="#ea580c" />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              flexWrap: "wrap"
            }}
          >
            <aside
              style={{
                minWidth: "18rem",
                flex: "0 1 20rem",
                width: "100%"
              }}
            >
              <RoutineStructureSidebar
                weeks={weeks}
                activeWeekId={activeWeekId}
                onSelectWeek={handleSelectWeek}
                metrics={metrics}
              />
            </aside>

            <div
              style={{
                minWidth: 0,
                flex: "1 1 42rem",
                width: "100%",
                display: "grid",
                gap: "1rem"
              }}
            >
              {weeks.length === 0 ? (
                <FoundationCard
                  title="Sin estructura disponible"
                  description="La plantilla existe pero no tiene semanas visibles en este momento."
                >
                  <FoundationBadge tone="warning" outlined>
                    Aun sin bloques visibles
                  </FoundationBadge>
                </FoundationCard>
              ) : (
                weeks.map((week, index) => (
                  <RoutineWeekCard
                    key={week.id ?? `week-${week.week_number}`}
                    week={week}
                    defaultExpanded={index === 0}
                    sectionRef={(element) => {
                      weekRefs.current[week.id] = element;
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export default FitnessRoutineTemplateDetailPage;
