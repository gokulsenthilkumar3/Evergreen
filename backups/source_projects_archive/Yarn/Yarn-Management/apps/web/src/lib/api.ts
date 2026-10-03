import { http } from './http';

// Simple API wrapper using the existing http client
const api = {
    get: (url: string, config?: any) => http.get(url, config),
    post: (url: string, data?: any, config?: any) => http.post(url, data, config),
    put: (url: string, data?: any, config?: any) => http.put(url, data, config),
    patch: (url: string, data?: any, config?: any) => http.patch(url, data, config),
    delete: (url: string, config?: any) => http.delete(url, config),
};

export const apiClient = api;
export default api;
