import { sendSuccess } from "../utils/response.js";

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export function resolveRequestedCompanyId(req) {
  return (
    normalizeNullableString(req.query?.companyId) ??
    normalizeNullableString(req.headers["x-company-id"])
  );
}

export function resolveFitnessCompanyScope(req) {
  const requestedCompanyId = resolveRequestedCompanyId(req);
  const authenticatedCompanyId = normalizeNullableString(req.user?.companyId);
  const isSuperAdmin = req.user?.role === "super_admin";

  if (!requestedCompanyId) {
    return {
      companyId: null,
      reason: "missing_company_id"
    };
  }

  if (!isSuperAdmin && authenticatedCompanyId && requestedCompanyId !== authenticatedCompanyId) {
    return {
      companyId: null,
      reason: "company_scope_mismatch"
    };
  }

  return {
    companyId: requestedCompanyId,
    reason: null
  };
}

export function sendSafeListResponse(res, reason) {
  const message =
    reason === "company_scope_mismatch"
      ? "companyId fuera del alcance permitido"
      : "companyId requerido";

  return sendSuccess(res, [], message);
}

export function sendSafeItemResponse(res, reason) {
  const message =
    reason === "company_scope_mismatch"
      ? "companyId fuera del alcance permitido"
      : "companyId requerido";

  return sendSuccess(res, null, message);
}
