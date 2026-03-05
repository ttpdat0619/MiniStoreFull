import { AppDataSource } from "../config/db.config.js";
import { InventoryEntity } from "../entities/inventory.entity.js";

const InventoryRepo = AppDataSource.getRepository(InventoryEntity);

//Take all inventory
export const getAllInventory = async (branchId) => {
    // SECURITY: If no branchId is provided, we return empty list to prevent data leakage 
    // (Unless we explicitly want Admin to see all, but usually we filter by selected branch)
    if (!branchId) {
        return [];
    }

    return await InventoryRepo.find({
        where: { BranchID: branchId },
        relations: ["item", "item.unit", "branch"]
    });
};

//take list Item Low Stock
export const getLowStock = async (branchId) => {
    if (!branchId) {
        return [];
    }

    let query = InventoryRepo.createQueryBuilder("inv")
        .leftJoinAndSelect("inv.item", "item")
        .leftJoinAndSelect("inv.branch", "branch")
        .leftJoinAndSelect("item.unit", "unit")
        .where("inv.StockQuantity <= inv.MinQuantity")
        .andWhere("inv.BranchID = :branchId", { branchId });

    return await query.getMany();
};