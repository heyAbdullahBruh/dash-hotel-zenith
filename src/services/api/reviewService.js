import axios from "./axiosConfig";

export const reviewService = {
  getPendingReviews: async (params = {}) => {
    const response = await axios.get("/api/admin/reviews/pending", { params });
    return response.data;
  },

  approveReview: async (reviewId) => {
    const response = await axios.put(`/api/admin/reviews/${reviewId}/approve`);
    return response.data;
  },

  addAdminResponse: async (reviewId, response) => {
    const responseData = await axios.post(
      `/api/admin/reviews/${reviewId}/response`,
      { response }
    );
    return responseData.data;
  },

  // Additional methods for comprehensive review management
  getAllReviews: async (params = {}) => {
    const response = await axios.get("/api/admin/reviews", { params });
    return response.data;
  },

  getReviewStats: async () => {
    const response = await axios.get("/api/admin/reviews/stats");
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await axios.delete(`/api/admin/reviews/${reviewId}`);
    return response.data;
  },
};
