import { EntitySchema } from "typeorm";

export const TransferDetailEntity = new EntitySchema({
    name: "TransferDetail",
    tableName: "TransferDetails",
    columns: {
        DetailID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        TransferID: {
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
        transfer: {
            target: "InternalTransfer",
            type: "many-to-one",
            joinColumn: { name: "TransferID" },
            onDelete: "CASCADE"
        },
        item: {
            target: "Item",
            type: "many-to-one",
            joinColumn: { name: "ItemID" }
        }
    }
});
