import { Router } from "express";
import {
  createUserAction,
  getUsers,
  updateUserAction
} from "../controllers/user.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserSchema, updateUserSchema } from "../validators/user.validators.js";

export const userRouter = Router();

userRouter.get("/", authorize("super_admin", "admin"), asyncHandler(getUsers));
userRouter.post(
  "/",
  authorize("super_admin", "admin"),
  validate(createUserSchema),
  asyncHandler(createUserAction)
);
userRouter.put(
  "/:id",
  authorize("super_admin", "admin"),
  validate(updateUserSchema),
  asyncHandler(updateUserAction)
);
