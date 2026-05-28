import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";

export function FitnessClientProgressCard({ client }) {
  return (
    <FoundationCard
      padding="compact"
      style={{
        background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(15,118,110,0.94) 100%)",
        color: "#f8fafc",
        border: "1px solid rgba(125, 211, 252, 0.22)"
      }}
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#99f6e4" }}>
              Progreso demo
            </p>
            <h3 style={{ margin: "0.35rem 0 0", fontSize: "1.05rem", color: "#f8fafc" }}>{client.name}</h3>
          </div>
          <FoundationBadge tone="success">{client.progressLabel}</FoundationBadge>
        </div>

        <div
          aria-hidden="true"
          style={{
            width: "100%",
            height: "0.75rem",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.14)",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${client.progressPercent}%`,
              height: "100%",
              borderRadius: "999px",
              background: "linear-gradient(90deg, #34d399 0%, #38bdf8 100%)"
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))"
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.76rem" }}>Meta actual</p>
            <p style={{ margin: "0.35rem 0 0", color: "#f8fafc", fontWeight: 600 }}>{client.goalLabel}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.76rem" }}>Plan activo</p>
            <p style={{ margin: "0.35rem 0 0", color: "#f8fafc", fontWeight: 600 }}>{client.routineLabel}</p>
          </div>
        </div>
      </div>
    </FoundationCard>
  );
}

export default FitnessClientProgressCard;
