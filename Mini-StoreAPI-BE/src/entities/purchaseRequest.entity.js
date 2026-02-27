import { EntitySchema, JoinColumn } from "typeorm";

export const purchaseRequestEntity = new EntitySchema({
    name: "PurchaseRequest",
    tableName: "PurchaseRequests",
    columns: {
        RequestID: {
            primary: true,
            type: "varchar",
            length: 200
        },

        ManagerID: {
            type: "varchar",
            length: 200
        },

        ApproverID: {
            type: "varchar",
            length: 200
        },

        StatusID: {
            type: "varchar",
            length: 200
        },

        CreateAt: {
            type: "datetime",
            createDate: true
        },

        RejectionReason: {
            type: "text",
            nullable: true
        },
        ApprovalDate: {
            type: "datetime",
            createDate: true
        }
    },
    relations: {
        details: {
            target: "PurchaseDetail",
            type: "one-to-many",
            inverseSide: "request",
            cascade: true
        },

        manager: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "ManagerID" }
        },

        approver: {
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