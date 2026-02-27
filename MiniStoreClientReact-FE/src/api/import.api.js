import axiosClient from "./axiosClient"

const importApi = {

    getAll: () => {
        return axiosClient.get("/purchase-request");
    },

    createPurchaseRequest: (data) => {
        return axiosClient.post("/purchase-request/Import", data);
    },

    processInport: (requestId, payload) => axiosClient.post(`/purchase-request/ProcessRequest/${requestId}`, payload),
    updatePurchaseRequest: (requestId, payload) => axiosClient.put(`/purchase-request/Purchase-Update/${requestId}`, payload),
    deletePurchaseRequest: (requestId) => axiosClient.delete(`/purchase-request/Purchase-Delete/${requestId}`),

    getDetail: (requestId) => {
        return axiosClient.get(`/purchase-request/Purchase-Detail/${requestId}`);
    }

};

export default importApi;