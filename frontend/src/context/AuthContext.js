import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    return storedAuth ? JSON.parse(storedAuth) : false;
  });

  const [role, setRole] = useState(() => localStorage.getItem("role") || null);

  const navigate = useNavigate();

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [isAuthenticated, role]);

  const login = (userRole) => {
    console.log("Logging in with role:", userRole);
    setIsAuthenticated(true);
    setRole(userRole);
    // Navigation will be handled by the component after state update
    setTimeout(() => {
      navigate(userRole === "ADMIN" ? "/admin" : "/user");
    }, 100);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);