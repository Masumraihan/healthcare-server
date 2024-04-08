import express from "express";
import { scheduleController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { scheduleValidations } from "./schedule.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(scheduleValidations.create),
  scheduleController.insertIntoDb,
);
router.get("/", auth(UserRole.DOCTOR), scheduleController.getAllFromDb);

export const scheduleRoutes = router;
