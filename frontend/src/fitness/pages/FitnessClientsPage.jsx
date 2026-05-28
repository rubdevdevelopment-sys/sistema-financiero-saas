import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listFitnessClients } from "../api/fitnessClientsApi.js";
import { useFitnessCompanyScope } from "../hooks/useFitnessCompanyScope.js";
import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";
import { FoundationPageHeader } from "../../foundation/layouts/FoundationPageHeader.jsx";
import { getApiErrorMessage } from "../../utils/api.js";
import { FitnessStatCard } from "../components/FitnessStatCard.jsx";
import { FitnessClientCard } from "../components/clients/FitnessClientCard.jsx";
import { FitnessClientProgressCard } from "../components/clients/FitnessClientProgressCard.jsx";
import { FitnessClientTable } from "../components/clients/FitnessClientTable.jsx";

const DEMO_LEVELS = ["Principiante", "Intermedio", "Avanzado"];
const DEMO_ROUTINES = [
  "Plan de cuerpo completo",
  "Definicion inicial",
  "Fuerza tren inferior",
  "Movilidad y recuperacion",
  "Acondicionamiento funcional"
];
const DEMO_ACTIVITIES = [
  "Hoy, 7:15 a. m.",
  "Ayer, 6:40 p. m.",
  "Hace 2 dias",
  "Hoy, 5:55 a. m.",
  "Hace 3 dias"
];

function toTitleLabel(value, fallback = "No definido") {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildAvatarInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

function enrichClients(clients) {
  return clients.map((client, index) => {
    const progressPercent = 46 + index * 17;

    return {
      ...client,
      avatarInitials: buildAvatarInitials(client.name),
      goalLabel: client.goal || "Acompañamiento general",
      statusLabel: client.status === "active" ? "Activo" : toTitleLabel(client.status, "Sin estado"),
      levelLabel: DEMO_LEVELS[index % DEMO_LEVELS.length],
      routineLabel: DEMO_ROUTINES[index % DEMO_ROUTINES.length],
      assignedTrainerLabel: client.assigned_trainer_name || "Sin entrenador asignado",
      progressPercent,
      progressLabel: `${progressPercent}%`,
      lastActivityLabel: DEMO_ACTIVITIES[index % DEMO_ACTIVITIES.length]
    };
  });
}

export function FitnessClientsPage() {
  const { companyId, company, isSupportMode, isDemoScope, isLoading: isScopeLoading } =
    useFitnessCompanyScope();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const clientsQuery = useQuery({
    queryKey: ["fitness-clients", companyId],
    queryFn: async () => {
      const clients = await listFitnessClients(companyId, { status: "active" });
      return enrichClients(Array.isArray(clients) ? clients : []);
    },
    enabled: Boolean(companyId)
  });

  const filteredClients = useMemo(() => {
    const rows = Array.isArray(clientsQuery.data) ? clientsQuery.data : [];
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((client) =>
      [
        client.name,
        client.goalLabel,
        client.assignedTrainerLabel,
        client.routineLabel,
        client.levelLabel
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    );
  }, [clientsQuery.data, deferredSearch]);

  const totalClients = Array.isArray(clientsQuery.data) ? clientsQuery.data.length : 0;
  const activeClients = filteredClients.filter((client) => client.status === "active").length;
  const averageProgress = filteredClients.length
    ? Math.round(
        filteredClients.reduce((total, client) => total + client.progressPercent, 0) /
          filteredClients.length
      )
    : 0;

  const loading = Boolean(companyId) && (clientsQuery.isLoading || isScopeLoading);

  return (
    <>
      <FoundationPageHeader
        eyebrow="Fitness Foundation"
        title="Clientes fitness"
        description="Vista demo para seguimiento comercial y deportivo de clientes en un contexto ES-CO."
        meta={
          <>
            <FoundationBadge tone="primary" outlined>
              Solo lectura
            </FoundationBadge>
            {company?.name ? (
              <FoundationBadge tone="info" outlined>
                {company.name}
              </FoundationBadge>
            ) : null}
            {isDemoScope ? <FoundationBadge tone="success">Dataset demo activo</FoundationBadge> : null}
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
          description="Esta vista se mantiene protegida hasta resolver un tenant valido para consultar clientes fitness."
        >
          <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
            No se hace ningun bypass. Si falta `companyId`, la experiencia permanece en fallback
            seguro y no consulta la API.
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
          eyebrow="Clientes"
          title={String(totalClients)}
          description="Personas visibles en el pipeline de acompanamiento fitness."
          accent="#0f766e"
        />
        <FitnessStatCard
          eyebrow="Activos"
          title={String(activeClients)}
          description="Clientes con seguimiento activo dentro del tenant actual."
          accent="#2563eb"
        />
        <FitnessStatCard
          eyebrow="Progreso promedio"
          title={`${averageProgress}%`}
          description="Lectura demo para reforzar la sensacion de seguimiento constante."
          accent="#7c3aed"
        />
        <FitnessStatCard
          eyebrow="Busqueda"
          title={deferredSearch.trim() ? "Filtro activo" : "Sin filtro"}
          description={
            deferredSearch.trim()
              ? `Mostrando coincidencias para: ${deferredSearch.trim()}`
              : "Explora por cliente, objetivo, entrenador o rutina."
          }
          accent="#ea580c"
        />
      </div>

      {clientsQuery.isError ? (
        <FoundationCard
          title="No fue posible cargar los clientes"
          description={getApiErrorMessage(
            clientsQuery.error,
            "La consulta de clientes fallo y la vista se mantuvo en modo seguro."
          )}
          accent="#dc2626"
        >
          <FoundationBadge tone="danger">Fallback seguro activo</FoundationBadge>
        </FoundationCard>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))"
        }}
      >
        {loading
          ? [0, 1].map((item) => (
              <FoundationCard
                key={`client-skeleton-${item}`}
                title="Cargando cliente"
                description="Preparando la experiencia de seguimiento del cliente."
              />
            ))
          : filteredClients.slice(0, 2).map((client) => <FitnessClientCard key={client.id} client={client} />)}
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))"
        }}
      >
        {loading
          ? [0, 1].map((item) => (
              <FoundationCard
                key={`progress-skeleton-${item}`}
                title="Cargando progreso"
                description="Sincronizando indicadores de progreso demo."
              />
            ))
          : filteredClients.slice(0, 2).map((client) => (
              <FitnessClientProgressCard key={`progress-${client.id}`} client={client} />
            ))}
      </div>

      <FitnessClientTable
        clients={filteredClients}
        search={search}
        onSearchChange={setSearch}
        loading={loading}
        emptyTitle={companyId ? "No hay clientes para mostrar" : "Sin empresa activa"}
        emptyDescription={
          companyId
            ? deferredSearch.trim()
              ? "No encontramos clientes que coincidan con el filtro actual."
              : "Todavia no hay clientes visibles para esta empresa dentro de la demo."
            : "La vista permanece aislada hasta tener un companyId seguro."
        }
      />
    </>
  );
}

export default FitnessClientsPage;
