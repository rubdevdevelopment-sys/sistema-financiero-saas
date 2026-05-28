import { FitnessStatCard } from "../FitnessStatCard.jsx";

export function FitnessDashboardMetricGrid({ metrics }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))"
      }}
    >
      <FitnessStatCard
        eyebrow="Clientes activos"
        title={String(metrics.activeClients)}
        description="Personas con acompanamiento visible dentro de la empresa actual."
        accent="#0f766e"
      />
      <FitnessStatCard
        eyebrow="Rutinas disponibles"
        title={String(metrics.routines)}
        description="Plantillas activas listas para presentar o reutilizar."
        accent="#2563eb"
      />
      <FitnessStatCard
        eyebrow="Ejercicios disponibles"
        title={String(metrics.exercises)}
        description="Movimientos visibles en el catalogo fitness."
        accent="#7c3aed"
      />
      <FitnessStatCard
        eyebrow="Entrenadores"
        title={String(metrics.trainers)}
        description="Entrenadores activos registrados en la demo."
        accent="#ea580c"
      />
    </div>
  );
}

export default FitnessDashboardMetricGrid;
