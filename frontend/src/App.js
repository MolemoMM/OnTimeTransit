import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LandingPage from "./pages/LandingPage";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AdminDashboard from "./components/Admin/AdminDashboard";
import UserDashboard from "./components/User/UserDashboard";
import BusScheduleList from "./components/BusSchedule/BusScheduleList";
import AddSchedule from "./components/BusSchedule/AddBusSchedule"; 
import TicketList from "./components/TicketBooking/TicketList";
import BookTicket from "./components/TicketBooking/BookTicket";
import RouteList from "./components/RouteManagement/RouteList";
//import AddRoute from "./components/RouteManagement/AddRoute";
//import ManageTickets from "./components/Admin/ManageTickets";
//import ManageRoutes from "./components/Admin/ManageRoutes";
import ViewSchedules from "./components/User/ViewSchedules";
//import AssignSchedule from "./components/BusSchedule/AssignSchedule";
//import AssignExistingSchedule from "./components/BusSchedule/AssignExistingSchedule";

import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import PrivateRoute from "./utils/PrivateRoute";


function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <div className="App">
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Login Page */}
              <Route path="/login" element={<Login />} />

              {/* Register Page */}
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

              {/* User Dashboard Routes */}
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

              {/* Additional Routes */}
              <Route path="/schedules" element={<BusScheduleList />} />
              <Route path="/schedules/add" element={<AddSchedule />} />

              {/* Route List */}
              <Route path="/routes" element={<RouteList />} />

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;