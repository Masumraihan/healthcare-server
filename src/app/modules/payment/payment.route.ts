import express from "express";
import { paymentController } from "./payment.controller";

const router = express.Router();

router.post("/ipn", paymentController.validatePayment);
router.post("/init-payment/:paymentId", paymentController.initPayment);

export const paymentRoutes = router;
