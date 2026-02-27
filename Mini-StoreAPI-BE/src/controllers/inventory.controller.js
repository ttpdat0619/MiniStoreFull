import * as inventoryService from "../services/inventory.service.js";

export const getAll = async (req, res) => {
    try {
        const data = await inventoryService.getAllInventory();
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
        const data = await inventoryService.getLowStock();
        return res.status(200).json({
            message: "Get Low Stock Items Success!",
            data: data
        });
    } catch (error) {
        console.error("Get Low Stock Error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};