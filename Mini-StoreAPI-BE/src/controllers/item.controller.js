import * as itemService from "../services/item.service";

export const getAll = async (req, res) => {
    try {
        const data = await itemService.getAllItems();
        return res.status(200).json({
            message: "Get Item list Succsesssfully",
            data: data
        });
    } catch (error) {
        console.error("Get Item List Error:", error);
        return res.status(500).json({ message: "Internal Server error " });
    }
};