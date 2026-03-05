import axiosClient from "./axiosClient";

const branchApi = {
    getAll: () => {
        return axiosClient.get('/branch');
    },
    getById: (id) => {
        return axiosClient.get(`/branch/${id}`);
    }
};

export default branchApi;
