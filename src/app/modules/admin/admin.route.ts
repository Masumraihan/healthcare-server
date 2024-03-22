import { AnyZodObject, z } from "zod";
import express, { NextFunction, Request, Response } from "express";
import { adminControllers } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { adminValidationSchemas } from "./admin.validation";

const router = express.Router();

router.get("/", adminControllers.getAllAdmin);
router.get("/:id", adminControllers.getByIdFromDb);
router.patch(
  "/:id",
  validateRequest(adminValidationSchemas.update),
  adminControllers.updateDataIntoDb,
);
router.delete("/:id", adminControllers.deleteFromDb);
router.delete("/soft/:id", adminControllers.softDeleteFromDb);

export const adminRoutes = router;
