import { EntitySchema } from "typeorm";

export const ImportStatusEntity = new EntitySchema({
    name: "ImportStatus",
    tableName: "ImportStatus",
    columns: {
        StatusID: {
            primary: true,
            type: "varchar",
            length: 200
        },

        StatusName: {
            type: "varchar",
            length: 200
        }
    }
});