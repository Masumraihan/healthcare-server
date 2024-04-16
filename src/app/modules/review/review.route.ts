import express from "express";
import { reviewController } from "./review.conrtroller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { reviewValidation } from "./review.validation";

const router = express.Router();

router.get("/", reviewController.getAllFromDb);
router.post(
  "/",
  auth(UserRole.PATIENT),
  validateRequest(reviewValidation.create),
  reviewController.insertIntoDb,
);

export const reviewRoutes = router;
