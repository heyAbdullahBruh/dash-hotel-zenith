import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Auth/Login/Login";
import Dashboard from "./pages/Dashboard/Overview/Dashboard";
import FoodList from "./pages/FoodManagement/FoodList/FoodList";
import FoodForm from "./pages/FoodManagement/FoodForm/FoodForm";
import FoodDetail from "./pages/FoodManagement/FoodDetail/FoodDetail";
import OrderList from "./pages/OrderManagement/OrderList/OrderList";
import OrderDetail from "./pages/OrderManagement/OrderDetail/OrderDetail";
import TableBookings from "./pages/BookingManagement/TableBookings/TableBookings";
import EventBookings from "./pages/BookingManagement/EventBookings/EventBookings";
import CategoryManagement from "./pages/CategoryManagement/CategoryManagement";
import AdminManagement from "./pages/AdminManagement/AdminManagement";
import ReviewManagement from "./pages/ReviewManagement/ReviewManagement";
import RequireAuth from "./components/auth/RequireAuth";
import NotFound from "./pages/NotFound/NotFound";
import "./styles/globals.css";

// Layout wrapper for protected routes
const ProtectedLayout = () => (
  <RequireAuth>
    <Layout />
  </RequireAuth>
);

// Router configuration with React Router v7
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "foods",
        children: [
          {
            index: true,
            element: <FoodList />,
          },
          {
            path: "create",
            element: <FoodForm />,
          },
          {
            path: ":foodId/edit",
            element: <FoodForm />,
          },
          {
            path: ":foodId",
            element: <FoodDetail />,
          },
        ],
      },
      {
        path: "orders",
        children: [
          {
            index: true,
            element: <OrderList />,
          },
          {
            path: ":orderId",
            element: <OrderDetail />,
          },
        ],
      },
      {
        path: "bookings",
        children: [
          {
            path: "table",
            element: <TableBookings />,
          },
          {
            path: "event",
            element: <EventBookings />,
          },
        ],
      },
      {
        path: "categories",
        element: <CategoryManagement />,
      },
      {
        path: "reviews",
        element: <ReviewManagement />,
      },
      {
        path: "admins",
        element: (
          <RequireAuth allowedRoles={["super_admin"]}>
            <AdminManagement />
          </RequireAuth>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
