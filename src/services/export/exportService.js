import { format } from "date-fns";
import { foodService } from "../api/foodService";
import { orderService } from "../api/orderService";
import { bookingService } from "../api/bookingService";
import { categoryService } from "../api/categoryService";

export const exportService = {
  exportToCSV: (data, filename, headers) => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            // Handle values with commas
            if (typeof value === "string" && value.includes(",")) {
              return `"${value}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  exportToJSON: (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  exportToExcel: async (data, filename, sheetName = "Data") => {
    // Using xlsx library (you'd need to install it)
    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Excel export error:", error);
      // Fallback to CSV
      const headers = Object.keys(data[0] || {});
      exportService.exportToCSV(
        data,
        filename.replace(".xlsx", ".csv"),
        headers
      );
    }
  },

  // Food Export
  exportFoods: async (params) => {
    try {
      const response = await foodService.getAllFoods({
        ...params,
        limit: 1000,
      });
      const foods = response.data || [];

      const formattedData = foods.map((food) => ({
        ID: food._id,
        Name: food.name,
        Description: food.description,
        Category: food.category?.name,
        Price: food.price,
        Discount: food.discount,
        "Final Price": food.price - food.discount,
        Availability: food.isAvailable ? "Available" : "Unavailable",
        Stock: food.stock,
        "Created At": format(new Date(food.createdAt), "yyyy-MM-dd HH:mm"),
        Ingredients: food.ingredients?.join(", "),
        Calories: food.nutritionalInfo?.calories,
        Protein: food.nutritionalInfo?.protein,
        Carbs: food.nutritionalInfo?.carbs,
        Fat: food.nutritionalInfo?.fat,
      }));

      const filename = `foods-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      const headers = [
        "ID",
        "Name",
        "Description",
        "Category",
        "Price",
        "Discount",
        "Final Price",
        "Availability",
        "Stock",
        "Created At",
        "Ingredients",
        "Calories",
        "Protein",
        "Carbs",
        "Fat",
      ];

      exportService.exportToCSV(formattedData, filename, headers);
      return true;
    } catch (error) {
      console.error("Food export error:", error);
      throw error;
    }
  },

  // Orders Export
  exportOrders: async (params) => {
    try {
      const response = await orderService.getAllOrders({
        ...params,
        limit: 1000,
      });
      const orders = response.data || [];

      const formattedData = orders.map((order) => ({
        "Order ID": order.orderNumber,
        Customer: order.customer?.name || "Guest",
        Email: order.customer?.email,
        Phone: order.customer?.phone,
        "Order Type": order.type,
        Status: order.status,
        "Items Count": order.items?.length || 0,
        Subtotal: order.subtotal,
        Tax: order.taxAmount,
        "Delivery Fee": order.deliveryFee,
        Discount: order.discountAmount,
        "Total Amount": order.totalAmount,
        "Payment Method": order.paymentMethod,
        "Payment Status": order.paymentStatus,
        "Order Date": format(new Date(order.createdAt), "yyyy-MM-dd HH:mm"),
        "Delivery Address": order.deliveryAddress,
        "Special Instructions": order.specialInstructions,
      }));

      const filename = `orders-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
      const headers = [
        "Order ID",
        "Customer",
        "Email",
        "Phone",
        "Order Type",
        "Status",
        "Items Count",
        "Subtotal",
        "Tax",
        "Delivery Fee",
        "Discount",
        "Total Amount",
        "Payment Method",
        "Payment Status",
        "Order Date",
        "Delivery Address",
        "Special Instructions",
      ];

      exportService.exportToCSV(formattedData, filename, headers);
      return true;
    } catch (error) {
      console.error("Order export error:", error);
      throw error;
    }
  },

  // Bookings Export
  exportBookings: async (params, type = "table") => {
    try {
      const service =
        type === "table"
          ? bookingService.getTableBookings
          : bookingService.getEventBookings;
      const response = await service({ ...params, limit: 1000 });
      const bookings = response.data || [];

      const formattedData = bookings.map((booking) => ({
        "Booking ID": booking.bookingNumber || booking.eventNumber,
        "Customer Name": booking.customerName,
        Email: booking.customerEmail,
        Phone: booking.customerPhone,
        Type: type === "table" ? "Table Booking" : "Event Booking",
        "Event Type": booking.eventType,
        Date: format(
          new Date(booking.bookingDate || booking.eventDate),
          "yyyy-MM-dd"
        ),
        Time: booking.bookingTime,
        Guests: booking.guests || booking.guestCount,
        Status: booking.status,
        "Table Number": booking.tableNumber,
        "Total Budget": booking.totalBudget,
        "Amount Spent": booking.spentAmount,
        "Remaining Budget": booking.totalBudget - (booking.spentAmount || 0),
        "Created At": format(new Date(booking.createdAt), "yyyy-MM-dd HH:mm"),
        Notes: booking.notes,
      }));

      const typeName = type === "table" ? "table-bookings" : "event-bookings";
      const filename = `${typeName}-export-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`;
      const headers = [
        "Booking ID",
        "Customer Name",
        "Email",
        "Phone",
        "Type",
        "Event Type",
        "Date",
        "Time",
        "Guests",
        "Status",
        "Table Number",
        "Total Budget",
        "Amount Spent",
        "Remaining Budget",
        "Created At",
        "Notes",
      ];

      exportService.exportToCSV(formattedData, filename, headers);
      return true;
    } catch (error) {
      console.error("Booking export error:", error);
      throw error;
    }
  },

  // Batch Export
  exportAllData: async () => {
    try {
      const exportDate = format(new Date(), "yyyy-MM-dd");
      const data = {
        metadata: {
          exportDate,
          hotelName: "HotelZenith",
          version: "1.0.0",
        },
        foods: [],
        orders: [],
        tableBookings: [],
        eventBookings: [],
        categories: [],
      };

      // Fetch all data
      const [foods, orders, tableBookings, eventBookings, categories] =
        await Promise.all([
          foodService.getAllFoods({ limit: 1000 }).then((r) => r.data),
          orderService.getAllOrders({ limit: 1000 }).then((r) => r.data),
          bookingService.getTableBookings({ limit: 1000 }).then((r) => r.data),
          bookingService.getEventBookings({ limit: 1000 }).then((r) => r.data),
          categoryService.getAllCategories(),
        ]);

      data.foods = foods || [];
      data.orders = orders || [];
      data.tableBookings = tableBookings || [];
      data.eventBookings = eventBookings || [];
      data.categories = categories || [];

      exportService.exportToJSON(
        data,
        `hotelzenith-full-backup-${exportDate}.json`
      );
      return true;
    } catch (error) {
      console.error("Full export error:", error);
      throw error;
    }
  },

  // Import Functions
  importFromJSON: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error("Invalid JSON file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  },

  validateImportData: (data) => {
    const requiredFields = {
      foods: ["name", "price"],
      orders: ["orderNumber", "totalAmount"],
      bookings: ["customerName", "bookingDate"],
    };

    const errors = [];

    Object.keys(requiredFields).forEach((type) => {
      if (data[type]) {
        data[type].forEach((item, index) => {
          requiredFields[type].forEach((field) => {
            if (!item[field]) {
              errors.push(
                `${type}[${index}]: Missing required field "${field}"`
              );
            }
          });
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      stats: {
        foods: data.foods?.length || 0,
        orders: data.orders?.length || 0,
        bookings: data.bookings?.length || 0,
        categories: data.categories?.length || 0,
      },
    };
  },
};
