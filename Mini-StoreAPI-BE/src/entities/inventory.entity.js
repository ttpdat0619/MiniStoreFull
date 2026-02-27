import { EntitySchema } from "typeorm";

export const InventoryEntity = new EntitySchema({
    name: "Inventory",
    tableName: "Inventories",
    columns: {
        InventoryID: {
            primary: true,
            type: "varchar",
            length: 200
        },

        ItemID: {
            type: "varchar",
            length: 200
        },

        StockQuantity: {
            type: "decimal",
            precision: 18,
            scale: 2,
            default: 0
        },

        MinQuantity: {
            type: "decimal",
            precision: 18,
            scale: 2,
            default: 0
        },

        LastUpdatedAt: {
            type: "datetime",
            updateDate: true
        }
    },
    relations: {
        item: {
            target: "Item",
            type: "one-to-one",
            joinColumn: { name: "ItemID" },
            eager: true
        }
    }
});