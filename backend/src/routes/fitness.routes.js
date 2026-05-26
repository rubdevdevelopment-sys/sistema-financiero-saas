import { Router } from "express";
import {
  createExerciseAction,
  createFitnessClientAction,
  createProgramAction,
  createWorkoutLogAction,
  deleteExerciseAction,
  deleteFitnessClientAction,
  deleteProgramAction,
  deleteWorkoutLogAction,
  fitnessDashboardAction,
  getProgramAction,
  listExercisesAction,
  listFitnessClientsAction,
  listProgramsAction,
  listWorkoutLogsAction,
  updateExerciseAction,
  updateFitnessClientAction,
  updateProgramAction,
  updateWorkoutLogAction
} from "../controllers/fitness.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  fitnessClientCreateSchema,
  fitnessClientUpdateSchema,
  fitnessDashboardSchema,
  fitnessExerciseCreateSchema,
  fitnessExerciseUpdateSchema,
  fitnessListSchema,
  fitnessLogCreateSchema,
  fitnessLogUpdateSchema,
  fitnessParamsSchema,
  fitnessProgramCreateSchema,
  fitnessProgramUpdateSchema
} from "../validators/fitness.validators.js";

export const fitnessRouter = Router();

fitnessRouter.get("/dashboard", validate(fitnessDashboardSchema), asyncHandler(fitnessDashboardAction));

fitnessRouter.get("/clients", validate(fitnessListSchema), asyncHandler(listFitnessClientsAction));
fitnessRouter.post("/clients", authorize("super_admin", "admin", "operator"), validate(fitnessClientCreateSchema), asyncHandler(createFitnessClientAction));
fitnessRouter.put("/clients/:id", authorize("super_admin", "admin", "operator"), validate(fitnessClientUpdateSchema), asyncHandler(updateFitnessClientAction));
fitnessRouter.delete("/clients/:id", authorize("super_admin", "admin"), validate(fitnessParamsSchema), asyncHandler(deleteFitnessClientAction));

fitnessRouter.get("/exercises", validate(fitnessListSchema), asyncHandler(listExercisesAction));
fitnessRouter.post("/exercises", authorize("super_admin", "admin", "operator"), validate(fitnessExerciseCreateSchema), asyncHandler(createExerciseAction));
fitnessRouter.put("/exercises/:id", authorize("super_admin", "admin", "operator"), validate(fitnessExerciseUpdateSchema), asyncHandler(updateExerciseAction));
fitnessRouter.delete("/exercises/:id", authorize("super_admin", "admin"), validate(fitnessParamsSchema), asyncHandler(deleteExerciseAction));

fitnessRouter.get("/programs", validate(fitnessListSchema), asyncHandler(listProgramsAction));
fitnessRouter.get("/programs/:id", validate(fitnessParamsSchema), asyncHandler(getProgramAction));
fitnessRouter.post("/programs", authorize("super_admin", "admin", "operator"), validate(fitnessProgramCreateSchema), asyncHandler(createProgramAction));
fitnessRouter.put("/programs/:id", authorize("super_admin", "admin", "operator"), validate(fitnessProgramUpdateSchema), asyncHandler(updateProgramAction));
fitnessRouter.delete("/programs/:id", authorize("super_admin", "admin"), validate(fitnessParamsSchema), asyncHandler(deleteProgramAction));

fitnessRouter.get("/logs", validate(fitnessListSchema), asyncHandler(listWorkoutLogsAction));
fitnessRouter.post("/logs", authorize("super_admin", "admin", "operator", "client"), validate(fitnessLogCreateSchema), asyncHandler(createWorkoutLogAction));
fitnessRouter.put("/logs/:id", authorize("super_admin", "admin", "operator", "client"), validate(fitnessLogUpdateSchema), asyncHandler(updateWorkoutLogAction));
fitnessRouter.delete("/logs/:id", authorize("super_admin", "admin", "client"), validate(fitnessParamsSchema), asyncHandler(deleteWorkoutLogAction));
