import axiosClient from "./axiosClient";

const inventoryApi = {

    //Get All Item in inventory
    getAll: (branchId) => {
        const url = branchId ? `/inventory?branchId=${branchId}` : '/inventory';
        return axiosClient.get(url);
    },

    //Get Low Stock Item in Inventory
    getLowStock: (branchId) => {
        const url = branchId ? `/inventory/low-stock?branchId=${branchId}` : '/inventory/low-stock';
        return axiosClient.get(url);
    }
};

export default inventoryApi;