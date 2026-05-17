import { Router } from "express";
import {
  createFundCycleAction,
  createFundMemberAction,
  createFundPenaltyAction,
  createFundQuotaAction,
  generateFundContributionsAction,
  getFundContributionsAction,
  getFundCyclesAction,
  getFundMembersAction,
  getFundOverviewAction,
  getFundPenaltiesAction,
  getFundQuotasAction,
  registerFundContributionPaymentAction,
  updateFundCycleAction,
  updateFundMemberAction,
  updateFundMemberStatusAction,
  updateFundQuotaAction
} from "../controllers/fund.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createFundCycleSchema,
  createFundMemberSchema,
  createFundPenaltySchema,
  createFundQuotaSchema,
  fundQuerySchema,
  generateContributionsSchema,
  registerContributionPaymentSchema,
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
