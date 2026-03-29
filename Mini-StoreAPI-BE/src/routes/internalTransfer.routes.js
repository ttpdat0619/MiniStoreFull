import express from "express";
import { authorize, verifyToken } from "../middleware/auth.middleware.js";
import * as internalTransferController from "../controllers/internalTransfer.controller.js";

const router = express.Router();

/**
 * @route POST /api/internal-transfers
 * @desc Create a new internal transfer request (Managers only for now, can be extended to Admin)
 * @access Manager, Admin
 */
router.post(
    "/CreateRequestTransfer",
    [verifyToken, authorize(["Manager", "Admin"])],
    internalTransferController.createTransfer
);

/**
 * @route GET /api/internal-transfers
 * @desc Get all transfers (filtered by branch for Manager, all for Admin)
 * @access Manager, Admin
 */
router.get(
    "/RequestTransfer",
    [verifyToken, authorize(["Manager", "Admin"])],
    internalTransferController.getAllTransfers
);

/**
 * @route GET /api/internal-transfers/:id
 * @desc Get details of a specific transfer request
 * @access Manager, Admin
 */
router.get(
    "/:transferId",
    [verifyToken, authorize(["Manager", "Admin"])],
    internalTransferController.getTransferById
);

/**
 * @route PUT /api/internal-transfers/:id/respond
 * @desc Respond to a transfer request (Target Manager: Approve/Reject)
 * @access Manager, Admin
 */
router.put(
    "/:transferId/respond",
    [verifyToken, authorize(["Manager"])],
    internalTransferController.respondToTransfer
);

/**
 * @route PUT /api/internal-transfers/:id/approve
 * @desc Final approval for a transfer request and handle stock movement
 * @access Admin
 */
router.put(
    "/:transferId/approve",
    [verifyToken, authorize(["Admin"])],
    internalTransferController.approveTransfer
);

//==========ROUTES TO EDIT TRANSFER REQUEST==========
router.put(
    "/:transferId/edit",
    [verifyToken, authorize(["Manager", "Admin"])],
    internalTransferController.editTransfer
);

export default router;