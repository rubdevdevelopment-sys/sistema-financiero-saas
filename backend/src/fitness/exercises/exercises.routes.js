import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { getExerciseById, listExercises } from "./exercises.service.js";
import {
  resolveFitnessCompanyScope,
  sendSafeItemResponse,
  sendSafeListResponse
} from "../fitness-route.utils.js";

export const exercisesRouter = Router();

exercisesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const scope = resolveFitnessCompanyScope(req);

    if (!scope.companyId) {
      return sendSafeListResponse(res, scope.reason);
    }

    const data = await listExercises(scope.companyId, {
      search: req.query.search,
      category: req.query.category,
      muscleGroup: req.query.muscleGroup,
      difficulty: req.query.difficulty,
      isActive: req.query.isActive,
      limit: req.query.limit
    });

    return sendSuccess(res, data, "Exercises obtenidos");
  })
);

exercisesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const scope = resolveFitnessCompanyScope(req);

    if (!scope.companyId) {
      return sendSafeItemResponse(res, scope.reason);
    }

    const data = await getExerciseById(scope.companyId, req.params.id);
    return sendSuccess(res, data, "Exercise obtenido");
  })
);
