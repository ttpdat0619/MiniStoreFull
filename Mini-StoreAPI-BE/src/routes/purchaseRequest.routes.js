import express from "express";
import * as purchaseRequestController from "../controllers/purchaseRequest.controller";
import { authorize, verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

//==========GET ALL LIST PURCHASE REQUEST==========
router.get("/",
    [verifyToken, authorize(["Admin", "Manager"])],
    purchaseRequestController.getAllRequestInput
);

//==========CREATE NEW REQUEST==========
router.post("/Import",
    [verifyToken, authorize(["Admin", "Manager"])],
    purchaseRequestController.createImport
);

//==========GET DETAIL PURCHASE REQUEST==========
router.get("/Purchase-Detail/:requestId",
    [verifyToken, authorize(["Admin", "Manager"])],
    purchaseRequestController.getRequestDetail
);

//==========ROUTER TO UPDATE PURCHASE REQUEST==========
router.put("/Purchase-Update/:requestId",
    [verifyToken, authorize(["Admin", "Manager"])],
    purchaseRequestController.updateRequest
);

//==========ROUTER TO DELETE PURCHASE REQUEST==========
router.delete("/Purchase-Delete/:requestId",
    [verifyToken, authorize(["Admin", "Manager"])],
    purchaseRequestController.deleteRequest
);

//==========ROUTER TO HANDLE PROCESS REQUEST==========
router.post("/ProcessRequest/:requestId",
    [verifyToken, authorize(["Admin"])],
    purchaseRequestController.processRequestInpurt
);

export default router;