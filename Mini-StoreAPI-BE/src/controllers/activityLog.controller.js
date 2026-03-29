import * as logService from "../services/activityLog.service.js";

export const getActivityLogs = async (req, res) => {
    try {
        const user = req.user; // from verifyToken middleware
        const logs = await logService.getActivityLogs(user);

        // Format the output to be cleaner for the frontend
        const formattedLogs = logs.map(log => ({
            LogID: log.LogID,
            Timestamp: log.TimeStamp,
            User: log.user ? { UserID: log.user.UserID, Username: log.user.Username, FullName: log.user.FullName } : null,
            ActionType: log.Action,
            ReferenceEntityName: log.TargetTable,
            ReferenceEntityID: log.TargetID,
            Description: log.TargetName,
            RelatedBranches: log.branches ? log.branches.map(b => ({
                BranchID: b.BranchID,
                BranchName: b.branch?.BranchName,
                RoleInAction: b.RoleInAction
            })) : []
        }));

        res.status(200).json({ success: true, data: formattedLogs });
    } catch (error) {
        console.error("Error getting activity logs:", error);
        res.status(500).json({ success: false, message: error.message || "Something went wrong" });
    }
};
