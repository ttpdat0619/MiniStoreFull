import { EntitySchema } from "typeorm";

export const BranchEntity = new EntitySchema({
    name: "Branch",
    tableName: "Branches",
    columns: {
        BranchID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        BranchName: {
            type: "varchar",
            length: 200
        },
        Address: {
            type: "varchar",
            length: 555,
            nullable: true
        }
    }
});
