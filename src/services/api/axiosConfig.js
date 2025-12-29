// In your axiosConfig.js or similar
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth headers if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - important for auth
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log 401 errors to console as they're expected
    if (error.response && error.response.status === 401) {
      // Silent fail for profile endpoint
      if (error.config.url.includes("/api/admin/profile")) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;