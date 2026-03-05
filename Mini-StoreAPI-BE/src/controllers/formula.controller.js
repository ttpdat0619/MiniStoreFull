import * as formulaService from "../services/formula.service";

//==========CONTROLLER TO GET FORMULA IN THAT FOOD
export const getFormulaByFoodId = async (req, res) => {
    try {
        const { foodId } = req.params;
        const formula = await formulaService.getFormulaByFoodId(foodId);
        res.status(200).json(formula);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//==========CONTROLLER TO CREATE FORMULA==========
export const createFormula = async (req, res) => {
    try {
        const { FoodID, items } = req.body;
        const userId = req.user.UserID;

        const result = await formulaService.createFormula(FoodID, items, userId);

        res.status(201).json({
            message: "Created formula Successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//==========CONTROLLER TO UPDATE FOR FOOD HAVE FORMULA==========
export const updateFormula = async (req, res) => {
    try {
        const { foodId } = req.params;
        const { items } = req.body;
        const userId = req.user.UserID;

        const result = await formulaService.updateFormula(foodId, items, userId);

        res.status(200).json({
            message: "Update formula success",
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};