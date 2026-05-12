import { sendSuccess } from "../utils/response.js";
import { getDashboardMetrics } from "../services/dashboard.service.js";

export async function getDashboard(req, res) {
  const dashboard = await getDashboardMetrics(req.user);
  return sendSuccess(res, dashboard, "Dashboard obtenido");
}
