import { Link } from "react-router-dom";

import { FoundationBadge } from "../../foundation/components/FoundationBadge.jsx";
import { FoundationButton } from "../../foundation/components/FoundationButton.jsx";
import { FoundationCard } from "../../foundation/components/FoundationCard.jsx";

const metrics = [
  { value: "54", label: "Ejercicios" },
  { value: "8", label: "Rutinas" },
  { value: "2", label: "Entrenadores" },
  { value: "2", label: "Clientes" }
];

const benefits = [
  {
    title: "Gestiona atletas",
    description: "Centraliza perfiles, objetivos y seguimientos en una sola experiencia visual."
  },
  {
    title: "Crea rutinas",
    description: "Organiza semanas, dias y ejercicios con una presentacion lista para demo."
  },
  {
    title: "Controla progreso",
    description: "Muestra avances, actividad y contexto comercial sin depender de integraciones reales."
  },
  {
    title: "Organiza entrenadores",
    description: "Presenta equipo, especialidades y carga visible en un layout premium."
  }
];

const credentials = {
  email: "trainer@rubdev.fit",
  password: "DemoFitness123!"
};

function MetricCard({ value, label }) {
  return (
    <div
      style={{
        borderRadius: "1.4rem",
        padding: "1rem 1.1rem",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(10px)"
      }}
    >
      <strong
        style={{
          display: "block",
          fontSize: "1.65rem",
          lineHeight: 1,
          color: "#f8fafc"
        }}
      >
        {value}
      </strong>
      <span style={{ display: "block", marginTop: "0.45rem", color: "#cbd5e1", fontSize: "0.92rem" }}>
        {label}
      </span>
    </div>
  );
}

function BenefitCard({ title, description }) {
  return (
    <div
      style={{
        borderRadius: "1.5rem",
        padding: "1.1rem 1.15rem",
        background: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(226,232,240,0.85)",
        boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
        display: "grid",
        gap: "0.45rem"
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
          background: "linear-gradient(135deg, rgba(20,184,166,0.16) 0%, rgba(59,130,246,0.16) 100%)",
          color: "#0f766e",
          fontWeight: 800
        }}
      >
        +
      </div>
      <strong style={{ color: "#0f172a", fontSize: "1rem" }}>{title}</strong>
      <p style={{ margin: 0, color: "#475569", lineHeight: 1.6, fontSize: "0.94rem" }}>{description}</p>
    </div>
  );
}

