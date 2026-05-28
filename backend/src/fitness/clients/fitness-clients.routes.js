import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { getFitnessClientById, listFitnessClients } from "./fitness-clients.service.js";
import {
  resolveFitnessCompanyScope,
  sendSafeItemResponse,
  sendSafeListResponse
} from "../fitness-route.utils.js";

export const fitnessClientsRouter = Router();

fitnessClientsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const scope = resolveFitnessCompanyScope(req);

    if (!scope.companyId) {
      return sendSafeListResponse(res, scope.reason);
    }

    const data = await listFitnessClients(scope.companyId, {
      search: req.query.search,
      status: req.query.status,
      assignedTrainerId: req.query.assignedTrainerId,
      limit: req.query.limit
    });

    return sendSuccess(res, data, "Fitness clients obtenidos");
  })
);

fitnessClientsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const scope = resolveFitnessCompanyScope(req);

    if (!scope.companyId) {
      return sendSafeItemResponse(res, scope.reason);
    }

    const data = await getFitnessClientById(scope.companyId, req.params.id);
    return sendSuccess(res, data, "Fitness client obtenido");
  })
);
