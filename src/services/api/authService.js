import axios from "./axiosConfig";

export const authService = {
  login: async (credentials) => {
    const response = await axios.post("/api/admin/login", credentials);
    return response.data;
  },

  logout: async () => {
    try {
      await axios.post("/api/admin/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  getProfile: async () => {
    const response = await axios.get("/api/admin/profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await axios.put("/api/admin/profile", profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await axios.put(
      "/api/admin/change-password",
      passwordData
    );
    return response.data;
  },

  getAllAdmins: async () => {
    const response = await axios.get("/api/admin/admins");
    return response.data;
  },

  createAdmin: async (adminData) => {
    const response = await axios.post("/api/admin/admins/create", adminData);
    return response.data;
  },

  toggleAdminStatus: async (adminId) => {
    const response = await axios.put(
      `/api/admin/admins/${adminId}/toggle-status`
    );
    return response.data;
  },
};
