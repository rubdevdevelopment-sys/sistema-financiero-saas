import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";
import { RoutineExerciseCard } from "./RoutineExerciseCard.jsx";

export function RoutineDayCard({ day }) {
  const exerciseCount = Array.isArray(day?.exercises) ? day.exercises.length : 0;

  return (
    <FoundationCard
      title={day?.name ?? "Dia"}
      description={day?.description ?? "Sesion de rutina"}
      eyebrow={`Dia ${day?.day_number ?? "-"}`}
      padding="compact"
      accent="#0ea5e9"
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <FoundationBadge tone="info" outlined>
            {exerciseCount} ejercicios
          </FoundationBadge>
        </div>

        <div style={{ display: "grid", gap: "0.85rem" }}>
          {(day?.exercises ?? []).map((exercise) => (
            <RoutineExerciseCard key={exercise.id ?? `${day.id}-${exercise.sort_order}`} exercise={exercise} />
          ))}
        </div>
      </div>
    </FoundationCard>
  );
}

export default RoutineDayCard;
