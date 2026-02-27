import axiosClient from "./axiosClient";

const inventoryApi = {

    //Get All Item in inventory
    getAll: () => {
        return axiosClient.get('/inventory');
    },

    //Get Low Stock Item in Inventory
    getLowStock: () => {
        return axiosClient.get('/inventory/low-stock');
    }
};

export default inventoryApi;