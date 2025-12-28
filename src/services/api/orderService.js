import axios from "./axiosConfig";

export const orderService = {
  // Get all orders with pagination and filters
  getAllOrders: async (params = {}) => {
    const response = await axios.get("/api/admin/orders", { params });
    return response.data;
  },

  // Get order statistics
  getOrderStats: async (params = {}) => {
    const response = await axios.get("/api/admin/orders/stats", { params });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, statusData) => {
    const response = await axios.put(
      `/api/admin/orders/${orderId}/status`,
      statusData
    );
    return response.data;
  },

  // Get order details (public endpoint)
  getOrder: async (orderId) => {
    const response = await axios.get(`/api/orders/${orderId}`);
    return response.data;
  },

  // Get order details (admin endpoint - if different)
  getOrderAdmin: async (orderId) => {
    const response = await axios.get(`/api/admin/orders/${orderId}`);
    return response.data;
  },

  // Export orders to CSV
  exportOrders: async (params = {}) => {
    const response = await axios.get("/api/admin/orders/export", {
      params,
      responseType: "blob",
      headers: {
        Accept: "text/csv",
      },
    });
    return response;
  },

  // Print invoice
  printInvoice: async (orderId) => {
    const response = await axios.get(`/api/admin/orders/${orderId}/invoice`, {
      responseType: "blob",
    });
    return response;
  },

  // Send order confirmation
  sendConfirmation: async (orderId) => {
    const response = await axios.post(
      `/api/admin/orders/${orderId}/send-confirmation`
    );
    return response.data;
  },

  // Add note to order
  addOrderNote: async (orderId, note) => {
    const response = await axios.post(`/api/admin/orders/${orderId}/notes`, {
      note,
    });
    return response.data;
  },

  // Update order details
  updateOrder: async (orderId, orderData) => {
    const response = await axios.put(`/api/admin/orders/${orderId}`, orderData);
    return response.data;
  },

  // Refund order
  refundOrder: async (orderId, refundData) => {
    const response = await axios.post(
      `/api/admin/orders/${orderId}/refund`,
      refundData
    );
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await axios.put(`/api/admin/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  },

  // Get order timeline
  getOrderTimeline: async (orderId) => {
    const response = await axios.get(`/api/admin/orders/${orderId}/timeline`);
    return response.data;
  },

  // Get orders by date range
  getOrdersByDateRange: async (startDate, endDate, params = {}) => {
    const response = await axios.get("/api/admin/orders/by-date", {
      params: {
        startDate,
        endDate,
        ...params,
      },
    });
    return response.data;
  },

  // Bulk update order status
  bulkUpdateStatus: async (orderIds, status) => {
    const response = await axios.post("/api/admin/orders/bulk-update-status", {
      orderIds,
      status,
    });
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (period = "monthly") => {
    const response = await axios.get("/api/admin/orders/analytics/revenue", {
      params: { period },
    });
    return response.data;
  },

  // Get top selling items
  getTopSellingItems: async (limit = 10, params = {}) => {
    const response = await axios.get("/api/admin/orders/analytics/top-items", {
      params: {
        limit,
        ...params,
      },
    });
    return response.data;
  },

  // Get customer order history
  getCustomerOrders: async (customerId, params = {}) => {
    const response = await axios.get(
      `/api/admin/orders/customer/${customerId}`,
      { params }
    );
    return response.data;
  },

  // Reorder from existing order
  reorder: async (orderId) => {
    const response = await axios.post(`/api/admin/orders/${orderId}/reorder`);
    return response.data;
  },

  // Validate order before update
  validateOrderUpdate: async (orderId, updateData) => {
    const response = await axios.post(
      `/api/admin/orders/${orderId}/validate-update`,
      updateData
    );
    return response.data;
  },

  // Get order metrics for dashboard
  getDashboardMetrics: async (period = "today") => {
    const response = await axios.get("/api/admin/orders/dashboard-metrics", {
      params: { period },
    });
    return response.data;
  },

  // Search orders with advanced filters
  searchOrders: async (searchParams) => {
    const response = await axios.post("/api/admin/orders/search", searchParams);
    return response.data;
  },

  // Sync order with external systems
  syncOrder: async (orderId, system = "pos") => {
    const response = await axios.post(`/api/admin/orders/${orderId}/sync`, {
      system,
    });
    return response.data;
  },

  // Get order count by status
  getCountByStatus: async () => {
    const response = await axios.get("/api/admin/orders/count-by-status");
    return response.data;
  },

  // Get average order value
  getAverageOrderValue: async (period = "month") => {
    const response = await axios.get("/api/admin/orders/average-value", {
      params: { period },
    });
    return response.data;
  },

  // Get order fulfillment time metrics
  getFulfillmentMetrics: async () => {
    const response = await axios.get("/api/admin/orders/fulfillment-metrics");
    return response.data;
  },

  // Request payment for order
  requestPayment: async (orderId) => {
    const response = await axios.post(
      `/api/admin/orders/${orderId}/request-payment`
    );
    return response.data;
  },

  // Mark order as paid
  markAsPaid: async (orderId, paymentData) => {
    const response = await axios.post(
      `/api/admin/orders/${orderId}/mark-paid`,
      paymentData
    );
    return response.data;
  },
};

// Order status constants
export const ORDER_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Order type constants
export const ORDER_TYPE = {
  DINE_IN: "dine_in",
  TAKEAWAY: "takeaway",
  DELIVERY: "delivery",
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
};

// Helper functions
export const getStatusColor = (status) => {
  const colors = {
    [ORDER_STATUS.PENDING]: "warning",
    [ORDER_STATUS.ACCEPTED]: "info",
    [ORDER_STATUS.PREPARING]: "primary",
    [ORDER_STATUS.READY]: "success",
    [ORDER_STATUS.OUT_FOR_DELIVERY]: "success",
    [ORDER_STATUS.DELIVERED]: "success",
    [ORDER_STATUS.COMPLETED]: "success",
    [ORDER_STATUS.CANCELLED]: "danger",
  };
  return colors[status] || "secondary";
};

export const getStatusText = (status) => {
  const texts = {
    [ORDER_STATUS.PENDING]: "Pending",
    [ORDER_STATUS.ACCEPTED]: "Accepted",
    [ORDER_STATUS.PREPARING]: "Preparing",
    [ORDER_STATUS.READY]: "Ready",
    [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
    [ORDER_STATUS.DELIVERED]: "Delivered",
    [ORDER_STATUS.COMPLETED]: "Completed",
    [ORDER_STATUS.CANCELLED]: "Cancelled",
  };
  return texts[status] || status;
};

export const getNextStatus = (currentStatus) => {
  const statusFlow = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.COMPLETED,
  ];

  const currentIndex = statusFlow.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
    return null;
  }

  return statusFlow[currentIndex + 1];
};

export const formatOrderNumber = (orderId) => {
  if (!orderId) return "";
  return `ORD-${orderId.slice(-8).toUpperCase()}`;
};

export const calculateOrderTotal = (order) => {
  if (!order || !order.items) return 0;

  const subtotal = order.items.reduce((sum, item) => {
    return sum + item.quantity * (item.price || 0);
  }, 0);

  const tax = order.taxAmount || 0;
  const delivery = order.deliveryFee || 0;
  const discount = order.discountAmount || 0;

  return subtotal + tax + delivery - discount;
};

// React Query hooks for orders
export const orderKeys = {
  all: ["orders"],
  lists: () => [...orderKeys.all, "list"],
  list: (filters) => [...orderKeys.lists(), filters],
  details: () => [...orderKeys.all, "detail"],
  detail: (id) => [...orderKeys.details(), id],
  stats: () => [...orderKeys.all, "stats"],
  analytics: () => [...orderKeys.all, "analytics"],
};
