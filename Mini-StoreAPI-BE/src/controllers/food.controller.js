import * as foodService from "../services/food.service";

export const getAllFoodItems = async (req, res) => {
    try {
        const foodItems = await foodService.getAllFoodItems();
        res.status(200).json(foodItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFoodItemById = async (req, res) => {
    try {
        const { foodId } = req.params;
        const foodItem = await foodService.getFoodItemById(foodId);
        if (!foodItem) {
            return res.status(404).json({ message: "Food Item Not found!" });
        }
        res.status(200).json(foodItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}