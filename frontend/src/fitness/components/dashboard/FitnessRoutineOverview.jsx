import { Link } from "react-router-dom";

import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";

function formatLabel(value, fallback = "No definido") {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function levelTone(value) {
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

export function FitnessRoutineOverview({ routines = [] }) {
  return (
    <FoundationCard
      title="Rutinas destacadas"
      description="Resumen rapido de plantillas con mejor valor para onboarding, ventas o retencion."
      accent="#7c3aed"
      footer={
        <Link to="/fitness/routines" style={{ textDecoration: "none", color: "#0f766e", fontWeight: 700 }}>
          Ir a rutinas
        </Link>
      }
    >
      <div style={{ display: "grid", gap: "0.9rem" }}>
        {routines.length === 0 ? (
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>
            Aun no hay rutinas visibles para resumir en este dashboard.
          </p>
        ) : (
          routines.map((routine) => (
            <div
              key={routine.id}
              style={{
                borderRadius: "1rem",
                padding: "1rem",
                background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(250,245,255,0.92) 100%)",
                border: "1px solid rgba(233,213,255,0.9)",
                display: "grid",
                gap: "0.7rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <strong style={{ color: "#0f172a" }}>{routine.name}</strong>
                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                  <FoundationBadge tone={levelTone(routine.level)}>{formatLabel(routine.level)}</FoundationBadge>
                  <FoundationBadge tone="info" outlined>
                    {routine.duration_weeks} semanas
                  </FoundationBadge>
                </div>
              </div>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
                {routine.description || "Rutina demo lista para navegacion detallada."}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Objetivo: {formatLabel(routine.goal)}
                </span>
                <Link
                  to={`/fitness/routines/${routine.id}`}
                  style={{ textDecoration: "none", color: "#0f766e", fontWeight: 700 }}
                >
                  Ver detalle
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </FoundationCard>
  );
}

export default FitnessRoutineOverview;
