import express from "express";
import { appointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/my-appointments",
  auth(UserRole.DOCTOR, UserRole.PATIENT),
  appointmentController.getMyAppointment,
);

router.post(
  "/create-appointment",
  auth(UserRole.PATIENT),
  appointmentController.createAppointmentIntoDb,
);

export const appointmentRoutes = router;
