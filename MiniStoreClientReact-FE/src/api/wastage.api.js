import axiosClient from "./axiosClient";

const wastageApi = {
    // Get all wastage requests (with role-based filtering from BE)
    getAll: () => {
        return axiosClient.get("/wastage/List-Wastage-Request");
    },

    // Get detail of a specific wastage request
    getDetail: (wastageId) => {
        return axiosClient.get(`/wastage/Wastage-Detail/${wastageId}`);
    },

    // Create a new wastage request (FormData for Image Upload)
    createWastage: (formData) => {
        return axiosClient.post("/wastage/create-Request", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },

    // Process a wastage request (Approve/Reject)
    processWastage: (wastageId, payload) => {
        return axiosClient.post(`/wastage/Process/${wastageId}`, payload);
    },

    // Update wastage request (Multipart/FormData)
    updateWastage: (wastageId, formData) => {
        return axiosClient.put(`/wastage/Update-Request/${wastageId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    }
};

export default wastageApi;
