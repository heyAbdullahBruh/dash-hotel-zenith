import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add request timestamp
    config.headers["X-Request-Timestamp"] = Date.now();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Redirect to login page
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      // Handle forbidden access
      console.error("Access forbidden");
    }

    // Extract server error message
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "An unexpected error occurred";

    // You can dispatch this to a notification context
    console.error("API Error:", errorMessage);

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      code: error.response?.data?.code,
    });
  }
);

export default axiosInstance;
