import { sendSuccess } from "../utils/response.js";
import { getPublicCompanyDashboardBySlug } from "../services/public-dashboard.service.js";

export async function getPublicCompanyDashboard(req, res) {
  const dashboard = await getPublicCompanyDashboardBySlug(req.validated.params.slug);
  return sendSuccess(res, dashboard, "Portal publico obtenido");
}
