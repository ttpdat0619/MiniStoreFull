import { v7 as uuidv7 } from "uuid";
import { AppDataSource } from "../config/db.config";
import { InternalTransferEntity } from "../entities/internalTransfer.entity";
import { getStatusByName } from "../helpers/status.helper";
import { TransferDetailEntity } from "../entities/transferDetail.entity";
import { InventoryEntity } from "../entities/inventory.entity";
import { writeActivityLog } from "../helpers/activityLog.helper";
import { getBranchTransferLabel } from "../helpers/branch.helper";
import { ItemEntity } from "../entities/item.entity";
import { isEditWindowExpired, isWithinEditWindow } from "../helpers/time.helper";

const transferRepo = AppDataSource.getRepository(InternalTransferEntity);

// --- SHARED CONSTANTS ---
const TRANSFER_RELATIONS = ["fromBranch", "toBranch", "sender", "receiver", "approver", "receiveStatus", "approvalStatus"];

const processInventoryMovement = async (transactionEM, transfer) => {
    for (const detail of transfer.details) {
        // Calculate exact pieces using Item multiplier (packs * pieces/pack)
        const itemMultiplier = detail.item?.Quantity;
        const totalPieces = Number(detail.Quantity) * Number(itemMultiplier);

        // 1. Deduct from Source Branch
        let sourceInventoryName = "Transferred Item";
        const fromInv = await transactionEM.findOne(InventoryEntity, {
            where: { ItemID: detail.ItemID, BranchID: transfer.FromBranchID }
        });
        if (fromInv) {
            fromInv.StockQuantity = Number(fromInv.StockQuantity) - totalPieces;
            sourceInventoryName = fromInv.InventoryName; // Grab the exact name used in source store
            await transactionEM.save(InventoryEntity, fromInv);
        }

        // 2. Add to Target Branch
        let toInv = await transactionEM.findOne(InventoryEntity, {
            where: { ItemID: detail.ItemID, BranchID: transfer.ToBranchID }
        });

        if (toInv) {
            toInv.StockQuantity = Number(toInv.StockQuantity) + Number(detail.Quantity);
        } else {
            // Search for any existing inventory for this item to copy MinQuantity
            const existingInv = await transactionEM.findOne(InventoryEntity, {
                where: { ItemID: detail.ItemID }
            });
            const templateMinQty = existingInv ? existingInv.MinQuantity : 0;

            // Create new inventory record if it doesn't exist
            toInv = transactionEM.create(InventoryEntity, {
                InventoryID: uuidv7(),
                ItemID: detail.ItemID,
                BranchID: transfer.ToBranchID,
                StockQuantity: totalPieces,
                MinQuantity: templateMinQty,
                InventoryName: sourceInventoryName
            });
        }
        await transactionEM.save(InventoryEntity, toInv);
    }
};

//========== CREATE INTERNAL TRANSFER (SENDER) ===========
export const createTransfer = async (senderId, fromBranchId, toBranchId, items, sendNote) => {
    return await AppDataSource.transaction(async (transactionEM) => {
        const pendingStatus = await getStatusByName("Pending");
        const transferId = uuidv7();

        // 0. VALIDATE STOCK & MINQUANTITY BEFORE CREATING
        for (const item of items) {
            const itemRecord = await transactionEM.findOne(ItemEntity, { where: { ItemID: item.ItemID } });
            if (!itemRecord) throw new Error(`Product ${item.ItemID} not found in the system.`);

            const multiplier = itemRecord.Quantity || 1;
            const totalPieces = Number(item.Quantity) * Number(multiplier);

            const sourceInv = await transactionEM.findOne(InventoryEntity, {
                where: { ItemID: item.ItemID, BranchID: fromBranchId }
            });

            if (!sourceInv) throw new Error(`Product ${itemRecord.ItemName} is not in stock at the source branch.`);

            if (Number(sourceInv.StockQuantity) - totalPieces < Number(sourceInv.MinQuantity)) {
                throw new Error(`Cannot transfer ${itemRecord.ItemName}. It violates the minimum stock rule (Current: ${sourceInv.StockQuantity}, Min Allowed: ${sourceInv.MinQuantity}, Transferring: ${totalPieces}).`);
            }
        }

        // Fetch branch names for readable log
        const branch = await getBranchTransferLabel(transactionEM, fromBranchId, toBranchId);

        // 1. Create Transfer Request Header
        const newTransfer = transactionEM.create(InternalTransferEntity, {
            TransferID: transferId,
            FromBranchID: fromBranchId,
            ToBranchID: toBranchId,
            SenderID: senderId,
            ReceivingStatus: pendingStatus.StatusID,
            ApproveStatus: pendingStatus.StatusID,
            SendNote: sendNote
        });
        await transactionEM.save(InternalTransferEntity, newTransfer);

        // 2. Create Items Details
        const details = items.map(item => ({
            DetailID: uuidv7(),
            TransferID: transferId,
            ItemID: item.ItemID,
            Quantity: item.Quantity
        }));
        await transactionEM.save(TransferDetailEntity, details);

        // 3. Write Activity Log
        await writeActivityLog(
            transactionEM,
            senderId,
            `Created Transfer Request: ${branch.label}`,
            "InternalTransfers",
            transferId,
            `Transfer: ${branch.label}`,
            [
                { branchId: fromBranchId, role: "Source" },
                { branchId: toBranchId, role: "Destination" }
            ]
        );

        return { transferId };
    });
};

