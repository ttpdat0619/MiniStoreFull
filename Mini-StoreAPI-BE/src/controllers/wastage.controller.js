import * as wastageService from "../services/wastage.service";
import fs from "fs";

//==========CONTROLLER TO CREATE WASTAGE==========
export const createWastage = async (req, res) => {
    const files = req.files || [];
    try {
        //Item come as stringified JSON in MultipartFormData
        const items = JSON.parse(req.body.items);
        const userId = req.user.UserID;

        //Map pictures to each item object correctly
        let fileIndex = 0;
        const itemsWithPics = items.map((item) => {
            let picturePath = null;
            if (item.hasPhoto && files[fileIndex]) {
                picturePath = `/uploads/wastage/${files[fileIndex].filename}`;
                fileIndex++;
            }
            return {
                ...item,
                WastagePicture: picturePath
            };
        });

        const result = await wastageService.createWastageRequest(userId, itemsWithPics);
        res.status(201).json(result);
    } catch (error) {
        // CLEANUP: Delete uploaded files if DB request fails
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

        console.error("DEBUG - CREATE WASTAGE FAILED:", error);
        res.status(500).json({ message: error.message });
    }
};

//==========CONTROLLER TO GET ALL WASTAGE==========
export const getAllWastage = async (req, res) => {
    try {
        const userId = req.user.UserID;
        const roleName = req.user.RoleName;

        const data = await wastageService.getAllWastageRequests(userId, roleName);
        res.status(200).json({ data });
    } catch (error) {
        console.error("DEBUG - GET ALL WASTAGE FAILED:", error);
        res.status(500).json({ message: error.message });
    }
};

//==========CONTROLLER TO GET WASTAGE REQUEST DETAIL==========
export const getWastageDetail = async (req, res) => {
    try {
        const { wastageId } = req.params;
        const data = await wastageService.getWastageDetail(wastageId);

        if (!data) {
            return res.status(404).json({ message: "Wastage Request Not Found!" });
        }

        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ message: "Detail Error: " + error.message });
    }
};

//==========CONTROLLER TO UPDATE WASTAGE REQUEST==========
export const updateWastage = async (req, res) => {
    const files = req.files || [];
    try {
        const { wastageId } = req.params;
        const items = JSON.parse(req.body.items);
        const userId = req.user.UserID;
        const userRole = req.user.RoleName;

        //Map pictures:
        //If has new photo is true, take the next uploaded file.
        //Otherwise, use the exsting path provided by the client.
        let newFileIndex = 0;
        const itemWithPics = items.map((item) => {
            let finalPicturePath = item.WastagePicture;

            if (item.hasNewPhoto && files[newFileIndex]) {
                finalPicturePath = `/uploads/wastage/${files[newFileIndex].filename}`;
                newFileIndex++;
            }

            return { ...item, WastagePicture: finalPicturePath };
        });

        const result = await wastageService.updateWastageRequest(wastageId, userId, userRole, itemWithPics);

        res.status(200).json(result);
    } catch (error) {
        //RollBack: Delete newly uploaded files if the process fails
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });
        console.error("CONTROLLER ERROR:", error.message);
        res.status(500).json({ message: error.message });
    }
};

//==========CONTROLLER TO DELETE WASTAGE REQUEST==========
export const deleteWastage = async (req, res) => {
    try {
        const { wastageId } = req.params;
        const userId = req.user.UserID;
        const userRole = req.user.RoleName;

        const result = await wastageService.deleteWastageRequest(wastageId, userId, userRole);
        res.status(200).json(result);
    } catch (error) {
        console.error("CONTROLLER ERROR (Delete):", error.message);
        res.status(500).json({ message: error.message });
    }
};

//==========CONTROLLER TO PROCESS==========
export const processWastage = async (req, res) => {
    try {
        const { wastageId } = req.params;
        const { action, reason } = req.body;
        const appoverId = req.user.UserID;

        const result = await wastageService.processWastageRequest(wastageId, appoverId, action, reason);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Process Error: " + error.message });
    }
};