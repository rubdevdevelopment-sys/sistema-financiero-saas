import { Router } from "express";
import {
  createCategoryAction,
  deleteCategoryAction,
  getCategories,
  updateCategoryAction
} from "../controllers/category.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  categoryParamsSchema,
  createCategorySchema,
  listCategorySchema,
  updateCategorySchema
} from "../validators/category.validators.js";

export const categoryRouter = Router();

categoryRouter.get("/", validate(listCategorySchema), asyncHandler(getCategories));
categoryRouter.post(
  "/",
  authorize("super_admin", "admin"),
  validate(createCategorySchema),
  asyncHandler(createCategoryAction)
);
categoryRouter.put(
  "/:id",
  authorize("super_admin", "admin"),
  validate(updateCategorySchema),
  asyncHandler(updateCategoryAction)
);
categoryRouter.delete(
  "/:id",
  authorize("super_admin", "admin"),
  validate(categoryParamsSchema),
  asyncHandler(deleteCategoryAction)
);
