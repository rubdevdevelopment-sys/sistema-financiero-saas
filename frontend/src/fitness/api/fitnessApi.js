import { api } from "../../services/api.js";

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export function buildFitnessCompanyParams(companyId, filters = {}) {
  const normalizedCompanyId = normalizeNullableString(companyId);

  if (!normalizedCompanyId) {
    return null;
  }

  const params = new URLSearchParams();
  params.set("companyId", normalizedCompanyId);

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  return params;
}

export function buildFitnessUrl(path, companyId, filters = {}) {
  const params = buildFitnessCompanyParams(companyId, filters);

  if (!params) {
    return path;
  }

  return `${path}?${params.toString()}`;
}

export async function getFitnessList(path, companyId, filters = {}) {
  if (!normalizeNullableString(companyId)) {
    return [];
  }

  const response = await api.get(path, {
    params: Object.fromEntries(buildFitnessCompanyParams(companyId, filters).entries())
  });
  return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function getFitnessItem(path, companyId, id) {
  if (!normalizeNullableString(companyId) || !normalizeNullableString(id)) {
    return null;
  }

  const response = await api.get(path, {
    params: Object.fromEntries(buildFitnessCompanyParams(companyId).entries())
  });
  return response.data?.data ?? null;
}

export { normalizeNullableString };
