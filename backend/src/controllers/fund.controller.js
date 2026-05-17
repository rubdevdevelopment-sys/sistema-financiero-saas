import { sendSuccess } from "../utils/response.js";
import {
  getFundOverview,
  listFundCycles,
  listFundMembers
} from "../services/fund.service.js";

export async function getFundOverviewAction(req, res) {
  const overview = await getFundOverview(req.user, req.validated.query);
  return sendSuccess(res, overview, "Dashboard de fondo obtenido");
}

export async function getFundCyclesAction(req, res) {
  const cycles = await listFundCycles(req.user, req.validated.query);
  return sendSuccess(res, cycles, "Ciclos de fondo obtenidos");
}

export async function getFundMembersAction(req, res) {
  const members = await listFundMembers(req.user, req.validated.query);
  return sendSuccess(res, members, "Miembros del fondo obtenidos");
}
