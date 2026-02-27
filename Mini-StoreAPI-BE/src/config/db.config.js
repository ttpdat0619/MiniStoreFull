import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { UserEntity } from "../entities/user.entity.js";
import { RoleEntity } from "../entities/role.entity.js";
import { InventoryEntity } from "../entities/inventory.entity.js";
import { ItemEntity } from "../entities/item.entity.js";
import { UnitEnity } from "../entities/unit.entity.js";
import { ImportStatusEntity } from "../entities/importStatus.entity.js";
import { purchaseRequestEntity } from "../entities/purchaseRequest.entity.js";
import { PurchaseDetailEntity } from "../entities/purchaseDetail.entity.js";
import { ActivityLogEntity } from "../entities/activityLog.entity.js";
import { wastageRequestEntity } from "../entities/wastageRequest.entity.js";
import { WastageDetailEntity } from "../entities/wastageDetail.entity.js";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // Khớp với DB_PASSWORD trong .env của bạn
    database: process.env.DB_NAME,
    entities: [
        ActivityLogEntity,
        UserEntity,
        RoleEntity,
        InventoryEntity,
        ItemEntity,
        UnitEnity,
        ImportStatusEntity,
        purchaseRequestEntity,
        PurchaseDetailEntity,
        wastageRequestEntity,
        WastageDetailEntity
    ],
    synchronize: false,
})