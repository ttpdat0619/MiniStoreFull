import { FormulaEntity } from "../entities/formula.entity";
import { writeActivityLog } from "../helpers/activityLog.helper";
import { v7 as uuidv7 } from "uuid";
import { AppDataSource } from "../config/db.config";

const formulaRepo = AppDataSource.getRepository(FormulaEntity);

//========== Service Take list of Formula==========
export const getFormulaByFoodId = async (foodId) => {
    return await formulaRepo.find({
        where: { FoodID: foodId },
        relations: ["item"]
    });
};

//==========SERVICE TO CREATE NEW FORMULA==========
export const createFormula = async (foodId, items, userId) => {
    return await AppDataSource.transaction(async (transactionEM) => {
        const formulas = items.map(item => ({
            FormulaID: uuidv7(),
            FoodID: foodId,
            ItemID: item.ItemID,
            QuantityUsed: item.QuantityUsed
        }));
        const result = await transactionEM.save(FormulaEntity, formulas);

        //Write Log 
        await writeActivityLog(
            transactionEM,
            userId,
            `Create new formula for FoodId: ${foodId}`,
            "Formulas",
            foodId,
            "Formula Create"
        );

        return result;
    });
};

//==========SERVICE TO UPDATE FORMULA==========
export const updateFormula = async (foodId, newItems, userId) => {
    return await AppDataSource.transaction(async (transactionEM) => {
        const existFormulas = await transactionEM.find(FormulaEntity, {
            where: { FoodID: foodId }
        });

        const toDelete = existFormulas.filter(ex => !newItems.some(ni => ni.ItemID === ex.ItemID));

        const toUpdate = newItems.filter(ni => existFormulas.some(ex => ex.ItemID === ni.ItemID));

        const toAdd = newItems.filter(ni => !existFormulas.some(ex => ex.ItemID === ni.ItemID));

        if (toDelete.length > 0) {
            await transactionEM.remove(FormulaEntity, toDelete);
        }

        for (const item of toUpdate) {
            const existing = existFormulas.find(ex => ex.ItemID === item.ItemID);
            existing.QuantityUsed = item.QuantityUsed;
            await transactionEM.save(FormulaEntity, existing);
        }

        if (toAdd.length > 0) {
            const newEntries = toAdd.map(ni => ({
                FormulaID: uuidv7(),
                FoodID: foodId,
                ItemID: ni.ItemID,
                QuantityUsed: ni.QuantityUsed
            }));
            await transactionEM.save(FormulaEntity, newEntries);
        }

        await writeActivityLog(
            transactionEM,
            userId,
            `Update formula for FoodID: ${foodId}. Sync items.`,
            "Formulas",
            foodId,
            "Formula Update"
        );

        return await transactionEM.find(FormulaEntity, {
            where: { FoodID: foodId },
            relations: ["item"]
        });
    });
};