//========== GET ALL TRANSFERS ===========
export const getAllTransfers = async (userRole, branchId) => {
    let where = {};

    // Managers only see transfers related to their branch
    if (userRole !== 'Admin') {
        where = [
            { FromBranchID: branchId },
            { ToBranchID: branchId }
        ];
    }

    return await transferRepo.find({
        where: where,
        relations: TRANSFER_RELATIONS,
        order: { SentDate: "DESC" }
    });
};

//========== GET TRANSFER BY ID ==========
export const getTransferById = async (transferId) => {
    return await transferRepo.findOne({
        where: { TransferID: transferId },
        relations: [...TRANSFER_RELATIONS, "details", "details.item", "details.item.unit"]
    });
};

//========== RESPOND TO TRANSFER (RECEIVER) ==========
export const respondToTransfer = async (transferId, receiverId, action, note) => {
    return await AppDataSource.transaction(async (transactionEM) => {
        const transfer = await transactionEM.findOne(InternalTransferEntity, {
            where: { TransferID: transferId },
            relations: ["details", "details.item", "fromBranch", "toBranch", "approvalStatus"]
        });

        if (!transfer) throw new Error("Transfer request not found.");

        const status = await getStatusByName(action); // 'Approved' or 'Rejected'
        const branchLabel = `${transfer.fromBranch?.BranchName} -> ${transfer.toBranch?.BranchName}`;

        const updateData = {
            ReceivingStatus: status.StatusID,
            ReceiverID: receiverId,
            ReceivedDate: new Date(),
            ReceivedNote: note
        };

        // If Receiver rejects, automatically reject for Admin as well to terminate workflow
        if (action === "Rejected") {
            const rejectStatus = await getStatusByName("Rejected");
            updateData.ApproveStatus = rejectStatus.StatusID;
            updateData.AdminNote = "System Auto-Reject: Destination branch declined the transfer.";
        } else if (action === "Approved") {
            // If Receiver approves AND Admin has already approved, perform stock movement
            if (transfer.approvalStatus?.StatusName === "Approved") {
                await processInventoryMovement(transactionEM, transfer);
            }
        }

        await transactionEM.update(InternalTransferEntity, transferId, updateData);

        // Write Activity Log
        await writeActivityLog(
            transactionEM,
            receiverId,
            `Destination Branch ${action} Transfer: ${branchLabel}`,
            "InternalTransfers",
            transferId,
            `Receiver Response: ${branchLabel}`,
            [
                { branchId: transfer.FromBranchID, role: "Source" },
                { branchId: transfer.ToBranchID, role: "Destination" }
            ]
        );

        return { success: true };
    });
};

//========== APPROVE TRANSFER & STOCK MOVEMENT (ADMIN) ==========
export const approveTransfer = async (transferId, adminId, action, adminNote) => {
    return await AppDataSource.transaction(async (transactionEM) => {
        const transfer = await transactionEM.findOne(InternalTransferEntity, {
            where: { TransferID: transferId },
            relations: ["details", "details.item", "receiveStatus", "fromBranch", "toBranch"]
        });

        if (!transfer) throw new Error("Transfer request not found.");

        const status = await getStatusByName(action);
        const branchLabel = `${transfer.fromBranch?.BranchName} -> ${transfer.toBranch?.BranchName}`;

        const updateData = {
            ApproveStatus: status.StatusID,
            ApproverID: adminId,
            ApprovedDate: new Date(),
            AdminNote: adminNote
        };

        // If Admin rejects, automatically reject for Receiver as well to terminate workflow
        if (action === "Rejected") {
            const rejectStatus = await getStatusByName("Rejected");
            updateData.ReceivingStatus = rejectStatus.StatusID;
            updateData.ReceivedNote = "System Auto-Reject: Admin declined the transfer.";
        } else if (action === "Approved") {
            // If Admin approves AND Receiver has already approved, perform stock movement
            if (transfer.receiveStatus?.StatusName === "Approved") {
                await processInventoryMovement(transactionEM, transfer);
            }
        }

        await transactionEM.update(InternalTransferEntity, transferId, updateData);

        // Write Activity Log
        await writeActivityLog(
            transactionEM,
            adminId,
            `Admin ${action} Transfer: ${branchLabel}`,
            "InternalTransfers",
            transferId,
            `Admin Approval: ${branchLabel}`,
            [
                { branchId: transfer.FromBranchID, role: "Source" },
                { branchId: transfer.ToBranchID, role: "Destination" }
            ]
        );

        return { success: true };
    });
};

