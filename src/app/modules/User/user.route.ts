import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import { userController } from "./user.controller";
import { userValidations } from "./user.validation";

const router = express.Router();

router.post(
  "/create-admin",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidations.createAdmin.parse(JSON.parse(req.body.data));
    return userController.createAdmin(req, res, next);
  },
);
router.post(
  "/create-doctor",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidations.createDoctor.parse(JSON.parse(req.body.data));
    return userController.createDoctor(req, res, next);
  },
);
router.post(
  "/create-patient",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidations.createPatient.parse(JSON.parse(req.body.data));
    return userController.createDoctor(req, res, next);
  },
);

export const userRoutes = router;
