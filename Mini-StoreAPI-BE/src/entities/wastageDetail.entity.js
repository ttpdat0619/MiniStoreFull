import { EntitySchema } from "typeorm";

export const WastageDetailEntity = new EntitySchema({
    name: "WastageDetail",
    tableName: "WastageDetails",
    columns: {
        DetailID: {
            primary: true, type: "varchar", length: 200
        },

        WastageID: {
            type: "varchar", length: 200
        },

        ItemID: {
            type: "varchar", length: 200
        },

        Quantity: {
            type: "decimal", precision: 18, scale: 2
        },

        WastageReason: {
            type: "text"
        },

        WastagePicture: {
            type: "varchar", length: 555, nullable: true
        }
    },
    relations: {
        request: {
            target: "WastageRequest",
            type: "many-to-one",
            joinColumn: { name: "WastageID" },
            onDelete: "CASCADE"
        },

        item: {
            target: "Item",
            type: "many-to-one",
            joinColumn: { name: "ItemID" }
        }
    }
});