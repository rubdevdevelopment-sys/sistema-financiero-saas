import { Link } from "react-router-dom";

import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationButton } from "../../foundation/components/FoundationButton.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";

const stats = [
  { value: "54", label: "Ejercicios disponibles" },
  { value: "8", label: "Rutinas creadas" },
  { value: "2", label: "Entrenadores activos" },
  { value: "2", label: "Atletas demo" }
];

const actions = [
  "Consultar rutinas",
  "Revisar ejercicios",
  "Ver progreso",
  "Contactar entrenadores"
];

const credentials = {
  email: "trainer@rubdev.fit",
  password: "DemoFitness123!"
};

function StatTile({ value, label }) {
  return (
    <div
      style={{
        borderRadius: "1.4rem",
        padding: "1rem 1.1rem",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 16px 34px rgba(15,23,42,0.12)",
        backdropFilter: "blur(10px)"
      }}
    >
      <strong style={{ display: "block", fontSize: "1.8rem", lineHeight: 1, color: "#f8fafc" }}>{value}</strong>
      <span style={{ display: "block", marginTop: "0.45rem", color: "#cbd5e1", lineHeight: 1.5 }}>{label}</span>
    </div>
  );
}

function ActionCard({ label }) {
  return (
    <div
      style={{
        borderRadius: "1.35rem",
        padding: "1rem 1.05rem",
        background: "rgba(255,255,255,0.94)",
        border: "1px solid rgba(226,232,240,0.88)",
        boxShadow: "0 16px 36px rgba(15,23,42,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "2.4rem",
          height: "2.4rem",
          borderRadius: "0.9rem",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(234,179,8,0.14) 100%)",
          color: "#c2410c",
          fontWeight: 800
        }}
      >
        +
      </div>
      <strong style={{ color: "#0f172a" }}>{label}</strong>
    </div>
  );
}

