import { Router } from "express";
import {
  createCategoryAction,
  getCategories
} from "../controllers/category.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCategorySchema } from "../validators/category.validators.js";

export const categoryRouter = Router();

categoryRouter.get("/", asyncHandler(getCategories));
categoryRouter.post(
  "/",
  authorize("super_admin", "admin"),
  validate(createCategorySchema),
  asyncHandler(createCategoryAction)
);
