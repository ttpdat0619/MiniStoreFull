import { EntitySchema } from "typeorm";

export const UserEntity = new EntitySchema({
    name: "User",
    tableName: "Users",
    columns: {
        UserID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        Username: {
            type: "varchar",
            length: 50
        },
        PhoneNumber: {
            type: "varchar",
            length: 20,
            nullable: true
        },
        PasswordHash: {
            type: "varchar",
            length: 555
        },
        RoleID: {
            type: "varchar",
            length: 200
        },
        IsActive: {
            type: "int", // Using int or boolean depending on bit(1) mapping. detailed explanation below
            width: 1,
            default: 1,
            transformer: {
                from: (val) => {
                    if (Buffer.isBuffer(val)) {
                        return val[0] === 1;
                    }
                    return val === 1 || val === true;

                }, // Handle bit type return
                to: (val) => (val ? 1 : 0)
            }
        },
        CreateAt: {
            type: "datetime",
            createDate: true
        }
    },
    relations: {
        role: {
            target: "Role",
            type: "many-to-one",
            joinColumn: { name: "RoleID" },
            eager: true // Auto load role when fetching user
        }
    }
});
