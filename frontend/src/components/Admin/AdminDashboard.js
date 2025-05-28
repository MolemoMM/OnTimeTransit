import React, { useEffect, useState } from "react";
import { Grid, Button, TextField, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { ApiService } from "../../services/ApiService";
import Navbar from "../Navbar";
import { toast } from "react-toastify";
import { useNavigate, Link, Routes, Route, useLocation } from "react-router-dom";
import ManageTickets from "./ManageTickets";
import ManageRoutes from "./ManageRoutes";
import BusScheduleList from "../BusSchedule/BusScheduleList";
import Analytics from "../Analytics";
import AssignSchedule from "../BusSchedule/AssignSchedule";
import AddRoute from "../RouteManagement/AddRoute";
import ViewUsers from "./ViewUsers";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import "./stylings/AdminDashboard.css";

function AdminDashboard() {
  const [routes, setRoutes] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [analyticsData, setAnalyticsData] = useState({});
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const adminName = localStorage.getItem("adminName") || "Admin";

  // Fetch data for routes, tickets, schedules, and analytics
  useEffect(() => {
    ApiService.getRoutes().then(setRoutes).catch(() => toast.error("Failed to fetch routes."));
    ApiService.getTickets().then(setTickets).catch(() => toast.error("Failed to fetch tickets."));
    ApiService.getSchedules().then(setSchedules).catch(() => toast.error("Failed to fetch schedules."));
    ApiService.getAnalyticsSummary().then(setAnalyticsData).catch(() => toast.error("Failed to fetch analytics."));
    ApiService.getAllUsers().then(setUsers).catch(() => toast.error("Failed to fetch users.")); // <-- fix here
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Handle sending notifications
  const handleSendNotification = () => {
    if (!notificationMessage.trim()) {
      toast.error("Notification message cannot be empty.");
      return;
    }
    ApiService.sendNotification(notificationMessage)
      .then(() => {
        toast.success("Notification sent successfully!");
        setNotificationMessage("");
      })
      .catch(() => toast.error("Failed to send notification."));
  };

  return (
    <div className="admin-dashboard-root">
      <Navbar />
      <div className="admin-dashboard-container">
        {/* Professional Welcome Banner */}
        <div
          style={{
            width: "100%",
            maxWidth: "1200px", // Align with main container width
            margin: "24px auto 32px auto", // Center horizontally, match top/bottom spacing
            background: darkMode
              ? "linear-gradient(90deg, #232946 0%, #0066ff 100%)"
              : "linear-gradient(90deg, #0066ff 0%, #00e6ff 100%)",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 24px #0066ff22",
            padding: "32px 48px",
            position: "relative",
          }}
        >
          <div style={{ textAlign: "left", color: "#fff" }}>
            <h1 style={{
              margin: 0,
              fontWeight: 900,
              fontSize: "2.4rem",
              letterSpacing: "1.5px",
              lineHeight: 1.1
            }}>
              Welcome, {adminName}
            </h1>
            <p style={{
              margin: "8px 0 0 0",
              fontSize: "1.18rem",
              fontWeight: 500,
              color: "#e3f6fc"
            }}>
              Your central hub for managing routes, schedules, tickets, users, and analytics.
            </p>
          </div>
          {/* Place dark mode toggle here, top right of banner */}
          <div style={{ alignSelf: "flex-start", marginRight: 0 }}>
            <IconButton
              onClick={() => setDarkMode((prev) => !prev)}
              style={{
                color: "#fff",
                background: darkMode
                  ? "rgba(35,41,70,0.85)"
                  : "rgba(0,102,255,0.85)",
                borderRadius: 18,
                marginLeft: 8,
                boxShadow: "0 2px 8px #0066ff33",
                transition: "background 0.3s",
              }}
              size="large"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Brightness7Icon fontSize="large" /> : <Brightness4Icon fontSize="large" />}
            </IconButton>
          </div>
        </div>

        <h1 className="admin-dashboard-title" style={{
          fontWeight: 800,
          fontSize: "2rem",
          color: "var(--color-accent)",
          marginBottom: 24,
          letterSpacing: "1px"
        }}>
          Admin Dashboard
        </h1>

        <div className="admin-dashboard-layout">
          <aside className="admin-sidebar">
            <h2 className="sidebar-title">Admin</h2>
            <nav>
              <ul>
                <li>
                  <Link to="/admin/tickets" className={location.pathname.includes("/admin/tickets") ? "active" : ""}>
                    Manage Tickets
                  </Link>
                </li>
                <li>
                  <Link to="/admin/routes" className={location.pathname.includes("/admin/routes") ? "active" : ""}>
                    Manage Routes
                  </Link>
                </li>
                <li>
                  <Link to="/admin/schedules" className={location.pathname.includes("/admin/schedules") ? "active" : ""}>
                    Manage Schedules
                  </Link>
                </li>
                <li>
                  <Link to="/admin/analytics" className={location.pathname.includes("/admin/analytics") ? "active" : ""}>
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" className={location.pathname.includes("/admin/users") ? "active" : ""}>
                    View Users
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="admin-dashboard-content">
            {/* Add Route and Assign Schedule Buttons */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/admin/routes/add")}
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                Add Route
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/admin/schedules/assign")}
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                Assign Schedule
              </Button>
            </div>
            <Routes>
              <Route path="tickets" element={<ManageTickets />} />
              <Route path="routes" element={<ManageRoutes />} />
              <Route path="routes/add" element={<AddRoute />} />
              <Route path="schedules" element={<BusScheduleList />} />
              <Route path="schedules/assign" element={<AssignSchedule />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<ViewUsers />} />
              {/* Add more admin routes as needed */}
            </Routes>
          </main>
        </div>

        {/* Analytics Section */}
        <div className="admin-dashboard-section" style={{ marginTop: 32 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <div className="admin-dashboard-card" as={motion.div} whileHover={{ scale: 1.05 }}>
                <div style={{ fontWeight: 700, color: "#0066ff" }}>Total Tickets</div>
                <div style={{ fontSize: "2rem", fontWeight: 800 }}>{tickets.length}</div>
              </div>
            </Grid>
            <Grid item xs={12} sm={3}>
              <div className="admin-dashboard-card" as={motion.div} whileHover={{ scale: 1.05 }}>
                <div style={{ fontWeight: 700, color: "#0066ff" }}>Total Routes</div>
                <div style={{ fontSize: "2rem", fontWeight: 800 }}>{routes.length}</div>
              </div>
            </Grid>
            <Grid item xs={12} sm={3}>
              <div className="admin-dashboard-card" as={motion.div} whileHover={{ scale: 1.05 }}>
                <div style={{ fontWeight: 700, color: "#0066ff" }}>Total Schedules</div>
                <div style={{ fontSize: "2rem", fontWeight: 800 }}>{schedules.length}</div>
              </div>
            </Grid>
            <Grid item xs={12} sm={3}>
              <div className="admin-dashboard-card" as={motion.div} whileHover={{ scale: 1.05 }}>
                <div style={{ fontWeight: 700, color: "#0066ff" }}>Total Users</div>
                <div style={{ fontSize: "2rem", fontWeight: 800 }}>{users ? users.length : 0}</div>
              </div>
            </Grid>
          </Grid>
        </div>

        {/* Send Notifications Section */}
        <div className="admin-dashboard-section" style={{ marginTop: 32 }}>
          <h5 style={{ fontWeight: 700, color: "var(--color-accent)" }}>Send Notifications</h5>
          <TextField
            label="Notification Message"
            variant="outlined"
            fullWidth
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            sx={{ marginBottom: 2, background: "rgba(255,255,255,0.08)", borderRadius: "8px" }}
          />
          <button className="btn admin-dashboard-section btn-primary" onClick={handleSendNotification}>
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;