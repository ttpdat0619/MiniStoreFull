import { AppDataSource } from "../config/db.config";
import { InternalTransferEntity } from "../entities/internalTransfer.entity";
import * as internalTransferService from "../services/internalTransfer.service";

const transferRepo = AppDataSource.getRepository(InternalTransferEntity);

//==========CONTROLLER TO CREATE TRANSFER REQUEST SERVICE==========
export const createTransfer = async (req, res) => {
    try {
        const { fromBranchId, toBranchId, items, sendNote } = req.body;
        const senderId = req.user.UserID;

        if (!fromBranchId || !toBranchId || !items || items.length === 0) {
            return res.status(400).json({
                message: "Missing required fields (fromBranchId, toBranchId, or items array)."
            });
        }

        const result = await internalTransferService.createTransfer(senderId, fromBranchId, toBranchId, items, sendNote);
        res.status(201).json({
            message: "Internal transfer request created success",
            data: result
        });
    } catch (error) {
        console.error("Error Creating Transfer:", error),
            res.status(500).json({
                message: "Internal Server Error during transfer creation",
                error: error.message
            });
    }
};

//==========CONTROLLER TO GET ALL TRANSFER==========
export const getAllTransfers = async (req, res) => {
    try {
        const userRole = req.user.RoleName;
        const branchId = req.user.BranchID;

        const transfer = await internalTransferService.getAllTransfers(userRole, branchId);
        res.status(200).json(transfer);
    } catch (error) {
        console.error("Error fetching transfer:", error);
        res.status(500).json({
            message: "Internal Server Error fetching transfer list.",
            error: error.message
        });
    }
};

//==========CONTROLLER TO GET TRANFER REQUEST BY ID===========
export const getTransferById = async (req, res) => {
    try {
        const { transferId } = req.params;
        const transfer = await internalTransferService.getTransferById(transferId);

        if (!transfer) {
            return res.status(404).json({
                message: "Transfer request not found"
            });
        }

        res.status(200).json(transfer);
    } catch (error) {
        console.error("Error fetching transfer details:", error);
        res.status(500).json({
            message: "Internal Server Error fetching transfer details",
            error: error.message
        });
    }
};

//===========CONTROLLER TO RESPOND TO TRANFER REQUEST===========
export const respondToTransfer = async (req, res) => {
    try {
        const { transferId } = req.params;
        const { action, note } = req.body;
        const receiverId = req.user.UserID;

        if (!["Approved", "Rejected"].includes(action)) {
            return res.status(400).json({
                message: "Invalid Action. Allowed values are 'Approved' or 'Rejected'."
            });
        }

        const transfer = await transferRepo.findOne({
            where: { TransferID: transferId }
        });

        if (!transfer) {
            return res.status(404).json({
                message: "Transfer request not found"
            });
        }

        //Validate that the user belongs to the target branch (Or admin)
        if (req.user.RoleName !== "Admin" && req.user.BranchID !== transfer.ToBranchID) {
            return res.status(403).json({
                message: "Forbidden: You are not authorized to respond to this Transfer Request."
            });
        }

        const result = await internalTransferService.respondToTransfer(transferId, receiverId, action, note);
        res.status(200).json({
            message: `Transfer request ${action.toLowerCase()} successfully`,
            data: result
        });
    } catch (error) {
        console.error("Error responding to transfer:", error);
        res.status(500).json({
            message: "Internal Server Error responding to transfer.",
            error: error.message
        });
    }
};

//==========CONTROLLER TO APPROVE TRANSFER REQUEST==========
export const approveTransfer = async (req, res) => {
    try {
        const { transferId } = req.params;
        const { action, note } = req.body;
        const adminId = req.user.UserID;

        if (req.user.RoleName !== "Admin") {
            return res.status(403).json({
                message: "Forbidden: Only Admin can finalize transfer request."
            });
        }

        if (!["Approved", "Rejected"].includes(action)) {
            return res.status(400).json({
                message: "Invalid action. Allowed values are 'Approved' or 'Rejected'."
            });
        }

        const result = await internalTransferService.approveTransfer(transferId, adminId, action, note);
        res.status(200).json({
            message: `Transfer Request ${action.toLowerCase()} successfully by Admin.`,
            data: result
        });
    } catch (error) {
        console.error("Error in Admin transfer approval:", error);
        res.status(500).json({
            message: "Internal Server Error during Admin approval.",
            error: error.message
        });
    }
};

//==========CONTROLLER TO EDIT TRANSFER REQUEST===========
export const editTransfer = async (req, res) => {
    try {
        const { transferId } = req.params;
        const { items, sendNote } = req.body;
        const userId = req.user.UserID;
        const userRole = req.user.RoleName;

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Items array is required and cannot be empty."
            });
        }

        const result = await internalTransferService.editTransfer(transferId, userId, userRole, items, sendNote);
        res.status(200).json({
            message: "Transfer Request Update Success!",
            data: result
        });
    } catch (error) {
        console.error("Error editing transfer:", error);
        res.status(500).json({
            message: error.message || "Internal Server Error During Transfer Edit",
            error: error.message
        });
    }
};