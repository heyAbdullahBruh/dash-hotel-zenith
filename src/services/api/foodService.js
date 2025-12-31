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
      withCredentials: true, // fors cookies
    });

    return response.data;
  },

  // services/api/foodService.js
  updateFood: async (foodId, foodData) => {
    const formData = new FormData();

    Object.keys(foodData).forEach((key) => {
      const value = foodData[key];

      // Handle file uploads
      if (key === "images" && Array.isArray(value)) {
        value.forEach((image) => {
          if (image instanceof File || image instanceof Blob) {
            formData.append("images", image);
          }
        });
      }
      // Handle objects (including nutritionalInfo)
      else if (typeof value === "object" && value !== null) {
        // Stringify objects to JSON
        formData.append(key, JSON.stringify(value));
      }
      // Handle arrays (including ingredients)
      else if (Array.isArray(value)) {
        // For ingredients, we need to send it as a stringified array
        formData.append(key, JSON.stringify(value));
      }
      // Handle all other values
      else {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
    });

    const response = await axios.put(`/api/admin/foods/${foodId}`, formData, {
      withCredentials: true,
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
