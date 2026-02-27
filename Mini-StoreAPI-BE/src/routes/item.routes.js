import express from "express";
import * as itemController from "../controllers/item.controller"
import { authorize, verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", [verifyToken, authorize(["Admin", "Manager"])], itemController.getAll);

export default router;