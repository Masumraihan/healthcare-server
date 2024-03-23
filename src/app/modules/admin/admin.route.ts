import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { adminControllers } from "./admin.controller";
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
