import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { listExercises } from "../api/exercisesApi.js";
import { listFitnessClients } from "../api/fitnessClientsApi.js";
import { listRoutineTemplates } from "../api/routineTemplatesApi.js";
import { listTrainers } from "../api/trainersApi.js";
import { useFitnessCompanyScope } from "../hooks/useFitnessCompanyScope.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";
import { FoundationPageHeader } from "../../foundation/layouts/FoundationPageHeader.jsx";
import { FitnessDashboardHero } from "../components/dashboard/FitnessDashboardHero.jsx";
import { FitnessDashboardMetricGrid } from "../components/dashboard/FitnessDashboardMetricGrid.jsx";
import { FitnessQuickActions } from "../components/dashboard/FitnessQuickActions.jsx";
import { FitnessRecentClients } from "../components/dashboard/FitnessRecentClients.jsx";
import { FitnessRoutineOverview } from "../components/dashboard/FitnessRoutineOverview.jsx";

export function FitnessDashboardPage() {
  const { companyId, company, isDemoScope, isSupportMode, isLoading: isScopeLoading } =
    useFitnessCompanyScope();

  const [clientsQuery, routinesQuery, exercisesQuery, trainersQuery] = useQueries({
    queries: [
      {
        queryKey: ["fitness-dashboard-clients", companyId],
        queryFn: () => listFitnessClients(companyId, { status: "active" }),
        enabled: Boolean(companyId)
      },
      {
        queryKey: ["fitness-dashboard-routines", companyId],
        queryFn: () => listRoutineTemplates(companyId, { isActive: true }),
        enabled: Boolean(companyId)
      },
      {
        queryKey: ["fitness-dashboard-exercises", companyId],
        queryFn: () => listExercises(companyId, { isActive: true }),
        enabled: Boolean(companyId)
      },
      {
        queryKey: ["fitness-dashboard-trainers", companyId],
        queryFn: () => listTrainers(companyId, { status: "active" }),
        enabled: Boolean(companyId)
      }
    ]
  });

  const dashboardError =
    clientsQuery.error || routinesQuery.error || exercisesQuery.error || trainersQuery.error || null;
  const isLoading =
    Boolean(companyId) &&
    (isScopeLoading ||
      clientsQuery.isLoading ||
      routinesQuery.isLoading ||
      exercisesQuery.isLoading ||
      trainersQuery.isLoading);

  const clients = Array.isArray(clientsQuery.data) ? clientsQuery.data : [];
  const routines = Array.isArray(routinesQuery.data) ? routinesQuery.data : [];
  const exercises = Array.isArray(exercisesQuery.data) ? exercisesQuery.data : [];
  const trainers = Array.isArray(trainersQuery.data) ? trainersQuery.data : [];

  const metrics = useMemo(
    () => ({
      activeClients: clients.length,
      routines: routines.length,
      exercises: exercises.length,
      trainers: trainers.length
    }),
    [clients.length, routines.length, exercises.length, trainers.length]
  );

  return (
    <>
      <FoundationPageHeader
        eyebrow="Fitness Foundation"
        title="Panel comercial fitness"
        description="La portada del workspace fitness para conectar operación, acompañamiento y venta en una sola vista."
        meta={
          <>
            <FoundationBadge tone="primary" outlined>
              Solo lectura
            </FoundationBadge>
            {company?.name ? <FoundationBadge tone="info" outlined>{company.name}</FoundationBadge> : null}
            {isDemoScope ? <FoundationBadge tone="success">Datos demo reales</FoundationBadge> : null}
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
          description="El dashboard comercial se mantiene aislado hasta tener un tenant válido para consultar la API."
        >
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
            Esta portada no hace bypass. Si falta `companyId`, mantiene fallback seguro y evita cargar datos.
          </p>
        </FoundationCard>
      ) : null}

      {dashboardError ? (
        <FoundationCard
          title="No fue posible cargar el panel fitness"
          description={getApiErrorMessage(
            dashboardError,
            "Alguna de las consultas del dashboard falló y la experiencia quedó en modo seguro."
          )}
          accent="#dc2626"
        >
          <FoundationBadge tone="danger">Fallback seguro activo</FoundationBadge>
        </FoundationCard>
      ) : null}

      <FitnessDashboardHero company={company} hasScope={Boolean(companyId)} isDemoScope={isDemoScope} />

      <FitnessDashboardMetricGrid metrics={metrics} />

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))"
        }}
      >
        <FitnessQuickActions />

        <FoundationCard
          title="Bloque comercial"
          description="Una narrativa corta para presentar el valor del módulo desde la primera pantalla."
          accent="#14b8a6"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(236,253,245,0.94) 100%)"
          }}
        >
          <p style={{ margin: 0, color: "#334155", lineHeight: 1.75 }}>
            Gestiona entrenamientos, clientes y rutinas desde un solo lugar. Usa esta vista para abrir una conversación
            comercial, preparar una demo con datos reales del tenant o entrar rápidamente al flujo operativo del coach.
          </p>
        </FoundationCard>
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))"
        }}
      >
        <FitnessRecentClients clients={clients.slice(0, 3)} />
        <FitnessRoutineOverview routines={routines.slice(0, 3)} />
      </div>

      {isLoading ? (
        <FoundationCard
          title="Cargando dashboard"
          description="Preparando métricas, clientes y rutinas del workspace fitness."
        />
      ) : null}
    </>
  );
}

export default FitnessDashboardPage;
