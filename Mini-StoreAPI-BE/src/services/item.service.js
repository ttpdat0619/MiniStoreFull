import { AppDataSource } from "../config/db.config";
import { ItemEntity } from "../entities/item.entity";

const itemRepo = AppDataSource.getRepository(ItemEntity);

export const getAllItems = async () => {
    //Take all Item 
    return await itemRepo.find({
        relations: ["unit"],
        order: { ItemName: "ASC"}
    });
};