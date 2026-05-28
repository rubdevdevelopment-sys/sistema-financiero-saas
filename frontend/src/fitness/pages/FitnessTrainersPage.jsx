import { useDeferredValue, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import { listFitnessClients } from "../api/fitnessClientsApi.js";
import { listTrainers } from "../api/trainersApi.js";
import { useFitnessCompanyScope } from "../hooks/useFitnessCompanyScope.js";
import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";
import { FoundationPageHeader } from "../../foundation/layouts/FoundationPageHeader.jsx";
import { getApiErrorMessage } from "../../utils/api.js";
import { FitnessTrainerCard } from "../components/trainers/FitnessTrainerCard.jsx";
import { FitnessTrainerStats } from "../components/trainers/FitnessTrainerStats.jsx";
import { FitnessTrainerTable } from "../components/trainers/FitnessTrainerTable.jsx";

const DEMO_ROUTINES_BY_INDEX = [4, 3, 2, 5];

function buildAvatarInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

function toTitleLabel(value, fallback = "No definido") {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function enrichTrainers(trainers, clients) {
  return trainers.map((trainer, index) => {
    const assignedClientsCount = clients.filter(
      (client) => client.assigned_trainer_id && client.assigned_trainer_id === trainer.id
    ).length;

    return {
      ...trainer,
      avatarInitials: buildAvatarInitials(trainer.name),
      statusLabel: trainer.status === "active" ? "Activo" : toTitleLabel(trainer.status, "Sin estado"),
      specializationLabel: trainer.specialization || "Especializacion general",
      assignedClientsCount,
      supervisedRoutinesCount: DEMO_ROUTINES_BY_INDEX[index % DEMO_ROUTINES_BY_INDEX.length]
    };
  });
}

export function FitnessTrainersPage() {
  const { companyId, company, isSupportMode, isDemoScope, isLoading: isScopeLoading } =
    useFitnessCompanyScope();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [trainersQuery, clientsQuery] = useQueries({
    queries: [
      {
        queryKey: ["fitness-trainers", companyId],
        queryFn: () => listTrainers(companyId, { status: "active" }),
        enabled: Boolean(companyId)
      },
      {
        queryKey: ["fitness-trainer-clients", companyId],
        queryFn: () => listFitnessClients(companyId, { status: "active" }),
        enabled: Boolean(companyId)
      }
    ]
  });

  const enrichedTrainers = useMemo(() => {
    const trainers = Array.isArray(trainersQuery.data) ? trainersQuery.data : [];
    const clients = Array.isArray(clientsQuery.data) ? clientsQuery.data : [];
    return enrichTrainers(trainers, clients);
  }, [clientsQuery.data, trainersQuery.data]);

  const filteredTrainers = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return enrichedTrainers;
    }

    return enrichedTrainers.filter((trainer) =>
      [trainer.name, trainer.specializationLabel, trainer.email, trainer.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    );
  }, [deferredSearch, enrichedTrainers]);

  const metrics = useMemo(() => {
    const specializations = new Set(
      enrichedTrainers.map((trainer) => trainer.specializationLabel).filter(Boolean)
    ).size;

    return {
      activeTrainers: enrichedTrainers.filter((trainer) => trainer.status === "active").length,
      specializations,
      assignedClients: enrichedTrainers.reduce(
        (total, trainer) => total + trainer.assignedClientsCount,
        0
      ),
      supervisedRoutines: enrichedTrainers.reduce(
        (total, trainer) => total + trainer.supervisedRoutinesCount,
        0
      )
    };
  }, [enrichedTrainers]);

  const loading =
    Boolean(companyId) && (isScopeLoading || trainersQuery.isLoading || clientsQuery.isLoading);
  const error = trainersQuery.error || clientsQuery.error || null;

  return (
    <>
      <FoundationPageHeader
        eyebrow="Fitness Foundation"
        title="Entrenadores"
        description="Gestiona el equipo de entrenadores del workspace Fitness"
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
            {isDemoScope ? <FoundationBadge tone="success">2 entrenadores demo</FoundationBadge> : null}
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
          description="Esta vista se mantiene protegida hasta resolver un tenant valido para consultar entrenadores."
        >
          <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>
            Si falta `companyId`, la experiencia permanece en fallback seguro y no consulta la API.
          </p>
        </FoundationCard>
      ) : null}

      <FitnessTrainerStats metrics={metrics} />

      {error ? (
        <FoundationCard
          title="No fue posible cargar los entrenadores"
          description={getApiErrorMessage(
            error,
            "La consulta de entrenadores fallo y la vista se mantuvo en modo seguro."
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
                key={`trainer-skeleton-${item}`}
                title="Cargando entrenador"
                description="Preparando la vista comercial del equipo fitness."
              />
            ))
          : filteredTrainers.map((trainer) => <FitnessTrainerCard key={trainer.id} trainer={trainer} />)}
      </div>

      <FitnessTrainerTable
        trainers={filteredTrainers}
        search={search}
        onSearchChange={setSearch}
        loading={loading}
        emptyTitle={companyId ? "No hay entrenadores para mostrar" : "Sin empresa activa"}
        emptyDescription={
          companyId
            ? deferredSearch.trim()
              ? "No encontramos entrenadores que coincidan con el filtro actual."
              : "Todavia no hay entrenadores visibles para esta empresa dentro de la demo."
            : "La vista permanece aislada hasta tener un companyId seguro."
        }
      />
    </>
  );
}

export default FitnessTrainersPage;
