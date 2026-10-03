import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './auth';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000') as string;

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const res = await http.post('/auth/refresh');
  const token = res.data?.accessToken as string;
  if (!token) throw new Error('No access token returned');
  setAccessToken(token);
  return token;
}

import { notify } from '../context/NotificationContext';

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status as number | undefined;
    const original = error?.config as any;

    // Extract error message
    const data = error?.response?.data;
    let message = data?.message || error?.message || 'An unexpected error occurred';

    // Handle array of error messages (e.g. from class-validator)
    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    // Don't show toast for 401 as we might be refreshing, but show for others
    if (status !== 401) {
      notify.showError(message);
    }

    if (status !== 401 || original?._retry) {
      throw error;
    }

    original._retry = true;

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      await refreshPromise;
      refreshPromise = null;
      return http(original);
    } catch (e) {
      refreshPromise = null;
      clearAccessToken();
      notify.showError('Session expired. Please login again.');
      throw e;
    }
  }
);
