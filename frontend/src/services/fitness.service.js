import api from "./api";

function unwrap(response) {
  return response.data.data;
}

export async function getFitnessDashboard(params = {}) {
  return unwrap(await api.get("/fitness/dashboard", { params }));
}

export async function getFitnessClients(params = {}) {
  return unwrap(await api.get("/fitness/clients", { params }));
}

export async function createFitnessClient(payload) {
  return unwrap(await api.post("/fitness/clients", payload));
}

export async function getFitnessExercises(params = {}) {
  return unwrap(await api.get("/fitness/exercises", { params }));
}

export async function createFitnessExercise(payload) {
  return unwrap(await api.post("/fitness/exercises", payload));
}

export async function getFitnessPrograms(params = {}) {
  return unwrap(await api.get("/fitness/programs", { params }));
}

export async function createFitnessProgram(payload) {
  return unwrap(await api.post("/fitness/programs", payload));
}

export async function getWorkoutLogs(params = {}) {
  return unwrap(await api.get("/fitness/logs", { params }));
}

export async function createWorkoutLog(payload) {
  return unwrap(await api.post("/fitness/logs", payload));
}
