import { Router } from "express";
import {
  createFundCycleAction,
  approveFundLoanAction,
  createFundLoanAction,
  createFundMemberAction,
  createFundPenaltyAction,
  createFundQuotaAction,
  generateFundContributionsAction,
  getFundContributionsAction,
  getFundCyclesAction,
  getFundLoanInstallmentsAction,
  getFundLoansAction,
  getFundMembersAction,
  getFundOverviewAction,
  getFundPenaltiesAction,
  getFundQuotasAction,
  registerFundContributionPaymentAction,
  registerFundLoanInstallmentPaymentAction,
  updateFundCycleAction,
  updateFundMemberAction,
  updateFundMemberStatusAction,
  updateFundQuotaAction
} from "../controllers/fund.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createFundCycleSchema,
  approveFundLoanSchema,
  createFundLoanSchema,
  createFundMemberSchema,
  createFundPenaltySchema,
  createFundQuotaSchema,
  fundQuerySchema,
  generateExtraordinaryContributionSchema,
  generateContributionsSchema,
  registerContributionPaymentSchema,
  registerLoanInstallmentPaymentSchema,
  updateFundCycleSchema,
  updateFundMemberSchema,
  updateFundMemberStatusSchema,
  updateFundQuotaSchema
} from "../validators/fund.validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const fundRouter = Router();

fundRouter.get("/overview", validate(fundQuerySchema), asyncHandler(getFundOverviewAction));

fundRouter.get("/cycles", validate(fundQuerySchema), asyncHandler(getFundCyclesAction));
fundRouter.post(
  "/cycles",
  authorize("super_admin", "admin", "operator"),
  validate(createFundCycleSchema),
  asyncHandler(createFundCycleAction)
);
fundRouter.put(
  "/cycles/:id",
  authorize("super_admin", "admin", "operator"),
  validate(updateFundCycleSchema),
  asyncHandler(updateFundCycleAction)
);

fundRouter.get("/members", validate(fundQuerySchema), asyncHandler(getFundMembersAction));
fundRouter.post(
  "/members",
  authorize("super_admin", "admin", "operator"),
  validate(createFundMemberSchema),
  asyncHandler(createFundMemberAction)
);
fundRouter.put(
  "/members/:id",
  authorize("super_admin", "admin", "operator"),
  validate(updateFundMemberSchema),
  asyncHandler(updateFundMemberAction)
);
fundRouter.patch(
  "/members/:id/status",
  authorize("super_admin", "admin", "operator"),
  validate(updateFundMemberStatusSchema),
  asyncHandler(updateFundMemberStatusAction)
);

fundRouter.get("/quotas", validate(fundQuerySchema), asyncHandler(getFundQuotasAction));
fundRouter.post(
  "/quotas",
  authorize("super_admin", "admin", "operator"),
  validate(createFundQuotaSchema),
  asyncHandler(createFundQuotaAction)
);
fundRouter.put(
  "/quotas/:id",
  authorize("super_admin", "admin", "operator"),
  validate(updateFundQuotaSchema),
  asyncHandler(updateFundQuotaAction)
);

fundRouter.get("/contributions", validate(fundQuerySchema), asyncHandler(getFundContributionsAction));
fundRouter.post(
  "/contributions/generate",
  authorize("super_admin", "admin", "operator"),
  validate(generateContributionsSchema),
  asyncHandler(generateFundContributionsAction)
);
fundRouter.post(
  "/contributions/extraordinary",
  authorize("super_admin", "admin", "operator"),
  validate(generateExtraordinaryContributionSchema),
  asyncHandler(generateFundContributionsAction)
);
fundRouter.put(
  "/contributions/:id/payment",
  authorize("super_admin", "admin", "operator"),
  validate(registerContributionPaymentSchema),
  asyncHandler(registerFundContributionPaymentAction)
);

fundRouter.get("/penalties", validate(fundQuerySchema), asyncHandler(getFundPenaltiesAction));
fundRouter.post(
  "/penalties",
  authorize("super_admin", "admin", "operator"),
  validate(createFundPenaltySchema),
  asyncHandler(createFundPenaltyAction)
);

fundRouter.get("/loans", validate(fundQuerySchema), asyncHandler(getFundLoansAction));
fundRouter.post(
  "/loans",
  authorize("super_admin", "admin", "operator"),
  validate(createFundLoanSchema),
  asyncHandler(createFundLoanAction)
);
fundRouter.put(
  "/loans/:id/approve",
  authorize("super_admin", "admin", "operator"),
  validate(approveFundLoanSchema),
  asyncHandler(approveFundLoanAction)
);
fundRouter.get("/loan-installments", validate(fundQuerySchema), asyncHandler(getFundLoanInstallmentsAction));
fundRouter.put(
  "/loan-installments/:id/payment",
  authorize("super_admin", "admin", "operator"),
  validate(registerLoanInstallmentPaymentSchema),
  asyncHandler(registerFundLoanInstallmentPaymentAction)
);
