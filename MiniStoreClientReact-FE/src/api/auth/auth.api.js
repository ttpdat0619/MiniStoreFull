import axiosClient from "../axiosClient"

const authApi = {
    //Method POST for login
    login: (username, password) => {
        return axiosClient.post('/auth/login', {username, password});
    },
};

export default authApi;