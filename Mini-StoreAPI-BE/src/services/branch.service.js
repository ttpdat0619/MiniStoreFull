import { AppDataSource } from "../config/db.config.js";
import { BranchEntity } from "../entities/branch.entity.js";

const branchRepo = AppDataSource.getRepository(BranchEntity);

export const getAllBranches = async () => {
    return await branchRepo.find();
};

export const getBranchById = async (branchId) => {
    return await branchRepo.findOne({ where: { BranchID: branchId } });
};
