import express from "express";
import auth from "../../middlewares/auth";
import { userController } from "./user.controller";

const router = express.Router();

router.post("/", auth("ADMIN"), userController.createAdmin);

export const userRoutes = router;
