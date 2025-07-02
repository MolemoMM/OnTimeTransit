import React from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const role = AuthService.getRole(); // Get the role from localStorage

  if (!role) {
    // If no role is found, redirect to login
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    // If the user's role is not allowed, redirect to login
    return <Navigate to="/login" />;
  }

  return children; // Render the protected component
};

export default PrivateRoute;



