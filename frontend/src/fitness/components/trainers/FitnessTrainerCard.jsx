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

export function FitnessTrainerCard({ trainer }) {
  return (
    <FoundationCard
      padding="compact"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.92) 100%)",
        border: "1px solid rgba(56, 189, 248, 0.16)"
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
              background: "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)",
              color: "#f8fafc",
              fontWeight: 700,
              fontSize: "1rem"
            }}
          >
            {trainer.avatarInitials}
          </div>

          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a" }}>{trainer.name}</h3>
            <p style={{ margin: "0.25rem 0 0", color: "#475569", fontSize: "0.92rem" }}>
              {trainer.specializationLabel}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <FoundationBadge tone={statusTone(trainer.status)}>
            {trainer.statusLabel}
          </FoundationBadge>
          <FoundationBadge tone="info" outlined>
            {trainer.assignedClientsCount} clientes
          </FoundationBadge>
          <FoundationBadge tone="primary" outlined>
            {trainer.supervisedRoutinesCount} rutinas
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
              Correo
            </p>
            <p style={{ margin: "0.35rem 0 0", color: "#0f172a", fontWeight: 600 }}>
              {trainer.email || "Sin correo"}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Telefono
            </p>
            <p style={{ margin: "0.35rem 0 0", color: "#0f172a", fontWeight: 600 }}>
              {trainer.phone || "Sin telefono"}
            </p>
          </div>
        </div>
      </div>
    </FoundationCard>
  );
}

export default FitnessTrainerCard;
