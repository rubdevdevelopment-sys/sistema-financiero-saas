import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { authRouter } from "./auth.routes.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { companyRouter } from "./company.routes.js";
import { userRouter } from "./user.routes.js";
import { categoryRouter } from "./category.routes.js";
import { incomeRouter } from "./income.routes.js";
import { expenseRouter } from "./expense.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";

export const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use(authMiddleware);
router.use("/companies", companyRouter);
router.use("/users", userRouter);
router.use("/categories", categoryRouter);
router.use("/incomes", incomeRouter);
router.use("/expenses", expenseRouter);
router.use("/dashboard", dashboardRouter);
