import { sendSuccess } from "../utils/response.js";
import {
  createCompany,
  getCurrentCompany,
  listCompanies,
  updateCurrentCompany,
  updateCompany
} from "../services/company.service.js";

export async function getCompanies(_req, res) {
  const companies = await listCompanies();
  return sendSuccess(res, companies, "Empresas obtenidas");
}

export async function createCompanyAction(req, res) {
  const company = await createCompany(req.validated.body);
  return sendSuccess(res, company, "Empresa creada", 201);
}

export async function updateCompanyAction(req, res) {
  const company = await updateCompany(req.validated.params.id, req.validated.body);
  return sendSuccess(res, company, "Empresa actualizada");
}

export async function getCurrentCompanyAction(req, res) {
  const company = await getCurrentCompany(req.user, req.query);
  return sendSuccess(res, company, "Empresa actual obtenida");
}

export async function updateCurrentCompanyAction(req, res) {
  const company = await updateCurrentCompany(req.user, req.validated.body);
  return sendSuccess(res, company, "Configuracion de empresa actualizada");
}
