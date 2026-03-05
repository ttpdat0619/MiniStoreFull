import express from "express";
import * as branchController from "../controllers/branch.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, branchController.getAllBranches);
router.get("/:branchId", verifyToken, branchController.getBranchById);

export default router;
