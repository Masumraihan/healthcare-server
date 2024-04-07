import express from "express";
import { doctorScheduleController } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", auth(UserRole.DOCTOR), doctorScheduleController.getAllFromDb);
//router.post("/", auth(UserRole.DOCTOR), doctorScheduleController.insertIntoDb);

export const doctorScheduleRoutes = router;
