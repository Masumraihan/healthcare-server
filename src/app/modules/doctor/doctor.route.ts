import express from "express";
import { doctorController } from "./doctor.controller";

const router = express.Router();

router.patch("/:id", doctorController.updateIntoDb);

export const doctorRoutes = router;
