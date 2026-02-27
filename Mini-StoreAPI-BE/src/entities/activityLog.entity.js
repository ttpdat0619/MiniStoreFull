import { EntitySchema } from "typeorm";

export const ActivityLogEntity = new EntitySchema({
    name: "ActivityLog",
    tableName: "ActivityLogs",
    columns: {
        LogID: {
            primary: true,
            type: "varchar",
            length: 200
        },

        UserID: {
            type: "varchar",
            length: 200
        },

        Action: {
            type: "varchar",
            length: 500
        },

        TargetTable: {
            type: "varchar",
            length: 100
        },

        TargetID: {
            type: "varchar",
            length: 200
        },

        TargetName: {
            type: "varchar",
            length: 200
        },

        TimeStamp: {
            type: "datetime",
            createDate: true
        }
    },

    relations: {
        user: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "UserID" }
        }
    }
});