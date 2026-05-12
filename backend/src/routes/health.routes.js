import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { query } from "../config/db.js";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    await query("select 1");
    res.json({
      success: true,
      message: "API y base de datos operativas"
    });
  })
);
