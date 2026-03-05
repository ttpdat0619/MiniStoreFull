import { FormulaEntity } from "../entities/formula.entity";
import { ActivityLogEntity } from "../entities/activityLog.entity";
import { v7 as uuidv7 } from "uuid";
import { AppDataSource } from "../config/db.config";

const formulaRepo = AppDataSource.getRepository(FormulaEntity);
const logRepo = AppDataSource.getRepository(ActivityLogEntity);

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
        const logEntry = logRepo.create({
            LogID: uuidv7(),
            UserID: userId,
            Action: `Create new formula for FoodId: ${foodId}`,
            TargetTable: "Formulas",
            TargetID: foodId,
            TargetName: "Formula Create"
        });
        await transactionEM.save(ActivityLogEntity, logEntry);

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

        const logEntry = logRepo.create({
            LogID: uuidv7(),
            UserID: userId,
            Action: `Update formula for FoodID: ${foodId}. Sync items.`,
            TargetName: "Fomulas",
            TargetID: foodId,
            TargetName: "Formula Update"
        });
        await transactionEM.save(ActivityLogEntity, logEntry);

        return await transactionEM.find(FormulaEntity, {
            where: { FoodID: foodId },
            relations: ["item"]
        });
    });
};