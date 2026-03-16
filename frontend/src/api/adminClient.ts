import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminTokenManager = {
  getAccessToken: () => localStorage.getItem('adminToken'),
  getRefreshToken: () => localStorage.getItem('adminRefreshToken'),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('adminToken', accessToken);
    localStorage.setItem('adminRefreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
  },
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  },
};

adminApiClient.interceptors.request.use(
  (config) => {
    const token = adminTokenManager.getAccessToken();
    if (token && !adminTokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = adminTokenManager.getRefreshToken();
      if (refreshToken && !adminTokenManager.isTokenExpired(refreshToken)) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          adminTokenManager.setTokens(access, refreshToken);

          original.headers.Authorization = `Bearer ${access}`;
          return adminApiClient(original);
        } catch (refreshError) {
          adminTokenManager.clearTokens();
          window.location.href = '/admin/login';
        }
      } else {
        adminTokenManager.clearTokens();
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default adminApiClient;
