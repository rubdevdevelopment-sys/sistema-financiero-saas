import { useState } from "react";

import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationButton } from "../../../foundation/components/FoundationButton.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";
import { RoutineDayCard } from "./RoutineDayCard.jsx";

export function RoutineWeekCard({ week, defaultExpanded = true, sectionRef = null }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const totalDays = Array.isArray(week?.days) ? week.days.length : 0;
  const totalExercises = (week?.days ?? []).reduce(
    (total, day) => total + (day.exercises?.length ?? 0),
    0
  );

  return (
    <section ref={sectionRef} id={`week-${week?.id}`}>
      <FoundationCard
        eyebrow={`Semana ${week?.week_number ?? "-"}`}
        title={week?.name ?? "Semana"}
        description={week?.description ?? "Semana de entrenamiento"}
        accent="#14b8a6"
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <FoundationBadge tone="primary" outlined>
                {totalDays} dias
              </FoundationBadge>
              <FoundationBadge tone="info" outlined>
                {totalExercises} ejercicios
              </FoundationBadge>
            </div>
            <FoundationButton
              variant="secondary"
              size="sm"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Ocultar semana" : "Ver semana"}
            </FoundationButton>
          </div>
        }
      >
        {expanded ? (
          <div style={{ display: "grid", gap: "1rem" }}>
            {(week?.days ?? []).map((day) => (
              <RoutineDayCard key={day.id ?? `${week.id}-${day.day_number}`} day={day} />
            ))}
          </div>
        ) : null}
      </FoundationCard>
    </section>
  );
}

export default RoutineWeekCard;
