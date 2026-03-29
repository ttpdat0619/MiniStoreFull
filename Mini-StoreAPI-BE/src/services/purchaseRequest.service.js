import { AppDataSource } from "../config/db.config";
import { InventoryEntity } from "../entities/inventory.entity";
import { PurchaseDetailEntity } from "../entities/purchaseDetail.entity";
import { purchaseRequestEntity } from "../entities/purchaseRequest.entity";
import { getStatusByName } from "../helpers/status.helper";
import { writeActivityLog } from "../helpers/activityLog.helper";
import { v7 as uuidv7 } from "uuid";

const requestRepo = AppDataSource.getRepository(purchaseRequestEntity);
const inventoryRepo = AppDataSource.getRepository(InventoryEntity);


//=========GET ALL REQUESTS ==========
export const getAllRequests = async (userId, userRole, branchId) => {
    //If not Admin just Fillter and take Purchase Inport By that Manager Create
    const whereCondition = userRole === 'Admin' ? {} : { BranchID: branchId };

    return await requestRepo.find({
        where: whereCondition,
        relations: ["details", "details.item", "manager", "status", "branch"],
        order: { CreateAt: "DESC" }
    });
};

//==========SERVICE TO CREATE REQUEST==========
export const createRequest = async (managerId, items, branchId) => {
    return await AppDataSource.transaction(async (transactionEM) => {
        const pendingStatus = await getStatusByName("Pending");
        const requestId = uuidv7();

        const details = items.map(item => ({
            DetailID: uuidv7(),
            RequestID: requestId,
            ItemID: item.ItemID,
            Quantity: item.Quantity
        }));

        const newRequest = transactionEM.create(purchaseRequestEntity, {
            RequestID: requestId,
            ManagerID: managerId,
            BranchID: branchId,
            StatusID: pendingStatus.StatusID,
            details: details
        });
        const saveRequest = await transactionEM.save(purchaseRequestEntity, newRequest);

        await writeActivityLog(
            transactionEM,
            managerId,
            "Create a new purchase Request Items for Branch",
            "PurchaseRequests",
            requestId,
            "New Purchase Order",
            [{ branchId: branchId, role: "Affected" }]
        );

        return saveRequest;
    });
};

//==========SERVICE TO GET REQUEST DETAIL BY ID==========
export const getRequestById = async (requestId) => {
    return await requestRepo.findOne({
        where: { RequestID: requestId },
        relations: [
            "details",
            "details.item",
            "details.item.unit",
            "manager",
            "approver",
            "status",
            "branch"
        ]
    });
};

//==========SERVICE UPDATE REQUEST==========
export const updateRequest = async (requestId, userId, userRole, items) => {
    // 1. Find the request and its status
    const request = await requestRepo.findOne({
        where: { RequestID: requestId },
        relations: ["status"]
    });
    if (!request) throw new Error("Purchase Request not found!");
    // 2. Security Check: Only editable if still 'Pending'
    if (request.status.StatusName !== "Pending") {
        throw new Error("Cannot edit a request that has already been Approved or Rejected.");
    }
    // 3. Time calculation (3 days window)
    const now = new Date();
    const createAt = new Date(request.CreateAt);
    const diffInDays = (now - createAt) / (1000 * 60 * 60 * 24);
    if (userRole === 'Admin') {
        // NEW CONDITION: Admin can only edit AFTER the 3-day manager window expires
        if (request.ManagerID !== userId && diffInDays <= 3) {
            throw new Error("Admin can only edit other managers' requests after the 3-day window has expired.");
        }
    } else {
        // Manager logic
        // Must be the owner
        if (request.ManagerID !== userId) {
            throw new Error("Access Denied: You are not the creator of this request.");
        }
        // Must be within 3 days
        if (diffInDays > 3) {
            throw new Error("The 3-day edit window has expired for Managers. Please contact an Administrator.");
        }
    }
    // 4. Perform update in transaction
    return await AppDataSource.transaction(async (transactionEntityManager) => {
        // Clear Old Details
        await transactionEntityManager.delete(PurchaseDetailEntity, { RequestID: requestId });
        // Create New Details (using UUIDv7)
        const newDetails = items.map(item => ({
            DetailID: uuidv7(),
            RequestID: requestId,
            ItemID: item.ItemID,
            Quantity: item.Quantity
        }));
        // Save new list
        await transactionEntityManager.save(PurchaseDetailEntity, newDetails);
        // Write Activity Log
        await writeActivityLog(
            transactionEntityManager,
            userId,
            `Update Purchase Request #${requestId.substring(0, 8)}. Items re-configured by ${userRole}.`,
            "PurchaseRequests",
            requestId,
            "Update Order",
            [{ branchId: request.BranchID, role: "Affected" }]
        );
        return { message: "Purchase Request updated successfully!" };
    });
};

