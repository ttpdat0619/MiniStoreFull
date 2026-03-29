import axiosClient from "./axiosClient";

const activityLogApi = {
    getAllLogs: () => {
        return axiosClient.get('/activity-logs');
    }
};

export default activityLogApi;
