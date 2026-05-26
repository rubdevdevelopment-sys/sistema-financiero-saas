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

export async function getFitnessClient(id, params = {}) {
  return unwrap(await api.get(`/fitness/clients/${id}`, { params }));
}

export async function createFitnessClient(payload) {
  return unwrap(await api.post("/fitness/clients", payload));
}

export async function updateFitnessClient(id, payload) {
  return unwrap(await api.put(`/fitness/clients/${id}`, payload));
}

export async function deleteFitnessClient(id) {
  return unwrap(await api.delete(`/fitness/clients/${id}`));
}

export async function getFitnessExercises(params = {}) {
  return unwrap(await api.get("/fitness/exercises", { params }));
}

export async function createFitnessExercise(payload) {
  return unwrap(await api.post("/fitness/exercises", payload));
}

export async function updateFitnessExercise(id, payload) {
  return unwrap(await api.put(`/fitness/exercises/${id}`, payload));
}

export async function deleteFitnessExercise(id) {
  return unwrap(await api.delete(`/fitness/exercises/${id}`));
}

export async function getFitnessPrograms(params = {}) {
  return unwrap(await api.get("/fitness/programs", { params }));
}

export async function getFitnessProgram(id, params = {}) {
  return unwrap(await api.get(`/fitness/programs/${id}`, { params }));
}

export async function createFitnessProgram(payload) {
  return unwrap(await api.post("/fitness/programs", payload));
}

export async function updateFitnessProgram(id, payload) {
  return unwrap(await api.put(`/fitness/programs/${id}`, payload));
}

export async function deleteFitnessProgram(id) {
  return unwrap(await api.delete(`/fitness/programs/${id}`));
}

export async function getWorkoutLogs(params = {}) {
  return unwrap(await api.get("/fitness/logs", { params }));
}

export async function createWorkoutLog(payload) {
  return unwrap(await api.post("/fitness/logs", payload));
}

export async function updateWorkoutLog(id, payload) {
  return unwrap(await api.put(`/fitness/logs/${id}`, payload));
}

export async function deleteWorkoutLog(id) {
  return unwrap(await api.delete(`/fitness/logs/${id}`));
}