//===========SERVICE TO DELETE REQUEST==========
export const deleteRequest = async (requestId, userId, userRole) => {

    //Find request
    const request = await requestRepo.findOne({
        where: { RequestID: requestId },
        relations: ["status"]
    });

    if (!request) {
        throw new Error("Purchase Request Not Found!");
    }

    //Admin cannot Delete, Reject Only!
    if (userRole === 'Admin') {
        throw new Error("Admin is not allowed to delete request! Please Reject that!");
    }

    //Only Creater can delete this
    if (request.ManagerID !== userId) {
        throw new Error("You aer not creator of this Request. Deletion denied");
    }

    //Only delete in 2 days
    const now = new Date();
    const createAt = new Date(request.CreateAt);
    const diffInDays = (now - createAt) / (1000 * 60 * 60 * 24);

    if (diffInDays > 2) {
        throw new Error("Deletion window expired. Managers can only delete Request within 2 days of Creation. Pls Contect to Admin to Reject Request!");
    }

    //Handle delete in transaction
    return await AppDataSource.transaction(async (transactionEntityManager) => {
        //Delete Purchase Detail first
        await transactionEntityManager.delete(PurchaseDetailEntity, { RequestID: requestId });

        //Delete Main Purchase
        await transactionEntityManager.delete(purchaseRequestEntity, { RequestID: requestId });

        //Write Log History
        await writeActivityLog(
            transactionEntityManager,
            userId,
            `Delete Purchase Request #${requestId.substring(0, 8)}.`,
            "PurchaseRequests",
            requestId,
            "Delete Order",
            [{ branchId: request.BranchID, role: "Affected" }]
        );
    });
}

//==========HANDLE REQUEST APPROVE/REJECT==========
export const processRequest = async (requestId, appoverId, action, reason = null) => {

    const request = await requestRepo.findOne({
        where: { RequestID: requestId },
        relations: ["details", "details.item", "status"]
    });

    if (!request) throw new Error("Request not found!");

    if (request.status.StatusName !== "Pending") {
        throw new Error("Request has already been processed");
    }

    if (action === "Approved") {
        //Take Status Approved form helper
        const approvedStatus = await getStatusByName("Approved");

        await AppDataSource.transaction(async (transactionEntityManager) => {
            await transactionEntityManager.update(purchaseRequestEntity, requestId, {
                StatusID: approvedStatus.StatusID,
                ApproverID: appoverId,
                ApprovalDate: new Date()
            });

            for (const detail of request.details) {
                // Lấy hệ số quy đổi từ Item (ví dụ: 1 thùng = 3000g hoặc 126 miếng)
                // Cột Quantity trong bảng Items lưu trữ hệ số này
                const itemMultiplier = detail.item?.Quantity || 1;
                const totalAddedAmount = Number(detail.Quantity) * Number(itemMultiplier);

                // Find inventory for THIS specific branch
                const inventory = await transactionEntityManager.findOne(InventoryEntity, {
                    where: { ItemID: detail.ItemID, BranchID: request.BranchID }
                });

                if (inventory) {
                    inventory.StockQuantity = Number(inventory.StockQuantity) + totalAddedAmount;
                    inventory.LastUpdatedAt = new Date();
                    await transactionEntityManager.save(InventoryEntity, inventory);
                } else {
                    // Search for any existing inventory for this item to copy MinQuantity (based on "Linh Xuân" or others)
                    const existingInv = await transactionEntityManager.findOne(InventoryEntity, {
                        where: { ItemID: detail.ItemID }
                    });
                    const templateMinQty = existingInv ? existingInv.MinQuantity : 0;

                    // If no inventory record exists for this branch, create one:
                    const newInventory = inventoryRepo.create({
                        InventoryID: uuidv7(),
                        ItemID: detail.ItemID,
                        BranchID: request.BranchID,
                        InventoryName: detail.item.ItemName,
                        StockQuantity: totalAddedAmount,
                        MinQuantity: templateMinQty
                    });
                    await transactionEntityManager.save(InventoryEntity, newInventory);
                }
            }
        });

        //----------WRITE LOG APPROVER----------
        await writeActivityLog(
            transactionEntityManager,
            appoverId,
            "Approved purchase request and update Inventory.",
            "PurchaseRequests",
            requestId,
            "New Purchase Order",
            [{ branchId: request.BranchID, role: "Affected" }]
        );

        return { message: "Request approved and inventory update Success!" };

    } else if (action === "Rejected") {
        const rejectedStatus = await getStatusByName("Rejected");

        await requestRepo.update(requestId, {
            StatusID: rejectedStatus.StatusID,
            ApproverID: appoverId,
            RejectionReason: reason,
            ApprovalDate: new Date()
        });

        //----------WRITE LOG IF REJECTED----------
        await writeActivityLog(
            AppDataSource.manager,
            appoverId,
            `Rejected purchase request. Reason: ${reason}`,
            "PurchaseRequests",
            requestId,
            "Rejected",
            [{ branchId: request.BranchID, role: "Affected" }]
        );

        return { message: "Request Rejected Success!" }

    } else {
        throw new Error("Invalid Action")
    }


}
