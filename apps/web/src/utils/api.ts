import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4001',
});

api.interceptors.request.use((config) => {
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {
        const parsedUser = JSON.parse(user);
        if (parsedUser.access_token) {
            config.headers.Authorization = `Bearer ${parsedUser.access_token}`;
        }
    }
    return config;
});

export default api;
