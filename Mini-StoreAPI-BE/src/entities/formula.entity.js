import { EntitySchema } from "typeorm";

export const FormulaEntity = new EntitySchema({
    name: "Formula",
    tableName: "Formulas",
    columns: {
        FormulaID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        FoodID: {
            type: "varchar",
            length: 200
        },
        ItemID: {
            type: "varchar",
            length: 200
        },
        QuantityUsed: {
            type: "decimal",
            precision: 18,
            scale: 2
        }
    },
    relations: {
        foodItem: {
            target: "FoodItem",
            type: "many-to-one",
            joinColumn: { name: "FoodID" }
        },
        item: {
            target: "Item",
            type: "many-to-one",
            joinColumn: { name: "ItemID" },
            eager: true
        }
    }
});
