import { getFitnessItem, getFitnessList } from "./fitnessApi.js";

export async function listExercises(companyId, filters = {}) {
  return getFitnessList("/fitness/exercises", companyId, {
    search: filters.search,
    category: filters.category,
    muscleGroup: filters.muscleGroup,
    difficulty: filters.difficulty,
    isActive: filters.isActive,
    limit: filters.limit
  });
}

export async function getExerciseById(companyId, exerciseId) {
  return getFitnessItem(`/fitness/exercises/${exerciseId}`, companyId, exerciseId);
}
