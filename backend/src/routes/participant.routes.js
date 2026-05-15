import { Router } from "express";
import {
  createParticipantAction,
  deleteParticipantAction,
  exportParticipantsCsvAction,
  getParticipant,
  getParticipants,
  updateParticipantAction
} from "../controllers/participant.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createParticipantSchema,
  listParticipantSchema,
  participantParamsSchema,
  updateParticipantSchema
} from "../validators/participant.validators.js";

export const participantRouter = Router();

participantRouter.get("/", validate(listParticipantSchema), asyncHandler(getParticipants));
participantRouter.get(
  "/exportar/csv",
  validate(listParticipantSchema),
  authorize("super_admin", "admin", "operator"),
  asyncHandler(exportParticipantsCsvAction)
);
participantRouter.get("/:id", validate(participantParamsSchema), asyncHandler(getParticipant));
participantRouter.post(
  "/",
  authorize("super_admin", "admin", "operator"),
  validate(createParticipantSchema),
  asyncHandler(createParticipantAction)
);
participantRouter.put(
  "/:id",
  authorize("super_admin", "admin", "operator"),
  validate(updateParticipantSchema),
  asyncHandler(updateParticipantAction)
);
participantRouter.delete(
  "/:id",
  authorize("super_admin", "admin"),
  validate(participantParamsSchema),
  asyncHandler(deleteParticipantAction)
);
