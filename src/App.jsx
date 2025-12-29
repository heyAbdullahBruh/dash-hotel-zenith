// src/App.jsx - Updated with lazy loading
import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Loader from "./components/ui/Loader/Loader";
import "./styles/globals.css";

// Lazy load pages
const Login = lazy(() => import("./pages/Auth/Login/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard/Overview/Dashboard"));
const FoodList = lazy(() => import("./pages/FoodManagement/FoodList/FoodList"));
const FoodForm = lazy(() => import("./pages/FoodManagement/FoodForm/FoodForm"));
const OrderList = lazy(() =>
  import("./pages/OrderManagement/OrderList/OrderList")
);
const OrderDetail = lazy(() =>
  import("./pages/OrderManagement/OrderDetail/OrderDetail")
);
const TableBookings = lazy(() =>
  import("./pages/BookingManagement/TableBookings/TableBookings")
);
const EventBookings = lazy(() =>
  import("./pages/BookingManagement/EventBookings/EventBookings")
);
const CategoryManagement = lazy(() =>
  import("./pages/CategoryManagement/CategoryManagement")
);
const AdminManagement = lazy(() =>
  import("./pages/AdminManagement/AdminManagement")
);
const ReviewManagement = lazy(() =>
  import("./pages/ReviewManagement/ReviewManagement")
);
const Settings = lazy(() => import("./pages/Settings/Settings"));
// const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
    }}
  >
    <Loader />
  </div>
);

const ProtectedLayout = ({ children }) => {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Layout />
    </Suspense>
  );
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "foods",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <FoodList />
              </Suspense>
            ),
          },
          {
            path: "create",
            element: (
              <Suspense fallback={<PageLoader />}>
                <FoodForm />
              </Suspense>
            ),
          },
          {
            path: ":foodId/edit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <FoodForm />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "orders",
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <OrderList />
              </Suspense>
            ),
          },
          {
            path: ":orderId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OrderDetail />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        ),
      },
      // ... other routes
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
