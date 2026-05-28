import { Link } from "react-router-dom";

import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";

function buildAvatarInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function FitnessRecentClients({ clients = [] }) {
  return (
    <FoundationCard
      title="Clientes recientes"
      description="Una muestra rapida del frente activo de acompanamiento."
      accent="#0ea5e9"
      footer={
        <Link to="/fitness/clients" style={{ textDecoration: "none", color: "#0f766e", fontWeight: 700 }}>
          Ir a clientes
        </Link>
      }
    >
      <div style={{ display: "grid", gap: "0.85rem" }}>
        {clients.length === 0 ? (
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>
            Todavia no hay clientes visibles para esta empresa dentro del dashboard.
          </p>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.9rem",
                padding: "0.95rem 1rem",
                borderRadius: "1rem",
                background: "rgba(248,250,252,0.9)",
                border: "1px solid rgba(226,232,240,0.9)"
              }}
            >
              <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", minWidth: 0 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "999px",
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)",
                    color: "#f8fafc",
                    fontWeight: 700
                  }}
                >
                  {buildAvatarInitials(client.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", color: "#0f172a" }}>{client.name}</strong>
                  <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                    {client.goal || "Acompanamiento general"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", justifyContent: "end" }}>
                <FoundationBadge tone="info" outlined>
                  {client.assigned_trainer_name || "Sin entrenador"}
                </FoundationBadge>
                <FoundationBadge tone={client.status === "active" ? "success" : "neutral"}>
                  {client.status === "active" ? "Activo" : "En espera"}
                </FoundationBadge>
              </div>
            </div>
          ))
        )}
      </div>
    </FoundationCard>
  );
}

export default FitnessRecentClients;
