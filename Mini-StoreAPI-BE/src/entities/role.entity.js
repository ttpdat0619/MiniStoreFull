import { EntitySchema } from "typeorm";

export const RoleEntity = new EntitySchema({
    name: "Role",
    tableName: "Roles",
    columns: {
        RoleID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        RoleName: {
            type: "varchar",
            length: 100
        },
        Description: {
            type: "varchar",
            length: 255,
            nullable: true
        }
    }
});
