import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { getTrainerById, listTrainers } from "./trainers.service.js";
import {
  resolveFitnessCompanyScope,
  sendSafeItemResponse,
  sendSafeListResponse
} from "../fitness-route.utils.js";

export const trainersRouter = Router();

trainersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const scope = resolveFitnessCompanyScope(req);

    if (!scope.companyId) {
      return sendSafeListResponse(res, scope.reason);
    }

    const data = await listTrainers(scope.companyId, {
      search: req.query.search,
      status: req.query.status,
      specialization: req.query.specialization,
      limit: req.query.limit
    });

    return sendSuccess(res, data, "Trainers obtenidos");
  })
);

trainersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const scope = resolveFitnessCompanyScope(req);

    if (!scope.companyId) {
      return sendSafeItemResponse(res, scope.reason);
    }

    const data = await getTrainerById(scope.companyId, req.params.id);
    return sendSuccess(res, data, "Trainer obtenido");
  })
);
