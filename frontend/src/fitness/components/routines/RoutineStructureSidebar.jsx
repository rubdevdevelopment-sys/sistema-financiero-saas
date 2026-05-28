import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";

export function RoutineStructureSidebar({
  weeks = [],
  activeWeekId = null,
  onSelectWeek = () => {},
  metrics
}) {
  return (
    <FoundationCard
      padding="compact"
      style={{
        position: "sticky",
        top: "1rem",
        background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(240,253,250,0.96) 100%)"
      }}
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "#0f766e" }}>
            Estructura
          </p>
          <h3 style={{ margin: "0.45rem 0 0", color: "#0f172a" }}>Mapa de la rutina</h3>
          <p style={{ margin: "0.6rem 0 0", color: "#64748b", lineHeight: 1.6 }}>
            Navegacion rapida por semanas y resumen general de la estructura.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <FoundationBadge tone="primary" outlined>
            {metrics.totalWeeks} semanas
          </FoundationBadge>
          <FoundationBadge tone="info" outlined>
            {metrics.totalDays} dias
          </FoundationBadge>
          <FoundationBadge tone="success" outlined>
            {metrics.totalExercises} ejercicios
          </FoundationBadge>
        </div>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {weeks.map((week) => {
            const isActive = week.id === activeWeekId;
            const exerciseCount = (week.days ?? []).reduce(
              (total, day) => total + (day.exercises?.length ?? 0),
              0
            );

            return (
              <button
                key={week.id}
                type="button"
                onClick={() => onSelectWeek(week.id)}
                style={{
                  textAlign: "left",
                  borderRadius: "1rem",
                  padding: "0.9rem 1rem",
                  border: isActive ? "1px solid rgba(20,184,166,0.65)" : "1px solid rgba(203,213,225,0.8)",
                  background: isActive ? "rgba(204,251,241,0.8)" : "rgba(255,255,255,0.75)",
                  cursor: "pointer"
                }}
              >
                <p style={{ margin: 0, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "#64748b" }}>
                  Semana {week.week_number}
                </p>
                <strong style={{ display: "block", marginTop: "0.35rem", color: "#0f172a" }}>
                  {week.name}
                </strong>
                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginTop: "0.65rem" }}>
                  <FoundationBadge tone="neutral" outlined>
                    {week.days?.length ?? 0} dias
                  </FoundationBadge>
                  <FoundationBadge tone="neutral" outlined>
                    {exerciseCount} ejercicios
                  </FoundationBadge>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </FoundationCard>
  );
}

export default RoutineStructureSidebar;
