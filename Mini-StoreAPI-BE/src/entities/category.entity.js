import { EntitySchema } from "typeorm";

export const CategoryEntity = new EntitySchema({
    name: "Category",
    tableName: "Categories",
    columns: {
        CategoryID: {
            primary: true,
            type: "varchar",
            length: 200
        },
        CategoryName: {
            type: "varchar",
            length: 200
        }
    }
});
