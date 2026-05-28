import { Link } from "react-router-dom";

import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";

const actions = [
  {
    key: "exercises",
    title: "Ver ejercicios",
    description: "Consulta el catalogo completo para ventas, onboarding y prescripcion.",
    to: "/fitness/exercises"
  },
  {
    key: "routines",
    title: "Ver rutinas",
    description: "Explora plantillas estructuradas con semanas, dias y ejercicios.",
    to: "/fitness/routines"
  },
  {
    key: "clients",
    title: "Ver clientes",
    description: "Revisa el seguimiento, el progreso demo y la asignacion actual.",
    to: "/fitness/clients"
  },
  {
    key: "trainers",
    title: "Ver entrenadores",
    description: "Consulta el equipo visible, sus especialidades y la carga demo asignada.",
    to: "/fitness/trainers"
  }
];

export function FitnessQuickActions() {
  return (
    <FoundationCard
      title="Accesos rapidos"
      description="Atajos de trabajo para entrar al punto exacto de la conversacion comercial u operativa."
      accent="#14b8a6"
    >
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))"
        }}
      >
        {actions.map((action) => (
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
        ))}
      </div>
    </FoundationCard>
  );
}

export default FitnessQuickActions;
