import { sendSuccess } from "../utils/response.js";
import {
  getSuperAdminDashboard,
  registerSupportSession
} from "../services/superAdmin.service.js";

export async function getSuperAdminDashboardAction(_req, res) {
  const dashboard = await getSuperAdminDashboard();
  return sendSuccess(res, dashboard, "Dashboard global obtenido");
}

export async function createSupportSessionAction(req, res) {
  const session = await registerSupportSession(req.user, req.validated.body);
  return sendSuccess(res, session, "Sesion de soporte registrada", 201);
}
