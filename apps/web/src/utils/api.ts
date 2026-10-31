import { getToken, clearAuth } from './authStorage';
import axios from 'axios';

let onMutation: (() => void) | undefined;
export const setMutationListener = (listener: () => void) => { onMutation = listener; };

const api = axios.create({
    // The web server and the desktop launcher both serve the app over HTTP with the API behind /api/backend.
    baseURL: import.meta.env.VITE_API_URL || '/api/backend',
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach the JWT token to every outgoing request.
api.interceptors.request.use((config) => {
    const token = getToken();
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
    (response) => {
        if (['post', 'put', 'patch', 'delete'].includes(response.config.method || '')) onMutation?.();
        return response;
    },
    (error) => {
        const isSignInAttempt = /\/auth\/(login|passkey\/auth-options|passkey\/auth-verify)$/.test(String(error.config?.url || ''));
        if (error.response?.status === 401 && !isSignInAttempt) {
            // Clear stale credentials
            clearAuth();
            // Reload to the login screen (App.tsx renders Login when user === null)
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
