import { AppDataSource } from "../config/db.config.js";
import { ActivityLogEntity } from "../entities/activityLog.entity.js";

//========== GET ALL ACTIVITY LOGS ==========
export const getActivityLogs = async (user) => {
    const logRepo = AppDataSource.getRepository(ActivityLogEntity);

    // Common query builder setup
    const queryBuilder = logRepo.createQueryBuilder("log")
        .leftJoinAndSelect("log.user", "user")
        .leftJoinAndSelect("log.branches", "branches")
        .leftJoinAndSelect("branches.branch", "branch")
        .orderBy("log.TimeStamp", "DESC");

    if (user.RoleName === 'Manager') {
        // Manager can only see logs associated with their branch
        // Filter where at least one branch entry matches their BranchID
        queryBuilder.where("branches.BranchID = :branchId", { branchId: user.BranchID });
        // NOTE: This will return the log and ONLY the matching branch relation due to the where clause.
        // If we want to return ALL branches involved in that log, it's better to use an exists subquery or inner join matching ID.
        // Let's use an IN subquery to get LogIDs they have access to, then fetch the full logs.

        const subQuery = logRepo.createQueryBuilder("sublog")
            .innerJoin("sublog.branches", "subbranches")
            .where("subbranches.BranchID = :branchId", { branchId: user.BranchID })
            .select("sublog.LogID");

        queryBuilder.where(`log.LogID IN (${subQuery.getQuery()})`)
            .setParameters(subQuery.getParameters());
    } else if (user.RoleName !== 'Admin') {
        // Fallback for other roles - perhaps they shouldn't see logs at all?
        throw new Error("Unauthorized to view activity logs.");
    }

    return await queryBuilder.getMany();
};
