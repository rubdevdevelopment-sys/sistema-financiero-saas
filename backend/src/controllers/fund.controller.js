import { sendSuccess } from "../utils/response.js";
import {
  createFundCycle,
  createFundMember,
  createFundPenalty,
  createFundQuota,
  generateFundContributions,
  getFundOverview,
  listFundContributions,
  listFundCycles,
  listFundMembers,
  listFundPenalties,
  listFundQuotas,
  registerFundContributionPayment,
  updateFundCycle,
  updateFundMember,
  updateFundMemberStatus,
  updateFundQuota
} from "../services/fund.service.js";

export async function getFundOverviewAction(req, res) {
  const overview = await getFundOverview(req.user, req.validated.query);
  return sendSuccess(res, overview, "Dashboard de fondo obtenido");
}

export async function getFundCyclesAction(req, res) {
  const cycles = await listFundCycles(req.user, req.validated.query);
  return sendSuccess(res, cycles, "Ciclos de fondo obtenidos");
}

export async function createFundCycleAction(req, res) {
  const cycle = await createFundCycle(req.validated.body, req.user);
  return sendSuccess(res, cycle, "Ciclo creado", 201);
}

export async function updateFundCycleAction(req, res) {
  const cycle = await updateFundCycle(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, cycle, "Ciclo actualizado");
}

export async function getFundMembersAction(req, res) {
  const members = await listFundMembers(req.user, req.validated.query);
  return sendSuccess(res, members, "Miembros del fondo obtenidos");
}

export async function createFundMemberAction(req, res) {
  const member = await createFundMember(req.validated.body, req.user);
  return sendSuccess(res, member, "Miembro creado", 201);
}

export async function updateFundMemberAction(req, res) {
  const member = await updateFundMember(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, member, "Miembro actualizado");
}

export async function updateFundMemberStatusAction(req, res) {
  const member = await updateFundMemberStatus(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, member, "Estado de miembro actualizado");
}

export async function getFundQuotasAction(req, res) {
  const quotas = await listFundQuotas(req.user, req.validated.query);
  return sendSuccess(res, quotas, "Cupos obtenidos");
}

export async function createFundQuotaAction(req, res) {
  const quota = await createFundQuota(req.validated.body, req.user);
  return sendSuccess(res, quota, "Cupos asignados", 201);
}

export async function updateFundQuotaAction(req, res) {
  const quota = await updateFundQuota(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, quota, "Cupos actualizados");
}

export async function getFundContributionsAction(req, res) {
  const contributions = await listFundContributions(req.user, req.validated.query);
  return sendSuccess(res, contributions, "Aportes mensuales obtenidos");
}

export async function generateFundContributionsAction(req, res) {
  const result = await generateFundContributions(req.validated.body, req.user);
  return sendSuccess(res, result, "Aportes mensuales generados", 201);
}

export async function registerFundContributionPaymentAction(req, res) {
  const contribution = await registerFundContributionPayment(
    req.validated.params.id,
    req.validated.body,
    req.user
  );
  return sendSuccess(res, contribution, "Pago registrado");
}

export async function getFundPenaltiesAction(req, res) {
  const penalties = await listFundPenalties(req.user, req.validated.query);
  return sendSuccess(res, penalties, "Multas obtenidas");
}

export async function createFundPenaltyAction(req, res) {
  const penalty = await createFundPenalty(req.validated.body, req.user);
  return sendSuccess(res, penalty, "Multa registrada", 201);
}
