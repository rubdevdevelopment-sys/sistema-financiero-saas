import { FitnessStatCard } from "../FitnessStatCard.jsx";

export function FitnessTrainerStats({ metrics }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))"
      }}
    >
      <FitnessStatCard
        eyebrow="Entrenadores activos"
        title={String(metrics.activeTrainers)}
        description="Profesionales visibles dentro del equipo fitness."
        accent="#0f766e"
      />
      <FitnessStatCard
        eyebrow="Especialidades"
        title={String(metrics.specializations)}
        description="Lineas de servicio disponibles en esta demo."
        accent="#2563eb"
      />
      <FitnessStatCard
        eyebrow="Clientes asignados demo"
        title={String(metrics.assignedClients)}
        description="Clientes actualmente vinculados a un entrenador."
        accent="#7c3aed"
      />
      <FitnessStatCard
        eyebrow="Rutinas supervisadas demo"
        title={String(metrics.supervisedRoutines)}
        description="Rutinas derivadas para enriquecer la vista comercial."
        accent="#ea580c"
      />
    </div>
  );
}

export default FitnessTrainerStats;
