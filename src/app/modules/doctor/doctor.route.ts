import express from "express";
import { doctorController } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), doctorController.getAllDoctor);
router.get("/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), doctorController.getByIdFromDb);
router.patch("/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), doctorController.updateIntoDb);
router.delete("/:id", auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), doctorController.deleteFromDb);
router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  doctorController.softDeleteFromDb,
);

export const doctorRoutes = router;
