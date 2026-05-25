import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.middleware.js";
import { getPublicCompanyDashboard } from "../controllers/public-dashboard.controller.js";
import { publicCompanyDashboardSchema } from "../validators/company.validators.js";

export const publicRouter = Router();

publicRouter.get(
  "/company/:slug/dashboard",
  validate(publicCompanyDashboardSchema),
  asyncHandler(getPublicCompanyDashboard)
);
