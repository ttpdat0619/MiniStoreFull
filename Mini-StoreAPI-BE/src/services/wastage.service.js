import { v7 as uuidv7 } from "uuid"
import { AppDataSource } from "../config/db.config"
import { wastageRequestEntity } from "../entities/wastageRequest.entity"
import { ActivityLogEntity } from "../entities/activityLog.entity";
import { getStatusByName } from "../helpers/status.helper";
import { WastageDetailEntity } from "../entities/wastageDetail.entity";
import { InventoryEntity } from "../entities/inventory.entity";
import fs from "fs";
import path from "path";

const requestRepo = AppDataSource.getRepository(wastageRequestEntity);
const logRepo = AppDataSource.getRepository(ActivityLogEntity);

//==========SERVICE TO CREATE WASTAGE REQUEST==========
export const createWastageRequest = async (managerId, items) => {
    return await AppDataSource.transaction(async (transactionEM) => {
        //Using helper to get 'Pending' status
        const pendingStatus = await getStatusByName("Pending");
        const wastageId = uuidv7();

        //Create Wastage Header
        const newRequest = transactionEM.create(wastageRequestEntity, {
            WastageID: wastageId,
            RequesterID: managerId,
            StatusID: pendingStatus.StatusID
        });
        await transactionEM.save(wastageRequestEntity, newRequest);

        //Create detail with localized Reasons and Pictures
        const details = items.map(item => ({
            DetailID: uuidv7(),
            WastageID: wastageId,
            ItemID: item.ItemID,
            Quantity: item.Quantity,
            WastageReason: item.Reason,
            WastagePicture: item.WastagePicture
        }));
        await transactionEM.save(WastageDetailEntity, details);

        //Write activity log
        const log = logRepo.create({
            LogID: uuidv7(),
            UserID: managerId,
            Action: "Create a new wastage request with evidence photos.",
            TargetTable: "WastageRequests",
            TargetID: wastageId,
            TargetName: "New Wastage Order"
        });

        await transactionEM.save(ActivityLogEntity, log);

        return { wastageId };
    });
};

//==========SERVICE TO GET ALL LIST OF WASTAGE REQUEST==========
export const getAllWastageRequests = async (userId, userRole) => {

    //Admin sees all, Managers see only their own 
    const where = userRole === 'Admin' ? {} : { RequesterID: userId };
    return await requestRepo.find({
        where: where,
        relations: ["manager", "status", "approval"],
        order: { CreateAt: "DESC" }
    });
};

//==========SERVICE TO GER WASTAGE DETAIL==========
export const getWastageDetail = async (wastageId) => {
    return await requestRepo.findOne({
        where: { WastageID: wastageId },
        relations: [
            "details",
            "details.item",
            "details.item.unit",
            "manager",
            "status",
            "approval"
        ]
    });
};

