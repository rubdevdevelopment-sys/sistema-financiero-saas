import { Router } from "express";
import {
  getFundCyclesAction,
  getFundMembersAction,
  getFundOverviewAction
} from "../controllers/fund.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { fundQuerySchema } from "../validators/fund.validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const fundRouter = Router();

fundRouter.get("/overview", validate(fundQuerySchema), asyncHandler(getFundOverviewAction));
fundRouter.get("/cycles", validate(fundQuerySchema), asyncHandler(getFundCyclesAction));
fundRouter.get("/members", validate(fundQuerySchema), asyncHandler(getFundMembersAction));
