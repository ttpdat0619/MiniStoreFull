import { AppDataSource } from "../config/db.config.js";
import { InventoryEntity } from "../entities/inventory.entity.js";

const InventoryRepo = AppDataSource.getRepository(InventoryEntity);

//Take all inventory
export const getAllInventory = async () => {
    return await InventoryRepo.find({
        relations: ["item", "item.unit"] //Take more Info Item and Unit
    });
};

//take list Item Low Stock
export const getLowStock = async () => {
    //Query Builder
    return await InventoryRepo.createQueryBuilder("inv")
        .leftJoinAndSelect("inv.item", "item")
        .leftJoinAndSelect("item.unit", "unit")
        .where("inv.StockQuantity <= inv.MinQuantity")
        .getMany();
};