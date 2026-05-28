import { Link } from "react-router-dom";

import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";

const actions = [
  {
    key: "exercises",
    title: "Ver ejercicios",
    description: "Consulta el catalogo completo para ventas, onboarding y prescripcion.",
    to: "/fitness/exercises",
    status: "activo"
  },
  {
    key: "routines",
    title: "Ver rutinas",
    description: "Explora plantillas estructuradas con semanas, dias y ejercicios.",
    to: "/fitness/routines",
    status: "activo"
  },
  {
    key: "clients",
    title: "Ver clientes",
    description: "Revisa el seguimiento, el progreso demo y la asignacion actual.",
    to: "/fitness/clients",
    status: "activo"
  },
  {
    key: "trainers",
    title: "Ver entrenadores",
    description: "Vista comercial reservada para la siguiente fase del workspace.",
    to: null,
    status: "proximamente"
  }
];

export function FitnessQuickActions() {
  return (
    <FoundationCard
      title="Accesos rápidos"
      description="Atajos de trabajo para entrar al punto exacto de la conversación comercial o operativa."
      accent="#14b8a6"
    >
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))"
        }}
      >
        {actions.map((action) =>
          action.to ? (
            <Link
              key={action.key}
              to={action.to}
              style={{
                textDecoration: "none",
                borderRadius: "1.25rem",
                padding: "1rem",
                background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(240,253,250,0.9) 100%)",
                border: "1px solid rgba(148,163,184,0.18)",
                color: "#0f172a",
                display: "grid",
                gap: "0.65rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "start" }}>
                <strong style={{ fontSize: "1rem" }}>{action.title}</strong>
                <FoundationBadge tone="success" outlined>
                  Activo
                </FoundationBadge>
              </div>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>{action.description}</p>
            </Link>
          ) : (
            <div
              key={action.key}
              style={{
                borderRadius: "1.25rem",
                padding: "1rem",
                background: "rgba(248,250,252,0.92)",
                border: "1px dashed rgba(148,163,184,0.35)",
                color: "#0f172a",
                display: "grid",
                gap: "0.65rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "start" }}>
                <strong style={{ fontSize: "1rem" }}>{action.title}</strong>
                <FoundationBadge tone="warning" outlined>
                  Próximamente
                </FoundationBadge>
              </div>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>{action.description}</p>
            </div>
          )
        )}
      </div>
    </FoundationCard>
  );
}

export default FitnessQuickActions;
