import axios from "./axiosConfig";

export const categoryService = {
  getAllCategories: async () => {
    const response = await axios.get("/api/admin/categories");
    return response.data;
  },

  createCategory: async (categoryData) => {
    const formData = new FormData();

    Object.keys(categoryData).forEach((key) => {
      if (key === "image" && categoryData[key]) {
        formData.append("image", categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });

    const response = await axios.post(
      "/api/admin/categories/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const formData = new FormData();

    Object.keys(categoryData).forEach((key) => {
      if (key === "image" && categoryData[key]) {
        formData.append("image", categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });

    const response = await axios.put(
      `/api/admin/categories/${categoryId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await axios.delete(`/api/admin/categories/${categoryId}`);
    return response.data;
  },

  toggleCategoryStatus: async (categoryId) => {
    const response = await axios.put(
      `/api/admin/categories/${categoryId}/toggle-status`
    );
    return response.data;
  },
};
