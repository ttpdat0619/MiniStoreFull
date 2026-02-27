import express from "express";
import * as inventoryController from "../controllers/inventory.controller.js";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", [verifyToken, authorize(["Admin", "Manager", "Staff"])], inventoryController.getAll); // Staff might need access too
router.get("/low-stock", [verifyToken, authorize(["Admin", "Manager"])], inventoryController.getLowStock);

export default router;
