import { v7 as uuidv7 } from "uuid";
import { ActivityLogEntity } from "../entities/activityLog.entity";
import { ActivityLogBranchEntity } from "../entities/activityLogBranch.entity";

/**
 * Helper to write an activity log entry within a transaction or using a standard manager.
 * @param {Object} entityManager - TypeORM EntityManager (transactional or global)
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Descriptive string of the action
 * @param {string} targetTable - Name of the table affected
 * @param {string} targetId - Primary key of the affected record
 * @param {string} targetName - Human-readable name/label of the target
 * @param {Array} [branches] - Optional array of { branchId, role } objects
 *   Example: [{ branchId: "xxx", role: "Source" }, { branchId: "yyy", role: "Destination" }]
 */
export const writeActivityLog = async (entityManager, userId, action, targetTable, targetId, targetName, branches = []) => {
    const logId = uuidv7();

    const log = entityManager.create(ActivityLogEntity, {
        LogID: logId,
        UserID: userId,
        Action: action,
        TargetTable: targetTable,
        TargetID: targetId,
        TargetName: targetName
    });
    await entityManager.save(ActivityLogEntity, log);

    // Write branch associations if provided
    if (branches.length > 0) {
        const branchEntries = branches.map(b => entityManager.create(ActivityLogBranchEntity, {
            LogID: logId,
            BranchID: b.branchId,
            RoleInAction: b.role
        }));
        await entityManager.save(ActivityLogBranchEntity, branchEntries);
    }

    return log;
};
