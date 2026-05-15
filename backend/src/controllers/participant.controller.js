import { sendSuccess } from "../utils/response.js";
import {
  createParticipant,
  deleteParticipant,
  exportParticipantsCsv,
  getParticipantDetail,
  listParticipants,
  updateParticipant
} from "../services/participant.service.js";

export async function getParticipants(req, res) {
  const participants = await listParticipants(req.user, req.validated.query);
  return sendSuccess(res, participants, "Participantes obtenidos");
}

export async function getParticipant(req, res) {
  const participant = await getParticipantDetail(req.validated.params.id, req.user);
  return sendSuccess(res, participant, "Participante obtenido");
}

export async function createParticipantAction(req, res) {
  const participant = await createParticipant(req.validated.body, req.user);
  return sendSuccess(res, participant, "Participante creado", 201);
}

export async function updateParticipantAction(req, res) {
  const participant = await updateParticipant(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, participant, "Participante actualizado");
}

export async function deleteParticipantAction(req, res) {
  const participant = await deleteParticipant(req.validated.params.id, req.user);
  return sendSuccess(res, participant, "Participante eliminado");
}

export async function exportParticipantsCsvAction(req, res) {
  const csv = await exportParticipantsCsv(req.user, req.validated.query);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="participantes-emaus.csv"');
  return res.status(200).send(`\ufeff${csv}`);
}
