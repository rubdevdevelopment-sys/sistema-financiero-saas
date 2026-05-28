import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";

function statusTone(status) {
  switch (status) {
    case "active":
      return "success";
    case "paused":
      return "warning";
    default:
      return "neutral";
  }
}

function levelTone(level) {
  switch (level) {
    case "avanzado":
      return "danger";
    case "intermedio":
      return "warning";
    default:
      return "success";
  }
}

export function FitnessClientCard({ client }) {
  return (
    <FoundationCard
      padding="compact"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(240,253,250,0.92) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.12)"
      }}
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div
            aria-hidden="true"
            style={{
              width: "3rem",
              height: "3rem",
              borderRadius: "999px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)",
              color: "#f8fafc",
              fontWeight: 700,
              fontSize: "1rem"
            }}
          >
            {client.avatarInitials}
          </div>

          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a" }}>{client.name}</h3>
            <p style={{ margin: "0.25rem 0 0", color: "#475569", fontSize: "0.92rem" }}>
              {client.goalLabel}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <FoundationBadge tone={statusTone(client.status)}>{client.statusLabel}</FoundationBadge>
          <FoundationBadge tone={levelTone(client.levelLabel)} outlined>
            {client.levelLabel}
          </FoundationBadge>
          <FoundationBadge tone="info" outlined>
            {client.assignedTrainerLabel}
          </FoundationBadge>
        </div>

        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))"
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Rutina asignada
            </p>
            <p style={{ margin: "0.35rem 0 0", color: "#0f172a", fontWeight: 600 }}>{client.routineLabel}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Ultima actividad
            </p>
            <p style={{ margin: "0.35rem 0 0", color: "#0f172a", fontWeight: 600 }}>{client.lastActivityLabel}</p>
          </div>
        </div>
      </div>
    </FoundationCard>
  );
}

export default FitnessClientCard;
