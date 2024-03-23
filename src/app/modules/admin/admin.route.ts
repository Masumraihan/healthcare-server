import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { adminControllers } from "./admin.controller";
import { adminValidationSchemas } from "./admin.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), adminControllers.getAllAdmin);
router.get("/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), adminControllers.getByIdFromDb);
router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(adminValidationSchemas.update),
  adminControllers.updateDataIntoDb,
);
router.delete("/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), adminControllers.deleteFromDb);
router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  adminControllers.softDeleteFromDb,
);

export const adminRoutes = router;
