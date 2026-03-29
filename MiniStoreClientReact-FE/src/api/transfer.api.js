import axiosClient from "./axiosClient";

const transferApi = {
    getAll: () => {
        return axiosClient.get("/internal-transfers/RequestTransfer");
    },
    getById: (transferId) => {
        return axiosClient.get(`/internal-transfers/${transferId}`);
    },
    create: (data) => {
        return axiosClient.post("/internal-transfers/CreateRequestTransfer", data);
    },
    respond: (transferId, action, note) => {
        return axiosClient.put(`/internal-transfers/${transferId}/respond`, { action, note });
    },
    approve: (transferId, action, note) => {
        return axiosClient.put(`/internal-transfers/${transferId}/approve`, { action, note });
    },
    edit: (transferId, data) => {
        return axiosClient.put(`/internal-transfers/${transferId}/edit`, data);
    }
};

export default transferApi;
