import { getFitnessItem, getFitnessList } from "./fitnessApi.js";

export async function listFitnessClients(companyId, filters = {}) {
  return getFitnessList("/fitness/clients", companyId, {
    search: filters.search,
    status: filters.status,
    assignedTrainerId: filters.assignedTrainerId,
    limit: filters.limit
  });
}

export async function getFitnessClientById(companyId, clientId) {
  return getFitnessItem(`/fitness/clients/${clientId}`, companyId, clientId);
}
