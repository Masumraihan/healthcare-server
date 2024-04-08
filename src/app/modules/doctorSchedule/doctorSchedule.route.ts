import express from "express";
import { doctorScheduleController } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/doctor-schedule",
  auth(UserRole.DOCTOR, UserRole.PATIENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  doctorScheduleController.getAllFromDb,
);
router.get("/my-schedule", auth(UserRole.DOCTOR), doctorScheduleController.getMySchedules);
router.post("/", auth(UserRole.DOCTOR), doctorScheduleController.insertIntoDb);
router.delete("/:id", auth(UserRole.DOCTOR), doctorScheduleController.deleteFromDb);
export const doctorScheduleRoutes = router;
