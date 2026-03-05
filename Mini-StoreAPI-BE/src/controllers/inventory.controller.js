import * as inventoryService from "../services/inventory.service.js";

export const getAll = async (req, res) => {
    try {
        // Admins can specify branchId in query, Managers/Staff use their own BranchID
        const branchId = req.user.RoleName === 'Admin' ? req.query.branchId : req.user.BranchID;

        const data = await inventoryService.getAllInventory(branchId);
        return res.status(200).json({
            message: "Get inventory list successfully",
            data: data
        });
    } catch (error) {
        console.error("Get Inventory Error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getLowStock = async (req, res) => {
    try {
        const branchId = req.user.RoleName === 'Admin' ? req.query.branchId : req.user.BranchID;

        const data = await inventoryService.getLowStock(branchId);
        return res.status(200).json({
            message: "Get Low Stock Items Success!",
            data: data
        });
    } catch (error) {
        console.error("Get Low Stock Error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};