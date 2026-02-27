import { EntitySchema } from "typeorm";

export const PurchaseDetailEntity = new EntitySchema({
    name: "PurchaseDetail",
    tableName: "PurchaseDetails",
    columns: {
        DetailID: {
            primary: true,
            type: "varchar",
            length: 200
        },

        RequestID: {
            type: "varchar",
            length: 200
        },

        ItemID: {
            type: "varchar",
            length: 200
        },

        Quantity: {
            type: "decimal",
            precision: 18,
            scale: 2
        }
    },

    relations: {
        request: {
            target: "PurchaseRequest",
            type: "many-to-one",
            joinColumn: { name: "RequestID" }
        },

        item: {
            target: "Item",
            type: "many-to-one",
            joinColumn: { name: "ItemID" }
        }
    }
})