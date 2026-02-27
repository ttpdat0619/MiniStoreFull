import { EntitySchema } from "typeorm";

export const wastageRequestEntity = new EntitySchema({
    name: "WastageRequest",
    tableName: "WastageRequests",
    columns: {
        WastageID: {
            primary: true, type: "varchar", length: 200
        },

        RequesterID: {
            type: "varchar", length: 200
        },

        ApproverID: {
            type: "varchar", length: 200, nullable: true
        },

        StatusID: {
            type: "varchar", length: 200
        },

        CreateAt: {
            type: "datetime", createDate: true
        },

        ApprovalDate: {
            type: "datetime", nullable: true
        },

        Reason: {
            type: "text", nullable: true
        }
    },
    relations: {
        details: {
            target: "WastageDetail",
            type: "one-to-many",
            inverseSide: "request",
            cascade: true
        },

        manager: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "RequesterID" }
        },

        approval: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "ApproverID" }
        },

        status: {
            target: "ImportStatus",
            type: "many-to-one",
            joinColumn: { name: "StatusID" },
            eager: true
        }
    }
});