//==========SERVICE TO EDIT WASTAGE REQUEST==========
export const updateWastageRequest = async (wastageId, userId, userRole, items) => {
    return await AppDataSource.transaction(async (transactionEM) => {
        const request = await transactionEM.findOne(wastageRequestEntity, {
            where: { WastageID: wastageId },
            relations: ["details", "status"]
        });

        if (!request) {
            throw new Error("Wastage Request Not found");
        }

        //Constraint: Only allowed to edit if status is "Pending"
        if (request.status.StatusName !== "Pending") {
            throw new Error("Cannot edit a processed request");
        }

        //Constraint: Managers can only edit within 3 days since creation
        if (userRole !== 'Admin') {
            const createDate = new Date(request.CreateAt);
            const now = new Date();
            const diffInHours = (now.getTime() - createDate.getTime()) / (1000 * 60 * 60);
            if (diffInHours > 72) {// 72 hours = 3 days
                throw new Error("The 3-day edit window has expired. Pls contact an Admin!");
            }
        }

        //Identify Physical image files to delete
        const oldDetails = request.details;
        const filesToDelete = [];

        for (const oldDetail of oldDetails) {
            //Check if this Item and its specific Picture still exist in the upload list
            const isStillPresent = items.find(newItem =>
                newItem.ItemID === oldDetail.ItemID &&
                newItem.WastagePicture === oldDetail.WastagePicture
            );

            //If not present in the new list, mark for deletion
            if (!isStillPresent && oldDetail.WastagePicture) {
                filesToDelete.push(oldDetail.WastagePicture);
            }
        }

        //Update Details: Remove old entries and insert new ones
        await transactionEM.delete(WastageDetailEntity, { WastageID: wastageId });

        const newDetails = items.map(item => ({
            DetailID: uuidv7(),
            WastageID: wastageId,
            ItemID: item.ItemID,
            Quantity: item.Quantity,
            WastageReason: item.Reason,
            WastagePicture: item.WastagePicture
        }));
        await transactionEM.save(WastageDetailEntity, newDetails);

        //Activity Loggin
        const log = transactionEM.create(ActivityLogEntity, {
            LogID: uuidv7(),
            UserID: userId,
            Action: `Update Wastage Request #${wastageId.substring(0, 8)}`,
            TargetTable: "WastageRequest",
            TargetID: wastageId,
            TargetName: "Wastage Upload"
        });
        await transactionEM.save(ActivityLogEntity, log);

        //Phisical File Cleanup
        filesToDelete.forEach(filePath => {
            try {
                const fullPath = path.join(process.cwd(), 'public', filePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (err) {
                console.error("Debug -cleanup error for path:", filePath, err);
            }
        });

        return { success: true };
    });
}

//==========SERVICE TO DELETE WASTAGE REQUEST==========
export const deleteWastageRequest = async (wastageId, userId, userRole) => {
    //Find request with its details and status
    const request = await requestRepo.findOne({
        where: { WastageID: wastageId },
        relations: ["details", "status"]
    });

    if (!request) {
        throw new Error("Wastage Request not Found!");
    }

    //Restriction: Admin cannot delete
    if (userRole === 'Admin') {
        throw new Error("Admin are not allwed to delete request. Pls use the Reject function instead.");
    }

    //Only allowed to delete if status is 'Pending'
    if (request.status.StatusName !== 'Pending') {
        throw new Error("Cannot delete a request that has already been processed.");
    }

    //Manager can only within 2 day
    const now = new Date();
    const createAt = new Date(request.CreateAt);
    const diffInHours = (now - createAt) / (1000 * 60 * 60);
    if (diffInHours > 48) {
        throw new Error("The 2 day deletion window has expired. Pls contact an Admin to Reject this Request");
    }

    return await AppDataSource.transaction(async (transactionEM) => {
        //Collect all image paths to delete later
        const filesToDelete = request.details
            .map(d => d.WastagePicture)
            .filter(path => path !== null);

        //Delete Details First
        await transactionEM.delete(WastageDetailEntity, { WastageID: wastageId });

        //Delete the main request
        await transactionEM.delete(wastageRequestEntity, { WastageID: wastageId });

        //Write Log Deletion
        const log = transactionEM.create(ActivityLogEntity, {
            LogID: uuidv7(),
            UserID: userId,
            Action: `Delete Wastage Request #${wastageId.substring(0, 8)}`,
            TargetTable: "WastageRequests",
            TargetID: wastageId,
            TargetName: "Delete Wastage"
        });

        await transactionEM.save(ActivityLogEntity, log);

        //Cleanup: Delete physical files from server
        filesToDelete.forEach(filePath => {
            try {
                const fullPath = path.join(process.cwd(), 'public', filePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            } catch (err) {
                console.error("DEBUG - Image deletion error during cleanup:", err);
            }
        });

        return { success: true, message: "Request and associated images deleted successfully!" };
    });
};

//==========SERVICE TO PROCESS WASTAGE REQUEST==========
export const processWastageRequest = async (wastageId, approverId, action, reason = null) => {
    return await AppDataSource.transaction(async (transactionEM) => {
        const request = await transactionEM.findOne(wastageRequestEntity, {
            where: { WastageID: wastageId },
            relations: ["details", "status"]
        });

        if (!request) {
            throw new Error("Request not found");
        }

        if (request.status.StatusName != 'Pending') {
            throw new Error("Already Processed");
        }

        const targetStatus = await getStatusByName(action);

        if (action === "Approved") {
            for (const detail of request.details) {
                const inv = await transactionEM.findOne(InventoryEntity, { where: { ItemID: detail.ItemID } });
                if (inv) {
                    //Direct deduction for wastage
                    inv.StockQuantity = Number(inv.StockQuantity) - Number(detail.Quantity);
                    inv.LastUpdatedAt = new Date();
                    await transactionEM.save(InventoryEntity, inv);
                }
            }
        }

        //Update main request info
        await transactionEM.update(wastageRequestEntity, wastageId, {
            StatusID: targetStatus.StatusID,
            ApproverID: approverId,
            ApprovalDate: new Date(),
            Reason: action === "Rejected" ? reason : null
        });

        //Write Log
        const log = transactionEM.create(ActivityLogEntity, {
            LogID: uuidv7(),
            UserID: approverId,
            Action: `${action} Wastage Request #${wastageId.substring(0, 8)}`,
            TargetTable: "WastageRequests",
            TargetID: wastageId,
            TargetName: "Process Wastage"
        });
        await transactionEM.save(ActivityLogEntity, log);

        return { success: true };
    });
}