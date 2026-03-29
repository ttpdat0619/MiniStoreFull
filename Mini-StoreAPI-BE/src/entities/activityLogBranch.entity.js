import { EntitySchema } from "typeorm";

export const ActivityLogBranchEntity = new EntitySchema({
    name: "ActivityLogBranch",
    tableName: "ActivityLog_Branches",
    columns: {
        LogID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        BranchID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        RoleInAction: {
            type: "varchar",
            length: 100
        }
    },
    relations: {
        log: {
            target: "ActivityLog",
            type: "many-to-one",
            joinColumn: { name: "LogID" }
        },
        branch: {
            target: "Branch",
            type: "many-to-one",
            joinColumn: { name: "BranchID" }
        }
    }
});
