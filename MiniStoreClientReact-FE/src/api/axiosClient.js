import axios from 'axios';

// TIP: Switch between LOCALHOST (for local dev) and NGROK (for public testing)
// const BASE_DOMAIN = 'http://localhost:8060';
const BASE_DOMAIN = 'https://aryan-hypaesthesic-answerably.ngrok-free.dev';

const axiosClient = axios.create({
    baseURL: `${BASE_DOMAIN}/api`,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
});

// Helper to get Domain for images - 100% Dynamic based on current API configuration
export const getDomain = () => {
    return axiosClient.defaults.baseURL.replace(/\/api$/, '');
};

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export default axiosClient;