import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { patientController } from "./patient.controller";

const router = express.Router();

router.get("/", patientController.getAllPatient);
router.get("/:id", patientController.getByIdFromDb);
router.patch("/:id", patientController.updateIntoDb);

export const patientRoutes = router;
