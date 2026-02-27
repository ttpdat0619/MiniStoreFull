import axiosClient from "./axiosClient"

const itemApi = {
    getAllItem: () => {
        return axiosClient.get('/item');
    }
};

export default itemApi;