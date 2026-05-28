import { NavLink } from "react-router-dom";

import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";

const sidebarItems = [
  { key: "dashboard", label: "Panel general", soon: true },
  { key: "exercises", label: "Ejercicios", to: "/fitness/exercises" },
  { key: "routines", label: "Plantillas", to: "/fitness/routines" },
  { key: "trainers", label: "Entrenadores", soon: true },
  { key: "clients", label: "Clientes", to: "/fitness/clients" }
];

export function FitnessSidebar() {
  return (
    <FoundationCard
      padding="compact"
      style={{
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(22,78,99,0.96) 100%)",
        color: "#f8fafc",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        position: "sticky",
        top: "1rem"
      }}
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              color: "#7dd3fc"
            }}
          >
            Fitness Foundation
          </p>
          <h2 style={{ margin: "0.75rem 0 0", fontSize: "1.9rem", lineHeight: 1.05 }}>
            Rendimiento y seguimiento
          </h2>
          <p style={{ margin: "0.75rem 0 0", color: "#cbd5e1", lineHeight: 1.6 }}>
            Un workspace visual para entrenadores, clientes y rutinas con enfoque demo y lectura segura.
          </p>
        </div>

        <div
          style={{
            padding: "1rem",
            borderRadius: "1rem",
            background: "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(56,189,248,0.16) 100%)",
            border: "1px solid rgba(125,211,252,0.18)"
          }}
        >
          <p style={{ margin: 0, fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "#99f6e4" }}>
            Experiencia demo
          </p>
          <p style={{ margin: "0.5rem 0 0", color: "#e2e8f0", lineHeight: 1.6 }}>
            Pensada para presentar seguimiento, prescripcion y operacion fitness sin tocar el shell financiero.
          </p>
        </div>

        <nav style={{ display: "grid", gap: "0.75rem" }}>
          {sidebarItems.map((item) =>
            item.to ? (
              <NavLink
                key={item.key}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  borderRadius: "1rem",
                  padding: "0.95rem 1rem",
                  textDecoration: "none",
                  color: isActive ? "#0f172a" : "#e2e8f0",
                  background: isActive ? "linear-gradient(135deg, #f8fafc 0%, #bae6fd 100%)" : "rgba(255,255,255,0.06)",
                  border: isActive ? "1px solid rgba(186,230,253,0.8)" : "1px solid rgba(148,163,184,0.18)",
                  transition: "all 160ms ease"
                })}
              >
                <span style={{ fontWeight: 600 }}>{item.label}</span>
                <FoundationBadge tone="info" outlined>
                  Activo
                </FoundationBadge>
              </NavLink>
            ) : (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  borderRadius: "1rem",
                  padding: "0.95rem 1rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px dashed rgba(148,163,184,0.28)",
                  color: "#cbd5e1"
                }}
              >
                <span style={{ fontWeight: 600 }}>{item.label}</span>
                <FoundationBadge tone="warning" outlined>
                  Proximamente
                </FoundationBadge>
              </div>
            )
          )}
        </nav>
      </div>
    </FoundationCard>
  );
}

export default FitnessSidebar;
