import express from "express";
import { adminControllers } from "./admin.controller";

const router = express.Router();

router.get("/", adminControllers.getAllAdmin);
router.get("/:id", adminControllers.getByIdFromDb);
router.patch("/:id", adminControllers.updateDataIntoDb);
router.delete("/:id", adminControllers.deleteFromDb);

export const adminRoutes = router;
