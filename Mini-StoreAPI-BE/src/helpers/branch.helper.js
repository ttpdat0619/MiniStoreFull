import { BranchEntity } from "../entities/branch.entity";

/**
 * Helper to fetch one or multiple branch names and format labels for logging.
 * @param {Object} entityManager - TypeORM EntityManager
 * @param {string} fromId - Source Branch ID
 * @param {string} toId - Target Branch ID
 * @returns {Object} { fromName, toName, label }
 */
export const getBranchTransferLabel = async (entityManager, fromId, toId) => {
    const [from, to] = await Promise.all([
        entityManager.findOne(BranchEntity, { where: { BranchID: fromId } }),
        entityManager.findOne(BranchEntity, { where: { BranchID: toId } })
    ]);

    const fromName = from?.BranchName || `Branch(${fromId.substring(0, 5)})`;
    const toName = to?.BranchName || `Branch(${toId.substring(0, 5)})`;

    return {
        fromName,
        toName,
        label: `${fromName} -> ${toName}`
    };
};
