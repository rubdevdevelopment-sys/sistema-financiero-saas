import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";

export function FitnessTopbar({ company, source, isDemoScope }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        padding: "1.35rem 1.5rem",
        borderRadius: "1.75rem",
        background:
          "linear-gradient(135deg, rgba(248,250,252,0.98) 0%, rgba(236,253,245,0.98) 45%, rgba(224,242,254,0.98) 100%)",
        border: "1px solid rgba(125,211,252,0.32)",
        boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)"
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: "#0f766e"
          }}
        >
          Modulo fitness
        </p>
        <h1
          style={{
            margin: "0.35rem 0 0",
            fontSize: "1.5rem",
            color: "#0f172a"
          }}
        >
          {company?.name ?? "Fitness Foundation"}
        </h1>
        <p style={{ margin: "0.35rem 0 0", color: "#475569", lineHeight: 1.5 }}>
          Seguimiento de entrenamientos, clientes y rutinas en una experiencia separada de EMAUS.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <FoundationBadge tone="primary">Fitness Foundation</FoundationBadge>
        {isDemoScope ? <FoundationBadge tone="success">Empresa demo</FoundationBadge> : null}
        {source ? (
          <FoundationBadge tone="info" outlined>
            {source === "support_company"
              ? "Empresa en soporte"
              : source === "active_company"
                ? "Empresa activa"
                : source === "authenticated_user"
                  ? "Usuario autenticado"
                  : source === "super_admin_demo_scope"
                    ? "Scope demo automatico"
                    : source}
          </FoundationBadge>
        ) : null}
      </div>
    </header>
  );
}

export default FitnessTopbar;
