import express from "express";
import { getActivityLogs } from "../controllers/activityLog.controller.js";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Only Admin and Manager can see logs (with different scopes enforced in the service layer)
router.get("/", verifyToken, authorize(["Admin", "Manager"]), getActivityLogs);

export default router;
