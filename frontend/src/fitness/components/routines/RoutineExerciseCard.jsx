import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";
import {
  localizeExerciseName,
  localizeFitnessCategory,
  localizeFitnessDifficulty,
  localizeFitnessEquipment,
  localizeFitnessMuscleGroup
} from "../../utils/fitnessLocalization.js";

function difficultyTone(value) {
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

export function RoutineExerciseCard({ exercise }) {
  const metrics = [
    { label: "Series", value: exercise.sets ?? "-" },
    { label: "Repeticiones", value: exercise.reps ?? "-" },
    { label: "Descanso", value: exercise.rest_seconds ? `${exercise.rest_seconds}s` : "-" },
    { label: "Orden", value: exercise.sort_order ?? "-" }
  ];

  return (
    <FoundationCard
      padding="compact"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)"
      }}
    >
      <div style={{ display: "grid", gap: "0.85rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#0f766e" }}>
              Ejercicio {exercise.sort_order ?? "-"}
            </p>
            <h4 style={{ margin: "0.45rem 0 0", fontSize: "1.05rem", color: "#0f172a" }}>
              {localizeExerciseName(exercise.exercise?.name)}
            </h4>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <FoundationBadge tone="info" outlined>
              {localizeFitnessCategory(exercise.exercise?.category)}
            </FoundationBadge>
            <FoundationBadge tone={difficultyTone(exercise.exercise?.difficulty)}>
              {localizeFitnessDifficulty(exercise.exercise?.difficulty)}
            </FoundationBadge>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <FoundationBadge tone="primary" outlined>
            {localizeFitnessMuscleGroup(exercise.exercise?.muscle_group)}
          </FoundationBadge>
          <FoundationBadge tone="neutral" outlined>
            {localizeFitnessEquipment(exercise.exercise?.equipment)}
          </FoundationBadge>
        </div>

        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(6rem, 1fr))"
          }}
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                borderRadius: "1rem",
                padding: "0.85rem",
                background: "rgba(226,232,240,0.45)",
                border: "1px solid rgba(203,213,225,0.75)"
              }}
            >
              <p style={{ margin: 0, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "#64748b" }}>
                {metric.label}
              </p>
              <strong style={{ display: "block", marginTop: "0.35rem", color: "#0f172a" }}>
                {metric.value}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </FoundationCard>
  );
}

export default RoutineExerciseCard;
