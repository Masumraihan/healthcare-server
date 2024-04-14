import express from "express";
import { prescriptionController } from "./prescription.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();
router.get("/my-prescriptions", auth(UserRole.PATIENT), prescriptionController.myPrescriptions);
router.post("/", auth(UserRole.DOCTOR), prescriptionController.insertIntoDb);

export const prescriptionRoutes = router;
