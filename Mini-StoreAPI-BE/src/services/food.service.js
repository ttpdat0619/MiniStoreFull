import { AppDataSource } from "../config/db.config";
import { FoodItemEntity } from "../entities/foodItem.entity";

const foodRepo = AppDataSource.getRepository(FoodItemEntity);

export const getAllFoodItems = async () => {
    return await foodRepo.find({
        relations: ["category"]
    });
};

export const getFoodItemById = async (foodId) => {
    return await foodRepo.findOne({
        where: { FoodID: foodId },
        relations: ["category"]
    });
};