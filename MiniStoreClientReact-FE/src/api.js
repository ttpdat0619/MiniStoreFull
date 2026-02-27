import axios from 'axios';

const api = axios.create({
  baseURL: 'https://aryan-hypaesthesic-answerably.ngrok-free.dev/api',
  headers: {
    'ngrok-skip-browser-warning': 'true', // Bắt buộc để chạy qua Ngrok
    'Content-Type': 'application/json'
  }
});

export default api;