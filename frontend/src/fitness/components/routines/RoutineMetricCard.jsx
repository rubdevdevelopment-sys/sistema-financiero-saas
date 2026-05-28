import { FitnessStatCard } from "../FitnessStatCard.jsx";

export function RoutineMetricCard({ eyebrow, title, description, accent }) {
  return (
    <FitnessStatCard
      eyebrow={eyebrow}
      title={title}
      description={description}
      accent={accent}
    />
  );
}

export default RoutineMetricCard;
