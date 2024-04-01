import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import { specialtiesController } from "./specialties.controller";
import { specialtiesValidation } from "./specialties.validation";

const router = express.Router();

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = specialtiesValidation.create.parse(JSON.parse(req.body.data));
    return specialtiesController.insertIntoDb(req, res, next);
  },
);

router.get("/", specialtiesController.getAllFromDb);
router.delete("/:id", specialtiesController.deleteFromDb);

export const specialtiesRoutes = router;
