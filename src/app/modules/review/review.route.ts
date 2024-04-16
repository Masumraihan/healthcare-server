import express from "express";
import { reviewController } from "./review.conrtroller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", reviewController.getAllFromDb);
router.post("/", auth(UserRole.PATIENT), reviewController.insertIntoDb);

export const reviewRoutes = router;
