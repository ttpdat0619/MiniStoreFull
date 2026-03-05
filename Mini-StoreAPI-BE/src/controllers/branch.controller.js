import * as branchService from "../services/branch.service.js";

export const getAllBranches = async (req, res) => {
    try {
        const branches = await branchService.getAllBranches();
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBranchById = async (req, res) => {
    try {
        const { branchId } = req.params;
        const branch = await branchService.getBranchById(branchId);
        if (!branch) return res.status(404).json({ message: "Branch not found" });
        res.status(200).json(branch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