//==========EDIT TRANSFER REQUEST==========
export const editTransfer = async (transferId, userId, userRole, items, sendNote) => {

    //Fetch transfer with relations
    const transfer = await transferRepo.findOne({
        where: { TransferID: transferId },
        relations: [
            "receiveStatus",
            "approvalStatus",
            "fromBranch",
            "toBranch"
        ]
    });

    if (!transfer) {
        throw new Error("Transfer request not found");
    }

    //Block Editing if either party has already responded (not Pending)
    const receiverStatus = transfer.receiveStatus?.StatusName;
    const adminStatus = transfer.approvalStatus?.StatusName;

    if (receiverStatus !== "Pending" || adminStatus !== "Pending") {
        throw new Error("Cannot Edit This transfer. One or both parties have already responded. Pls Rejected this Request and create new Request!");
    }

    //Time Calculation (3 day)

    if (userRole === "Admin") {
        //Admin edit Own order: anytime. Edit manager's order after 3 day only
        if (transfer.SenderID !== userId && isWithinEditWindow(transfer.SentDate, 3)) {
            throw new Error("Admin can only edit other users' requests after 3 day");
        } else {
            if (transfer.SenderID !== userId) {
                throw new Error("Access Denied: You are not the Creator");
            }
            if (isEditWindowExpired(transfer.SentDate, 3)) {
                throw new Error("The 3 days edit has expired. Pls contact Admin.");
            }
        }
    }

    //Validate new Items against MinStock Rule
    for (const item of items) {
        const itemRecord = await AppDataSource.getRepository(ItemEntity).findOne({
            where: { ItemID: item.ItemID }
        });

        if (!itemRecord) {
            throw new Error(`Product ${item.ItemID} not found in the system.`);
        }

        const multiplier = itemRecord.Quantity;
        const totalPieces = Number(item.Quantity) * Number(multiplier);

        const sourceInv = await AppDataSource.getRepository(InventoryEntity).findOne({
            where: {
                ItemID: item.ItemID,
                BranchID: transfer.transferId
            }
        });

        if (!sourceInv) {
            throw new Error(`Product ${itemRecord.ItemName} is not in stock at the source branch.`);
        }

        if (Number(sourceInv.StockQuantity) - totalPieces < Number(sourceInv.MinQuantity)) {
            throw new Error(`Cannot transfer ${itemRecord.ItemName}. It violates the minium stock rule (Current: ${sourceInv.StockQuantity}, Min Allowed: ${sourceInv.MinQuantity}, Transferring: ${totalPieces}).`);
        }
    }

    //Perform update in transaction
    return await AppDataSource.transaction(async (transactionEM) => {

        //Clear old transfer details
        await transactionEM.delete(
            TransferDetailEntity,
            { TransferID: transferId }
        );

        //Craete new Transfer Detail
        const newDetails = items.map(item => ({
            DetailID: uuidv7(),
            TransferID: transferId,
            ItemID: item.ItemID,
            Quantity: item.Quantity
        }));

        await transactionEM.save(TransferDetailEntity, newDetails);

        //Update send note if provided
        if (sendNote !== undefined) {
            await transactionEM.update(
                InternalTransferEntity,
                transferId,
                { sendNote: sendNote }
            );
        }

        //Write activity Log
        const branchLabel = `${transfer.fromBranch?.BranchName} -> ${transfer.toBranch?.BranchName}`;
        await writeActivityLog(
            transactionEM,
            userId,
            `Update Transfer Request #${transferId.substring(0, 8)}: ${branchLabel}. Item Re-configured by ${userRole}.`,
            "InternalTransfers",
            transferId,
            `Edit Transfer: ${branchLabel}`,
            [
                { branchId: transfer.FromBranchID, role: "Source" },
                { branchId: transfer.ToBranchID, role: "Destination" }
            ]
        );

        return {
            message: "Transfer Request Update Success!"
        };
    });
};