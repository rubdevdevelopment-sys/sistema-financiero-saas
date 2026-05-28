import { Link } from "react-router-dom";

import { FoundationBadge } from "../../../foundation/components/FoundationBadge.jsx";
import { FoundationCard } from "../../../foundation/components/FoundationCard.jsx";
import { FoundationButton } from "../../../foundation/components/FoundationButton.jsx";

export function FitnessDashboardHero({ company, hasScope, isDemoScope }) {
  return (
    <FoundationCard
      padding="roomy"
      style={{
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(15,118,110,0.96) 45%, rgba(56,189,248,0.92) 100%)",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        color: "#f8fafc",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)"
      }}
    >
      <div
        style={{
          display: "grid",
          gap: "1.25rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
          alignItems: "center"
        }}
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <FoundationBadge tone="info">Workspace fitness</FoundationBadge>
            {isDemoScope ? <FoundationBadge tone="success">Empresa demo activa</FoundationBadge> : null}
            <FoundationBadge tone={hasScope ? "success" : "warning"} outlined={!hasScope}>
              {hasScope ? "Tenant seguro resuelto" : "Tenant pendiente"}
            </FoundationBadge>
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#99f6e4"
              }}
            >
              Bienvenido al workspace fitness
            </p>
            <h2 style={{ margin: "0.65rem 0 0", fontSize: "2.2rem", lineHeight: 1.05, color: "#f8fafc" }}>
              Gestiona entrenamientos, clientes y rutinas desde un solo lugar
            </h2>
            <p style={{ margin: "0.85rem 0 0", lineHeight: 1.7, color: "#e2e8f0", maxWidth: "40rem" }}>
              Esta portada conecta el frente comercial y operativo del modulo fitness con datos reales del tenant
              actual. Ideal para presentar acompanamiento, programacion y seguimiento sin salir del entorno demo.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/fitness/clients" style={{ textDecoration: "none" }}>
              <FoundationButton>Ver clientes</FoundationButton>
            </Link>
            <Link to="/fitness/routines" style={{ textDecoration: "none" }}>
              <FoundationButton variant="secondary">Explorar rutinas</FoundationButton>
            </Link>
          </div>
        </div>

        <div
          style={{
            justifySelf: "stretch",
            borderRadius: "1.5rem",
            padding: "1.25rem",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.16)",
            backdropFilter: "blur(12px)"
          }}
        >
          <p style={{ margin: 0, fontSize: "0.76rem", color: "#bae6fd", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Empresa visible
          </p>
          <h3 style={{ margin: "0.6rem 0 0", fontSize: "1.4rem", color: "#f8fafc" }}>
            {company?.name ?? "Fitness Foundation"}
          </h3>
          <p style={{ margin: "0.7rem 0 0", color: "#dbeafe", lineHeight: 1.65 }}>
            Usa esta portada para dirigir conversaciones comerciales, mostrar progreso demo y navegar con rapidez
            hacia ejercicios, rutinas y clientes.
          </p>
        </div>
      </div>
    </FoundationCard>
  );
}

export default FitnessDashboardHero;
