import { Router } from "express";
import {
  createIncome,
  deleteIncome,
  getIncomes,
  updateIncome
} from "../controllers/income.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createFinanceSchema,
  financeParamsSchema,
  listFinanceSchema,
  updateFinanceSchema
} from "../validators/finance.validators.js";

export const incomeRouter = Router();

incomeRouter.get("/", validate(listFinanceSchema), asyncHandler(getIncomes));
incomeRouter.post(
  "/",
  authorize("super_admin", "admin", "operator"),
  validate(createFinanceSchema),
  asyncHandler(createIncome)
);
incomeRouter.put(
  "/:id",
  authorize("super_admin", "admin", "operator"),
  validate(updateFinanceSchema),
  asyncHandler(updateIncome)
);
incomeRouter.delete(
  "/:id",
  authorize("super_admin", "admin"),
  validate(financeParamsSchema),
  asyncHandler(deleteIncome)
);
