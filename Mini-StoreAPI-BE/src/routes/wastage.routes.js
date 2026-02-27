import express from "express";
import * as wastageController from "../controllers/wastage.controller";
import { authorize, verifyToken } from "../middleware/auth.middleware";
import { uploadWastage } from "../middleware/upload.middleware";

const router = express.Router();

//==========ROUTER TO CREATE WASTAGE REQUEST==========
router.post(
    "/create-Request",
    [verifyToken, authorize(["Admin", "Manager"]), uploadWastage.any()],
    wastageController.createWastage
);

//==========ROUTER TO GET ALL WASTAGE REQUEST==========
router.get(
    "/List-Wastage-Request",
    [verifyToken, authorize(["Admin", "Manager"])],
    wastageController.getAllWastage
);

//==========ROUTER TO GET WASTAGE REQUEST DETAIL==========
router.get(
    "/Wastage-Detail/:wastageId",
    [verifyToken, authorize(["Admin", "Manager"])],
    wastageController.getWastageDetail
);

router.put(
    "/Update-Request/:wastageId",
    [verifyToken, authorize(["Admin", "Manager"]), uploadWastage.any()],
    wastageController.updateWastage
);

router.delete(
    "/Delete-Request/:wastageId",
    [verifyToken, authorize(["Admin", "Manager"])],
    wastageController.deleteWastage
);

//==========ROUTER TO PROCESS WASTAGE REQUEST==========
router.post(
    "/Process/:wastageId",
    [verifyToken, authorize(["Admin", "Manager"])],
    wastageController.processWastage
);

export default router;
