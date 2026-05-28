import { buildFitnessCompanyParams, buildFitnessUrl } from "./fitnessApi.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function runFitnessApiValidation() {
  const listUrl = buildFitnessUrl("/fitness/trainers", "demo-company-id", {
    search: "Laura Demo",
    limit: 10
  });
  const detailUrl = buildFitnessUrl(
    "/fitness/routine-templates/template-1/structure",
    "demo-company-id"
  );
  const missingCompanyParams = buildFitnessCompanyParams(null, { search: "demo" });
  const missingCompanyUrl = buildFitnessUrl("/fitness/exercises", null, {
    search: "Squat"
  });

  assert(
    listUrl === "/fitness/trainers?companyId=demo-company-id&search=Laura+Demo&limit=10",
    "La URL de listado no coincide con el formato esperado"
  );
  assert(
    detailUrl === "/fitness/routine-templates/template-1/structure?companyId=demo-company-id",
    "La URL de structure no coincide con el formato esperado"
  );
  assert(missingCompanyParams === null, "El fallback de params sin companyId debe ser null");
  assert(
    missingCompanyUrl === "/fitness/exercises",
    "La URL sin companyId debe permanecer segura y sin query params"
  );

  return {
    valid: true,
    urls: {
      listUrl,
      detailUrl,
      missingCompanyUrl
    },
    fallbacks: {
      missingCompanyParamsIsNull: true
    }
  };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  console.log(JSON.stringify(runFitnessApiValidation()));
}