function VisualMockup() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "34rem",
        borderRadius: "2rem",
        padding: "1.25rem",
        background:
          "linear-gradient(160deg, rgba(15,23,42,0.94) 0%, rgba(15,118,110,0.86) 48%, rgba(59,130,246,0.68) 100%)",
        border: "1px solid rgba(186,230,253,0.22)",
        boxShadow: "0 34px 80px rgba(8,47,73,0.28)",
        overflow: "hidden"
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-3rem",
          right: "-2rem",
          width: "12rem",
          height: "12rem",
          borderRadius: "999px",
          background: "rgba(94,234,212,0.18)",
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
          background: "rgba(56,189,248,0.18)",
          filter: "blur(12px)"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gap: "1rem",
          height: "100%"
        }}
      >
        <div
          style={{
            borderRadius: "1.5rem",
            padding: "1rem 1.1rem",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap"
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.74rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "#99f6e4"
              }}
            >
              Dashboard fitness
            </p>
            <h3 style={{ margin: "0.45rem 0 0", color: "#f8fafc", fontSize: "1.2rem" }}>
              Vista comercial lista para demo
            </h3>
          </div>
          <FoundationBadge tone="success">Demo Fitness</FoundationBadge>
        </div>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "1.3fr 0.9fr"
          }}
        >
          <FoundationCard
            padding="roomy"
            style={{
              background: "rgba(255,255,255,0.94)",
              border: "1px solid rgba(226,232,240,0.9)",
              boxShadow: "0 22px 48px rgba(15,23,42,0.12)"
            }}
          >
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "#0f766e"
                    }}
                  >
                    Rutina destacada
                  </p>
                  <h4 style={{ margin: "0.45rem 0 0", color: "#0f172a", fontSize: "1.05rem" }}>
                    Cuerpo completo principiante
                  </h4>
                </div>
                <FoundationBadge tone="success">Activa</FoundationBadge>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {[
                  ["Semana 1", "4 ejercicios", "Base tecnica"],
                  ["Semana 2", "4 ejercicios", "Progresion"],
                  ["Semana 3", "4 ejercicios", "Acondicionamiento"]
                ].map(([week, count, label]) => (
                  <div
                    key={week}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      alignItems: "center",
                      padding: "0.9rem 1rem",
                      borderRadius: "1rem",
                      background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)",
                      border: "1px solid rgba(226,232,240,0.85)"
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", color: "#0f172a" }}>{week}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.9rem" }}>{label}</span>
                    </div>
                    <FoundationBadge tone="info" outlined>
                      {count}
                    </FoundationBadge>
                  </div>
                ))}
              </div>
            </div>
          </FoundationCard>

          <div style={{ display: "grid", gap: "1rem" }}>
            <FoundationCard
              padding="roomy"
              style={{
                background: "rgba(15,23,42,0.78)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#f8fafc"
              }}
            >
              <div style={{ display: "grid", gap: "0.85rem" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#67e8f9"
                  }}
                >
                  Progreso atleta
                </p>
                <strong style={{ fontSize: "2.3rem", lineHeight: 1, color: "#f8fafc" }}>78%</strong>
                <div
                  style={{
                    height: "0.75rem",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.14)",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: "78%",
                      height: "100%",
                      borderRadius: "999px",
                      background: "linear-gradient(90deg, #14b8a6 0%, #38bdf8 100%)"
                    }}
                  />
                </div>
                <span style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                  Seguimiento claro para mostrar avance, adherencia y continuidad.
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
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#2563eb"
                  }}
                >
                  Coach visible
                </p>
                <strong style={{ color: "#0f172a", fontSize: "1rem" }}>Laura Fitness Demo</strong>
                <span style={{ color: "#475569", lineHeight: 1.6 }}>
                  Entrenamiento funcional y acompanamiento comercial.
                </span>
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
            ["Cliente activo", "Ana Client Demo"],
            ["Plan sugerido", "Perdida de peso"],
            ["Check-in", "Hoy 7:15 a. m."]
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                borderRadius: "1.2rem",
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
                  color: "#bae6fd"
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

