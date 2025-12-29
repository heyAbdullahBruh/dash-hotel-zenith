import axios from "./axiosConfig";

export const foodService = {
  getAllFoods: async (params = {}) => {
    const response = await axios.get("/api/admin/foods", { params });
    return response.data;
  },

  getFood: async (foodId) => {
    const response = await axios.get(`/api/admin/foods/${foodId}`);
    return response.data;
  },

  createFood: async (foodData) => {
    const formData = new FormData();

    Object.keys(foodData).forEach((key) => {
      if (key === "images" && Array.isArray(foodData.images)) {
        foodData.images.forEach((image) => {
          formData.append("images", image); // ✅ same field name
        });
      } else if (Array.isArray(foodData[key])) {
        formData.append(key, JSON.stringify(foodData[key]));
      } else if (foodData[key] !== undefined && foodData[key] !== null) {
        formData.append(key, foodData[key]);
      }
    });

    const response = await axios.post("/api/admin/foods/create", formData, {
      withCredentials: true, // required if admin auth uses cookies
    });

    return response.data;
  },

  updateFood: async (foodId, foodData) => {
    const formData = new FormData();

    Object.keys(foodData).forEach((key) => {
      if (key === "images" && Array.isArray(foodData.images)) {
        foodData.images.forEach((image) => {
          formData.append("images", image);
        });
      } else if (Array.isArray(foodData[key])) {
        formData.append(key, JSON.stringify(foodData[key]));
      } else {
        formData.append(key, foodData[key]);
      }
    });

    const response = await axios.put(`/api/admin/foods/${foodId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteFood: async (foodId) => {
    const response = await axios.delete(`/api/admin/foods/${foodId}`);
    return response.data;
  },

  toggleAvailability: async (foodId) => {
    const response = await axios.put(
      `/api/admin/foods/${foodId}/toggle-availability`
    );
    return response.data;
  },
};
