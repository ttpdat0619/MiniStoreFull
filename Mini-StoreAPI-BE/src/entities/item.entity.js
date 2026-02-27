import { EntitySchema } from "typeorm";

export const ItemEntity = new EntitySchema({
    name: "Item",
    tableName: "Items",
    columns: {
        ItemID: {
            primary: true,
            type: "varchar",
            length: 200
        },

        ItemName: {
            type: "varchar",
            length: 200
        },

        UnitID: {
            type: "varchar",
            length: 200
        },
        Quantity: {
            type: "decimal",
            precision: 18,
            scale: 2,
            default: 0
        },

        Description: {
            type: "varchar",
            length: 200
        }
    },

    relations: {
        unit: {
            target: "Unit",
            type: "many-to-one",
            joinColumn: { name: "UnitID" },
            eager: true
        }
    }
});