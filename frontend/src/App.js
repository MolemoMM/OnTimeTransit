import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AdminDashboard from "./components/Admin/AdminDashboard";
import UserDashboard from "./components/User/UserDashboard";
import BusScheduleList from "./components/BusSchedule/BusScheduleList";
import AddSchedule from "./components/BusSchedule/AddBusSchedule"; 
import TicketList from "./components/TicketBooking/TicketList";
import BookTicket from "./components/TicketBooking/BookTicket";
import RouteList from "./components/RouteManagement/RouteList";
import ViewSchedules from "./components/User/ViewSchedules";

import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import PrivateRoute from "./utils/PrivateRoute";
import { useAuth } from "./context/AuthContext";

// Component to handle root route redirection
const RootRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  
  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={role === "ADMIN" ? "/admin" : "/user"} replace />;
  }
  
  // If not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <div className="App">
            <Routes>
              {/* Root redirect - goes to login if not authenticated */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin Dashboard Routes */}
              <Route
                path="/admin/*"
                element={
                  <PrivateRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />

              {/* User Routes */}
              <Route
                path="/user"
                element={
                  <PrivateRoute allowedRoles={["USER"]}>
                    <UserDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/tickets"
                element={
                  <PrivateRoute allowedRoles={["USER"]}>
                    <TicketList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/book-ticket"
                element={
                  <PrivateRoute allowedRoles={["USER"]}>
                    <BookTicket />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/routes"
                element={
                  <PrivateRoute allowedRoles={["USER"]}>
                    <RouteList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/routes/:routeId/schedules"
                element={
                  <PrivateRoute allowedRoles={["USER"]}>
                    <ViewSchedules />
                  </PrivateRoute>
                }
              />

              {/* Public Routes */}
              <Route path="/schedules" element={<BusScheduleList />} />
              <Route path="/schedules/add" element={<AddSchedule />} />
              <Route path="/routes" element={<RouteList />} />

              {/* Default Redirect - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;