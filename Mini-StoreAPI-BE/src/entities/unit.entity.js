import { EntitySchema } from "typeorm";

export const UnitEnity = new EntitySchema({
    name: "Unit",
    tableName: "Units",
    columns: {
        UnitID: {
            primary: true,
            type: "varchar",
            length: 200
        },

        UnitName: {
            type: "varchar",
            length: 100
        }
    }
});