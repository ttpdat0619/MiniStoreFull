import { EntitySchema } from "typeorm";

export const InternalTransferEntity = new EntitySchema({
    name: "InternalTransfer",
    tableName: "InternalTransfers",
    columns: {
        TransferID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        FromBranchID: {
            type: "varchar",
            length: 200
        },
        ToBranchID: {
            type: "varchar",
            length: 200
        },
        SenderID: {
            type: "varchar",
            length: 200
        },
        ReceiverID: { // Giữ nguyên chính tả 'RecceiverID' từ SQL của bạn
            type: "varchar",
            length: 200,
            nullable: true
        },
        ApproverID: {
            type: "varchar",
            length: 200,
            nullable: true
        },
        ReceivingStatus: {
            type: "varchar",
            length: 200
        },
        ApproveStatus: {
            type: "varchar",
            length: 200
        },
        SentDate: {
            type: "datetime",
            createDate: true
        },
        ReceivedDate: {
            type: "datetime",
            nullable: true
        },
        ApprovedDate: {
            type: "datetime",
            nullable: true
        },
        SendNote: {
            type: "text",
            nullable: true
        },
        ReceivedNote: {
            type: "text",
            nullable: true
        },
        AdminNote: {
            type: "text",
            nullable: true
        }
    },
    relations: {
        fromBranch: {
            target: "Branch",
            type: "many-to-one",
            joinColumn: { name: "FromBranchID" }
        },
        toBranch: {
            target: "Branch",
            type: "many-to-one",
            joinColumn: { name: "ToBranchID" }
        },
        sender: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "SenderID" }
        },
        receiver: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "ReceiverID" }
        },
        approver: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "ApproverID" }
        },
        receiveStatus: {
            target: "ImportStatus",
            type: "many-to-one",
            joinColumn: { name: "ReceivingStatus" }
        },
        approvalStatus: {
            target: "ImportStatus",
            type: "many-to-one",
            joinColumn: { name: "ApproveStatus" }
        },
        details: {
            target: "TransferDetail",
            type: "one-to-many",
            inverseSide: "transfer",
            cascade: true
        }
    }
});
