import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config/api";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------- INTERCEPTOR STATE ----------
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

// ---------- REQUEST INTERCEPTOR ----------
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- RESPONSE INTERCEPTOR ----------
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // List of public endpoints that should NOT trigger token refresh
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/verify',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/resend-code'
    ];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // Only try to refresh token if:
    // 1. Response is 401
    // 2. Haven't already retried
    // 3. NOT a public endpoint (login, register, etc.)
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue các request chờ access token mới
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        // refresh token
        const { data } = await axiosInstance.post("/auth/refresh", {});

        const newAccess = data.data.access_token;

        localStorage.setItem("accessToken", newAccess);

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccess}`;

        processQueue(null, newAccess);

        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