export function FitnessLandingLoginPreview() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(34,197,94,0.14) 0%, rgba(15,23,42,1) 24%, rgba(8,47,73,1) 58%, rgba(239,246,255,1) 58%, rgba(248,250,252,1) 100%)"
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <div
              aria-hidden="true"
              style={{
                width: "3.2rem",
                height: "3.2rem",
                borderRadius: "1.1rem",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)",
                boxShadow: "0 18px 40px rgba(20,184,166,0.26)",
                fontWeight: 800,
                color: "#082f49"
              }}
            >
              RF
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.74rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "#99f6e4"
                }}
              >
                RubDev Fitness
              </p>
              <h1 style={{ margin: "0.28rem 0 0", fontSize: "1.25rem", color: "#f8fafc" }}>
                Landing preview Fitness
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <FoundationBadge tone="success">Demo Fitness</FoundationBadge>
            <Link to="/fitness" style={{ textDecoration: "none" }}>
              <FoundationButton
                variant="secondary"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  borderColor: "rgba(255,255,255,0.85)",
                  color: "#0f172a"
                }}
              >
                Entrar a la demo
              </FoundationButton>
            </Link>
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(21rem, 0.95fr)",
            alignItems: "center"
          }}
        >
          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <FoundationBadge tone="info" outlined>
                Preview comercial sin autenticacion real
              </FoundationBadge>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "#67e8f9"
                  }}
                >
                  SaaS fitness premium
                </p>
                <h2
                  style={{
                    margin: "0.8rem 0 0",
                    fontSize: "clamp(2.7rem, 5vw, 5.2rem)",
                    lineHeight: 0.95,
                    color: "#f8fafc",
                    maxWidth: "11ch"
                  }}
                >
                  Vende tu operacion fitness desde la primera pantalla
                </h2>
                <p
                  style={{
                    margin: "1rem 0 0",
                    fontSize: "1.02rem",
                    lineHeight: 1.8,
                    color: "#dbeafe",
                    maxWidth: "42rem"
                  }}
                >
                  Una landing moderna para mostrar clientes, rutinas, ejercicios y entrenadores con una identidad
                  limpia, premium y pensada para demos comerciales en espanol ES-CO.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
              <Link to="/fitness" style={{ textDecoration: "none" }}>
                <FoundationButton
                  size="lg"
                  style={{
                    background: "linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)",
                    borderColor: "transparent",
                    color: "#082f49",
                    boxShadow: "0 20px 50px rgba(56,189,248,0.24)"
                  }}
                >
                  Entrar a la demo
                </FoundationButton>
              </Link>
              <Link to="/fitness/routines" style={{ textDecoration: "none" }}>
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
                  Explorar rutinas
                </FoundationButton>
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gap: "0.9rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(8.5rem, 1fr))"
              }}
            >
              {metrics.map((metric) => (
                <MetricCard key={metric.label} value={metric.value} label={metric.label} />
              ))}
            </div>
          </div>

          <VisualMockup />
        </section>

        <section
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(20rem, 0.9fr)",
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
                  color: "#0f766e"
                }}
              >
                Beneficios del workspace
              </p>
              <h3 style={{ margin: "0.55rem 0 0", color: "#0f172a", fontSize: "2rem" }}>
                Todo lo necesario para una demo que se vea vendible
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))"
              }}
            >
              {benefits.map((benefit) => (
                <BenefitCard key={benefit.title} title={benefit.title} description={benefit.description} />
              ))}
            </div>
          </div>

          <FoundationCard
            padding="roomy"
            title="Acceso demo"
            description="Vista previa sin conexion real de autenticacion."
            style={{
              background: "rgba(255,255,255,0.98)",
              border: "1px solid rgba(226,232,240,0.88)",
              boxShadow: "0 28px 64px rgba(15,23,42,0.12)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-4rem",
                right: "-4rem",
                width: "10rem",
                height: "10rem",
                borderRadius: "999px",
                background: "rgba(20,184,166,0.08)"
              }}
            />

            <div style={{ position: "relative", display: "grid", gap: "1rem" }}>
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

              <FoundationButton
                fullWidth
                style={{
                  background: "linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)",
                  borderColor: "transparent",
                  color: "#082f49"
                }}
              >
                Ingresar a la demo
              </FoundationButton>

              <div
                style={{
                  borderRadius: "1.1rem",
                  padding: "1rem",
                  background: "linear-gradient(180deg, #ecfeff 0%, #f8fafc 100%)",
                  border: "1px solid rgba(125,211,252,0.45)",
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
                    color: "#0f766e"
                  }}
                >
                  Credenciales demo
                </p>
                <strong style={{ color: "#0f172a" }}>{credentials.email}</strong>
                <span style={{ color: "#334155" }}>{credentials.password}</span>
              </div>

              <Link to="/fitness" style={{ textDecoration: "none" }}>
                <FoundationButton
                  variant="secondary"
                  fullWidth
                  style={{
                    borderColor: "#14b8a6",
                    color: "#0f766e"
                  }}
                >
                  Entrar a la demo
                </FoundationButton>
              </Link>
            </div>
          </FoundationCard>
        </section>

        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            paddingTop: "0.5rem"
          }}
        >
          <span style={{ color: "#475569" }}>RubDev SaaS</span>
          <span style={{ color: "#64748b" }}>Fitness Foundation Preview</span>
        </footer>
      </div>
    </div>
  );
}

export default FitnessLandingLoginPreview;
