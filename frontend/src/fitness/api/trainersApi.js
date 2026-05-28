import { getFitnessItem, getFitnessList } from "./fitnessApi.js";

export async function listTrainers(companyId, filters = {}) {
  return getFitnessList("/fitness/trainers", companyId, {
    search: filters.search,
    status: filters.status,
    specialization: filters.specialization,
    limit: filters.limit
  });
}

export async function getTrainerById(companyId, trainerId) {
  return getFitnessItem(`/fitness/trainers/${trainerId}`, companyId, trainerId);
}
