import express from "express";
import { appointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { appointmentValidation } from "./appointment.validation";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), appointmentController.getAllFromDb);
router.get(
  "/my-appointments",
  auth(UserRole.DOCTOR, UserRole.PATIENT),
  appointmentController.getMyAppointment,
);

router.post(
  "/create-appointment",
  auth(UserRole.PATIENT),
  validateRequest(appointmentValidation.create),
  appointmentController.createAppointmentIntoDb,
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  appointmentController.changeAppointmentStatus,
);

export const appointmentRoutes = router;
