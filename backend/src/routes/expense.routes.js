import { Router } from "express";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense
} from "../controllers/expense.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createFinanceSchema,
  updateFinanceSchema
} from "../validators/finance.validators.js";

export const expenseRouter = Router();

expenseRouter.get("/", asyncHandler(getExpenses));
expenseRouter.post(
  "/",
  authorize("super_admin", "admin", "operator"),
  validate(createFinanceSchema),
  asyncHandler(createExpense)
);
expenseRouter.put(
  "/:id",
  authorize("super_admin", "admin", "operator"),
  validate(updateFinanceSchema),
  asyncHandler(updateExpense)
);
expenseRouter.delete(
  "/:id",
  authorize("super_admin", "admin"),
  asyncHandler(deleteExpense)
);
