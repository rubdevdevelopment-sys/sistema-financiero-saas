import { Router } from "express";
import {
  createCompanyAction,
  getCurrentCompanyAction,
  getCompanies,
  updateCurrentCompanyAction,
  updateCompanyAction
} from "../controllers/company.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCompanySchema,
  updateCurrentCompanySchema,
  updateCompanySchema
} from "../validators/company.validators.js";

export const companyRouter = Router();

companyRouter.get("/current", asyncHandler(getCurrentCompanyAction));
companyRouter.put(
  "/current",
  authorize("super_admin", "admin"),
  validate(updateCurrentCompanySchema),
  asyncHandler(updateCurrentCompanyAction)
);
companyRouter.get("/", authorize("super_admin"), asyncHandler(getCompanies));
companyRouter.post(
  "/",
  authorize("super_admin"),
  validate(createCompanySchema),
  asyncHandler(createCompanyAction)
);
companyRouter.put(
  "/:id",
  authorize("super_admin"),
  validate(updateCompanySchema),
  asyncHandler(updateCompanyAction)
);
