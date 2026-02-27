import * as purchaseRequestService from "../services/purchaseRequest.service";

//==========CONTROLLER TO CREATE PURCHASE IMPORT==========
export const createImport = async (req, res) => {
    try {
        const { items } = req.body;

        //Take UserID from Middle verifyToken
        const managerId = req.user.UserID;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Item List connot be empty" });
        }

        const data = await purchaseRequestService.createRequest(managerId, items);

        return res.status(201).json({
            message: "Purchase request create success!",
            data: data
        });

    } catch (error) {
        console.error("Create Purchase Request Error:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

//==========CONTROLLER TO GET PURCHASE DETAIL==========
export const getRequestDetail = async (req, res) => {
    try {
        const { requestId } = req.params;
        const data = await purchaseRequestService.getRequestById(requestId);

        if (!data) {
            return res.status(404).json({ message: "Purchase Request Not Found!" });
        }

        return res.status(200).json({
            message: "Get purchase request Detail Success!",
            data: data
        });
    } catch (error) {
        console.error("Get Request Detail Error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

//==========CONTROLLER TO UPDATE PURCHASE REQUEST==========
export const updateRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { items } = req.body;

        //Take User infor from Middleware verifyToken
        const userId = req.user.UserID;
        const userRole = req.user.RoleName;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Item List cannot be empty " });
        }

        const result = await purchaseRequestService.updateRequest(requestId, userId, userRole, items);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Update Purchase Request Error:", error);
        //Return status 403(Forbiden) if Violation of the 3-day rule, or 500 if there is a system error.
        const statusCode = error.message.includes("cannot Edit") ? 403 : 500;
        return res.status(statusCode).json({ message: error.message || "Internal Server Error" });
    }
};

//==========CONTROLLER TO DELETE REQUEST==========
export const deleteRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.UserID;
        const userRole = req.user.RoleName;

        const result = await purchaseRequestService.deleteRequest(requestId, userId, userRole);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Delete Purchase Request Error:", error);

        //Return 403 if violating deletion rules
        return res.status(403).json({ message: error.message || "Internal Server Error" });
    }
};

//==========CONTROLLER TO GET ALL PURCHASE REQUEST==========
export const getAllRequestInput = async (req, res) => {
    try {
        //Take UserID and RoleName form Middleware
        const userId = req.user.UserID;
        const userRole = req.user.RoleName;

        const data = await purchaseRequestService.getAllRequests(userId, userRole);
        return res.status(200).json({
            message: "Get all purchase request success!",
            data: data
        });
    } catch (error) {
        console.error("Get all Purchase Request Error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

//==========CONTROLLER TO HANDLE REQUEST==========
export const processRequestInpurt = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, reason } = req.body;
        const appoverId = req.user.UserID;

        if (!action || !["Approved", "Rejected"].includes(action)) {
            return res.status(400).json({ message: "Action must be 'Approved' or 'Rejected'" });
        }

        const result = await purchaseRequestService.processRequest(requestId, appoverId, action, reason);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Process Purchase Request Error:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};