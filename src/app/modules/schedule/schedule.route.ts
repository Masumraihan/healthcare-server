import express from "express";
import { scheduleController } from "./schedule.controller";

const router = express.Router();

router.post("/", scheduleController.insertIntoDb);

export const scheduleRoutes = router;
