import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role } = useAuth(); // Use AuthContext instead of AuthService

  if (!isAuthenticated || !role) {
    // If not authenticated or no role, redirect to login
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    // If the user's role is not allowed, redirect to login
    return <Navigate to="/login" />;
  }

  return children; // Render the protected component
};

export default PrivateRoute;



