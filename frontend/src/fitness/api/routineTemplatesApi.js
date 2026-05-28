import { getFitnessItem, getFitnessList } from "./fitnessApi.js";

export async function listRoutineTemplates(companyId, filters = {}) {
  return getFitnessList("/fitness/routine-templates", companyId, {
    search: filters.search,
    level: filters.level,
    goal: filters.goal,
    isActive: filters.isActive,
    limit: filters.limit
  });
}

export async function getRoutineTemplateById(companyId, templateId) {
  return getFitnessItem(`/fitness/routine-templates/${templateId}`, companyId, templateId);
}

export async function getRoutineTemplateStructure(companyId, templateId) {
  return getFitnessItem(
    `/fitness/routine-templates/${templateId}/structure`,
    companyId,
    templateId
  );
}
