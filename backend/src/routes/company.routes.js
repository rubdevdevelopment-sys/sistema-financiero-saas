import { Router } from "express";
import {
  createCompanyAction,
  getCompanies,
  updateCompanyAction
} from "../controllers/company.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCompanySchema,
  updateCompanySchema
} from "../validators/company.validators.js";

export const companyRouter = Router();

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
