import express from "express";
import { prescriptionController } from "./prescription.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { prescriptionValidations } from "./prescrioption.validation";

const router = express.Router();
router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(prescriptionValidations.create),
  prescriptionController.getAllFromDb,
);
router.get("/my-prescriptions", auth(UserRole.PATIENT), prescriptionController.myPrescriptions);
router.post("/", auth(UserRole.DOCTOR), prescriptionController.insertIntoDb);

export const prescriptionRoutes = router;
