import { Outlet } from "react-router-dom";

import { FitnessSidebar } from "../components/FitnessSidebar.jsx";
import { FitnessTopbar } from "../components/FitnessTopbar.jsx";
import { useFitnessCompanyScope } from "../hooks/useFitnessCompanyScope.js";

export function FitnessAppLayout() {
  const scope = useFitnessCompanyScope();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(16,185,129,0.2) 0%, rgba(248,250,252,1) 28%, rgba(224,242,254,1) 70%, rgba(239,246,255,1) 100%)",
        color: "#0f172a"
      }}
    >
      <div
        style={{
          maxWidth: "96rem",
          margin: "0 auto",
          padding: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: "1.25rem"
        }}
      >
        <aside
          style={{
            minWidth: "18rem",
            flex: "0 1 20rem",
            width: "100%"
          }}
        >
          <FitnessSidebar />
        </aside>

        <main
          style={{
            minWidth: 0,
            flex: "1 1 48rem",
            width: "100%",
            display: "grid",
            gap: "1rem"
          }}
        >
          <FitnessTopbar
            company={scope.company}
            source={scope.source}
            isDemoScope={scope.isDemoScope}
          />
          <section style={{ minWidth: 0 }}>
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}

export default FitnessAppLayout;