function GymVisualPanel() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "33rem",
        borderRadius: "2rem",
        padding: "1.25rem",
        background:
          "linear-gradient(155deg, rgba(15,23,42,0.96) 0%, rgba(127,29,29,0.88) 42%, rgba(249,115,22,0.8) 100%)",
        border: "1px solid rgba(253,186,116,0.18)",
        boxShadow: "0 34px 80px rgba(124,45,18,0.24)",
        overflow: "hidden"
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-4rem",
          right: "-3rem",
          width: "12rem",
          height: "12rem",
          borderRadius: "999px",
          background: "rgba(251,191,36,0.2)",
          filter: "blur(10px)"
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-4rem",
          left: "-2rem",
          width: "14rem",
          height: "14rem",
          borderRadius: "999px",
          background: "rgba(248,113,113,0.2)",
          filter: "blur(12px)"
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "grid", gap: "1rem", height: "100%" }}>
        <div
          style={{
            borderRadius: "1.5rem",
            padding: "1rem 1.1rem",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.74rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "#fdba74"
              }}
            >
              PowerFit Studio
            </p>
            <h3 style={{ margin: "0.45rem 0 0", color: "#f8fafc", fontSize: "1.2rem" }}>
              Portal de atletas y entrenadores
            </h3>
          </div>
          <FoundationBadge tone="warning">Portal de atletas</FoundationBadge>
        </div>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "1.15fr 0.85fr"
          }}
        >
          <FoundationCard
            padding="roomy"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(226,232,240,0.9)"
            }}
          >
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#c2410c"
                    }}
                  >
                    Sesion de hoy
                  </p>
                  <h4 style={{ margin: "0.45rem 0 0", color: "#0f172a", fontSize: "1.05rem" }}>
                    Funcional de alto rendimiento
                  </h4>
                </div>
                <FoundationBadge tone="success">En curso</FoundationBadge>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {[
                  ["Calentamiento", "10 min"],
                  ["Bloque fuerza", "4 ejercicios"],
                  ["Finisher", "12 min"]
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      alignItems: "center",
                      padding: "0.9rem 1rem",
                      borderRadius: "1rem",
                      background: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)",
                      border: "1px solid rgba(254,215,170,0.7)"
                    }}
                  >
                    <strong style={{ color: "#0f172a" }}>{label}</strong>
                    <span style={{ color: "#9a3412", fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </FoundationCard>

          <div style={{ display: "grid", gap: "1rem" }}>
            <FoundationCard
              padding="roomy"
              style={{
                background: "rgba(15,23,42,0.76)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f8fafc"
              }}
            >
              <div style={{ display: "grid", gap: "0.8rem" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#fdba74"
                  }}
                >
                  Atleta destacado
                </p>
                <strong style={{ fontSize: "1.2rem", color: "#f8fafc" }}>David Hernández</strong>
                <span style={{ color: "#e2e8f0", lineHeight: 1.6 }}>
                  Objetivo actual: resistencia, fuerza y perdida de grasa.
                </span>
              </div>
            </FoundationCard>

            <FoundationCard
              padding="roomy"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(226,232,240,0.9)"
              }}
            >
              <div style={{ display: "grid", gap: "0.7rem" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#2563eb"
                  }}
                >
                  Progreso semanal
                </p>
                <strong style={{ color: "#0f172a", fontSize: "2rem", lineHeight: 1 }}>82%</strong>
                <div
                  style={{
                    height: "0.75rem",
                    borderRadius: "999px",
                    background: "rgba(226,232,240,0.9)",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: "82%",
                      height: "100%",
                      borderRadius: "999px",
                      background: "linear-gradient(90deg, #f97316 0%, #facc15 100%)"
                    }}
                  />
                </div>
              </div>
            </FoundationCard>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "0.9rem",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            alignSelf: "end"
          }}
        >
          {[
            ["Sede", "Bogota, Colombia"],
            ["Coach", "Laura Fitness Demo"],
            ["Portal", "Listo para demo"]
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                borderRadius: "1.15rem",
                padding: "0.95rem 1rem",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#e2e8f0"
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#fed7aa"
                }}
              >
                {label}
              </span>
              <strong style={{ display: "block", marginTop: "0.45rem", color: "#f8fafc" }}>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FitnessGymLandingPreview() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(249,115,22,0.18) 0%, rgba(15,23,42,1) 26%, rgba(127,29,29,0.94) 54%, rgba(255,251,235,1) 54%, rgba(248,250,252,1) 100%)"
      }}
    >
      <div
        style={{
          maxWidth: "92rem",
          margin: "0 auto",
          padding: "1.5rem",
          display: "grid",
          gap: "2rem"
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.95rem" }}>
            <div
              aria-hidden="true"
              style={{
                width: "3.2rem",
                height: "3.2rem",
                borderRadius: "1.1rem",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #f97316 0%, #facc15 100%)",
                color: "#7c2d12",
                fontWeight: 900,
                boxShadow: "0 18px 40px rgba(249,115,22,0.28)"
              }}
            >
              PF
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.74rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "#fdba74"
                }}
              >
                PowerFit Studio
              </p>
              <h1 style={{ margin: "0.28rem 0 0", fontSize: "1.3rem", color: "#f8fafc" }}>
                Entrena mejor. Mide tu progreso. Alcanza tus metas.
              </h1>
            </div>
          </div>

          <FoundationBadge tone="warning">Portal de atletas</FoundationBadge>
        </header>

        <section
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "minmax(0, 1.02fr) minmax(21rem, 0.98fr)",
            alignItems: "center"
          }}
        >
          <div style={{ display: "grid", gap: "1.35rem" }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <FoundationBadge tone="info" outlined>
                Centro de entrenamiento funcional · Bogota, Colombia
              </FoundationBadge>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "#fde68a"
                  }}
                >
                  Portal del gimnasio
                </p>
                <h2
                  style={{
                    margin: "0.8rem 0 0",
                    fontSize: "clamp(2.6rem, 5vw, 5rem)",
                    lineHeight: 0.96,
                    color: "#f8fafc",
                    maxWidth: "12ch"
                  }}
                >
                  Tu entrenamiento y tu equipo, en un solo portal
                </h2>
                <p
                  style={{
                    margin: "1rem 0 0",
                    fontSize: "1.02rem",
                    lineHeight: 1.8,
                    color: "#e2e8f0",
                    maxWidth: "42rem"
                  }}
                >
                  Diseñado para atletas y entrenadores de PowerFit Studio. Consulta rutinas, revisa ejercicios,
                  sigue tu progreso y mantente conectado con el equipo desde una experiencia moderna y clara.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
              <Link to="/fitness" style={{ textDecoration: "none" }}>
                <FoundationButton
                  size="lg"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #facc15 100%)",
                    borderColor: "transparent",
                    color: "#7c2d12",
                    boxShadow: "0 22px 54px rgba(249,115,22,0.24)"
                  }}
                >
                  Ingresar al portal
                </FoundationButton>
              </Link>
              <Link to="/fitness/welcome" style={{ textDecoration: "none" }}>
                <FoundationButton
                  variant="secondary"
                  size="lg"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.18)",
                    color: "#f8fafc",
                    backdropFilter: "blur(10px)"
                  }}
                >
                  Ver demo
                </FoundationButton>
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gap: "0.9rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))"
              }}
            >
              {stats.map((stat) => (
                <StatTile key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>

          <GymVisualPanel />
        </section>

        <section
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "minmax(0, 1.08fr) minmax(20rem, 0.92fr)",
            alignItems: "start"
          }}
        >
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#c2410c"
                }}
              >
                Que puedes hacer aqui
              </p>
              <h3 style={{ margin: "0.55rem 0 0", color: "#0f172a", fontSize: "2rem" }}>
                Una experiencia pensada para la operacion diaria del gimnasio
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))"
              }}
            >
              {actions.map((action) => (
                <ActionCard key={action} label={action} />
              ))}
            </div>
          </div>

          <FoundationCard
            padding="roomy"
            title="Acceso al portal"
            description="Vista demo conectada a datos de prueba."
            style={{
              background: "rgba(255,255,255,0.98)",
              border: "1px solid rgba(226,232,240,0.88)",
              boxShadow: "0 28px 64px rgba(15,23,42,0.12)"
            }}
          >
            <div style={{ display: "grid", gap: "1rem" }}>
              <label style={{ display: "grid", gap: "0.45rem" }}>
                <span style={{ color: "#0f172a", fontWeight: 600 }}>Correo</span>
                <input
                  type="email"
                  defaultValue={credentials.email}
                  readOnly
                  style={{
                    width: "100%",
                    borderRadius: "1rem",
                    border: "1px solid #cbd5e1",
                    padding: "0.98rem 1rem",
                    background: "#f8fafc",
                    color: "#0f172a",
                    fontSize: "0.98rem"
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "0.45rem" }}>
                <span style={{ color: "#0f172a", fontWeight: 600 }}>Contrasena</span>
                <input
                  type="password"
                  defaultValue={credentials.password}
                  readOnly
                  style={{
                    width: "100%",
                    borderRadius: "1rem",
                    border: "1px solid #cbd5e1",
                    padding: "0.98rem 1rem",
                    background: "#f8fafc",
                    color: "#0f172a",
                    fontSize: "0.98rem"
                  }}
                />
              </label>

              <div
                style={{
                  borderRadius: "1.1rem",
                  padding: "1rem",
                  background: "linear-gradient(180deg, #fff7ed 0%, #fefce8 100%)",
                  border: "1px solid rgba(253,186,116,0.55)",
                  display: "grid",
                  gap: "0.35rem"
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.74rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#c2410c"
                  }}
                >
                  Credenciales demo visibles
                </p>
                <strong style={{ color: "#0f172a" }}>{credentials.email}</strong>
                <span style={{ color: "#334155" }}>{credentials.password}</span>
              </div>

              <Link to="/fitness" style={{ textDecoration: "none" }}>
                <FoundationButton
                  fullWidth
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #facc15 100%)",
                    borderColor: "transparent",
                    color: "#7c2d12"
                  }}
                >
                  Entrar al portal
                </FoundationButton>
              </Link>

              <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6, fontSize: "0.92rem" }}>
                Vista demo conectada a datos de prueba.
              </p>
            </div>
          </FoundationCard>
        </section>

        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap"
          }}
        >
          <span style={{ color: "#475569" }}>PowerFit Studio</span>
          <span style={{ color: "#94a3b8", fontSize: "0.92rem" }}>Powered by RubDev SaaS</span>
        </footer>
      </div>
    </div>
  );
}

export default FitnessGymLandingPreview;
