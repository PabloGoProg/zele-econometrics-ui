import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const isAuthRoute = error.config?.url?.startsWith('/auth/');
      if (!isAuthRoute) {
        window.location.href = '/login';
      }
    }

    if (!error.response?.data?.detail && status) {
      error.response.data = {
        ...error.response.data,
        detail: getErrorMessage(status),
      };
    }

    return Promise.reject(error);
  },
);
