import { Router } from "express";
import {
  createSupportSessionAction,
  getSuperAdminDashboardAction
} from "../controllers/superAdmin.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { supportSessionSchema } from "../validators/superAdmin.validators.js";

export const superAdminRouter = Router();

superAdminRouter.use(authorize("super_admin"));
superAdminRouter.get("/dashboard", asyncHandler(getSuperAdminDashboardAction));
superAdminRouter.post(
  "/support-sessions",
  validate(supportSessionSchema),
  asyncHandler(createSupportSessionAction)
);
