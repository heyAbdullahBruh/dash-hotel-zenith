// ProtectedLayout.jsx
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import Layout from "./Layout";
import Loader from "../ui/Loader/Loader";

const ProtectedLayout = () => {
  const { isAuthenticated, authChecked, isLoading } = useAuth();
  const location = useLocation();

  // Debug logs (remove in production)
  useEffect(() => {
    console.log("ProtectedLayout state:", {
      isAuthenticated,
      authChecked,
      isLoading,
      pathname: location.pathname,
    });
  }, [isAuthenticated, authChecked, isLoading, location.pathname]);

  // Show loader only during initial auth check
  if (!authChecked) {
    return <Loader fullScreen />;
  }

  // If auth check is complete and user is not authenticated, redirect to login
  if (!isAuthenticated) {
    // Preserve the attempted URL for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the layout with Outlet
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedLayout;
