import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import {
  getRoutineTemplateById,
  getRoutineTemplateStructure,
  listRoutineTemplates
} from "./routine-templates.service.js";
import {
  resolveFitnessCompanyScope,
  sendSafeItemResponse,
  sendSafeListResponse
} from "../fitness-route.utils.js";

export const routineTemplatesRouter = Router();

routineTemplatesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const scope = resolveFitnessCompanyScope(req);

    if (!scope.companyId) {
      return sendSafeListResponse(res, scope.reason);
    }

    const data = await listRoutineTemplates(scope.companyId, {
      search: req.query.search,
      level: req.query.level,
      goal: req.query.goal,
      isActive: req.query.isActive,
      limit: req.query.limit
    });

    return sendSuccess(res, data, "Routine templates obtenidos");
  })
);

routineTemplatesRouter.get(
  "/:id/structure",
  asyncHandler(async (req, res) => {
    const scope = resolveFitnessCompanyScope(req);

    if (!scope.companyId) {
      return sendSafeItemResponse(res, scope.reason);
    }

    const data = await getRoutineTemplateStructure(scope.companyId, req.params.id);
    return sendSuccess(res, data, "Routine template structure obtenido");
  })
);

routineTemplatesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const scope = resolveFitnessCompanyScope(req);

    if (!scope.companyId) {
      return sendSafeItemResponse(res, scope.reason);
    }

    const data = await getRoutineTemplateById(scope.companyId, req.params.id);
    return sendSuccess(res, data, "Routine template obtenido");
  })
);
