import { AppDataSource } from "../config/db.config";
import { ImportStatusEntity } from "../entities/importStatus.entity";

const statusRepo = AppDataSource.getRepository(ImportStatusEntity);

export const getStatusByName = async (name) => {
    //Find Status by name
    const status = await statusRepo.findOne({
        where: { StatusName: name }
    });

    if (!status) {
        throw new Error(`Status '${name}' not found in DB. Pls Check ImportStatus Table.`);
    }

    return status;
};