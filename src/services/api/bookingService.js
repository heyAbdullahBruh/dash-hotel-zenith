import axios from "./axiosConfig";

export const bookingService = {
  // Table Bookings
  getTableBookings: async (params = {}) => {
    const response = await axios.get("/api/admin/bookings/table", { params });
    return response.data?.data;
  },

  updateTableBookingStatus: async (bookingId, status) => {
    const response = await axios.put(
      `/api/admin/bookings/table/${bookingId}/status`,
      { status }
    );
    return response.data?.data;
  },

  getTableBookingStats: async () => {
    const response = await axios.get("/api/admin/bookings/table/stats");
    return response.data?.stats;
  },

  // Event Bookings
  getEventBookings: async (params = {}) => {
    const response = await axios.get("/api/admin/bookings/event", { params });
    return response.data?.data;
  },

  updateEventBookingStatus: async (bookingId, status) => {
    const response = await axios.put(
      `/api/admin/bookings/event/${bookingId}/status`,
      { status }
    );
    return response.data?.data;
  },

  getEventBookingStats: async () => {
    const response = await axios.get("/api/admin/bookings/event/stats");
    return response.data?.data;
  },

  // Export functionality
  exportBookings: async (params) => {
    const response = await axios.get("/api/admin/bookings/export", {
      params,
      responseType: "blob",
    });
    return response;
  },
};
