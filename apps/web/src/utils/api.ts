import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach the JWT token to every outgoing request.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handle 401 (Unauthorised) and 403 (Forbidden) globally.
// On 401 we clear credentials and redirect to login so users are never left
// staring at broken/empty pages when their JWT has expired.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stale credentials
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Reload to the login screen (App.tsx renders Login when user === null)
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
