import express from "express";
import { authControllers } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { authValidations } from "./auth.validation";

const router = express.Router();

router.post("/login", validateRequest(authValidations.login), authControllers.loginUser);
router.post("/refresh-token", authControllers.refreshToken);
router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  validateRequest(authValidations.changePassword),
  authControllers.changePassword,
);
router.post(
  "/forgot-password",
  validateRequest(authValidations.forgotPassword),
  authControllers.forgotPassword,
);
router.post(
  "/reset-password",
  validateRequest(authValidations.resetPassword),
  authControllers.resetPassword,
);

export const authRoutes = router;
