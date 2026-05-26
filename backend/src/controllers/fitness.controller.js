import { sendSuccess } from "../utils/response.js";
import {
  createExercise,
  createFitnessClient,
  createProgram,
  createWorkoutLog,
  deleteExercise,
  deleteFitnessClient,
  deleteProgram,
  deleteWorkoutLog,
  getFitnessDashboard,
  getFitnessClientDetail,
  getProgramDetail,
  listExercises,
  listFitnessClients,
  listPrograms,
  listWorkoutLogs,
  updateExercise,
  updateFitnessClient,
  updateProgram,
  updateWorkoutLog
} from "../services/fitness.service.js";

export async function fitnessDashboardAction(req, res) {
  const dashboard = await getFitnessDashboard(req.user, req.validated.query ?? {});
  return sendSuccess(res, dashboard, "Dashboard fitness obtenido");
}

export async function listFitnessClientsAction(req, res) {
  const clients = await listFitnessClients(req.user, req.validated.query);
  return sendSuccess(res, clients, "Clientes fitness obtenidos");
}

export async function createFitnessClientAction(req, res) {
  const client = await createFitnessClient(req.validated.body, req.user);
  return sendSuccess(res, client, "Cliente fitness creado", 201);
}

export async function getFitnessClientAction(req, res) {
  const client = await getFitnessClientDetail(req.validated.params.id, req.user);
  return sendSuccess(res, client, "Detalle del cliente fitness obtenido");
}

export async function updateFitnessClientAction(req, res) {
  const client = await updateFitnessClient(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, client, "Cliente fitness actualizado");
}

export async function deleteFitnessClientAction(req, res) {
  const client = await deleteFitnessClient(req.validated.params.id, req.user);
  return sendSuccess(res, client, "Cliente fitness eliminado");
}

export async function listExercisesAction(req, res) {
  const exercises = await listExercises(req.user, req.validated.query);
  return sendSuccess(res, exercises, "Ejercicios obtenidos");
}

export async function createExerciseAction(req, res) {
  const exercise = await createExercise(req.validated.body, req.user);
  return sendSuccess(res, exercise, "Ejercicio creado", 201);
}

export async function updateExerciseAction(req, res) {
  const exercise = await updateExercise(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, exercise, "Ejercicio actualizado");
}

export async function deleteExerciseAction(req, res) {
  const exercise = await deleteExercise(req.validated.params.id, req.user);
  return sendSuccess(res, exercise, "Ejercicio eliminado");
}

export async function listProgramsAction(req, res) {
  const programs = await listPrograms(req.user, req.validated.query);
  return sendSuccess(res, programs, "Rutinas obtenidas");
}

export async function getProgramAction(req, res) {
  const program = await getProgramDetail(req.validated.params.id, req.user);
  return sendSuccess(res, program, "Rutina obtenida");
}

export async function createProgramAction(req, res) {
  const program = await createProgram(req.validated.body, req.user);
  return sendSuccess(res, program, "Rutina creada", 201);
}

export async function updateProgramAction(req, res) {
  const program = await updateProgram(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, program, "Rutina actualizada");
}

export async function deleteProgramAction(req, res) {
  const program = await deleteProgram(req.validated.params.id, req.user);
  return sendSuccess(res, program, "Rutina eliminada");
}

export async function listWorkoutLogsAction(req, res) {
  const logs = await listWorkoutLogs(req.user, req.validated.query);
  return sendSuccess(res, logs, "Entrenamientos obtenidos");
}

export async function createWorkoutLogAction(req, res) {
  const log = await createWorkoutLog(req.validated.body, req.user);
  return sendSuccess(res, log, "Entrenamiento registrado", 201);
}

export async function updateWorkoutLogAction(req, res) {
  const log = await updateWorkoutLog(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, log, "Entrenamiento actualizado");
}

export async function deleteWorkoutLogAction(req, res) {
  const log = await deleteWorkoutLog(req.validated.params.id, req.user);
  return sendSuccess(res, log, "Entrenamiento eliminado");
}
