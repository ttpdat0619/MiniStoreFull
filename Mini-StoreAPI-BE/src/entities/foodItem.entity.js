import { EntitySchema } from "typeorm";

export const FoodItemEntity = new EntitySchema({
    name: "FoodItem",
    tableName: "FoodItems",
    columns: {
        FoodID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        FoodName: {
            type: "varchar",
            length: 200
        },
        CategoryID: {
            type: "varchar",
            length: 200
        },
        BasePrice: {
            type: "decimal",
            precision: 18,
            scale: 2
        },
        IsAvilable: {
            type: "bit",
            default: 1
        },
        ImageURL: {
            type: "varchar",
            length: 555,
            nullable: true
        }
    },
    relations: {
        category: {
            target: "Category",
            type: "many-to-one",
            joinColumn: { name: "CategoryID" }
        }
    }
});
