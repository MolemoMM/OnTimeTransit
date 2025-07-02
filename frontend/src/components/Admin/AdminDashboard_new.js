import React, { useEffect, useState } from "react";
import "./adminDashboard.css";
import { useNavigate, Link, Routes, Route, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ApiService } from "../../services/ApiService";
import ManageTickets from "./ManageTickets";
import ManageRoutes from "./ManageRoutes";
import ViewUsers from "./ViewUsers";
import AssignExistingSchedule from "../BusSchedule/AssignExistingSchedule";
import Analytics from "../Analytics";

function AdminDashboard() {
  const [routes, setRoutes] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});
  const [notificationMessage, setNotificationMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const adminName = localStorage.getItem("adminName") || "Admin";

  // Fetch data for dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesData, ticketsData, schedulesData, usersData, analytics] = await Promise.all([
          ApiService.getRoutes().catch(() => []),
          ApiService.getTickets().catch(() => []),
          ApiService.getSchedules().catch(() => []),
          ApiService.getAllUsers().catch(() => []),
          ApiService.getAnalyticsSummary().catch(() => ({}))
        ]);
        
        setRoutes(routesData);
        setTickets(ticketsData);
        setSchedules(schedulesData);
        setUsers(usersData);
        setAnalyticsData(analytics);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("adminName");
    navigate("/login");
    toast.success("Logged out successfully!");
  };

  // Handle sending notifications
  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      toast.error("Notification message cannot be empty.");
      return;
    }
    
    try {
      await ApiService.sendNotification(notificationMessage);
      toast.success("Notification sent successfully!");
      setNotificationMessage("");
    } catch (error) {
      toast.error("Failed to send notification.");
    }
  };

  // Render main dashboard
  const renderDashboard = () => (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {adminName}! Manage your transit system efficiently.</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card users">
            <div className="stat-value">{users.length || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card routes">
            <div className="stat-value">{routes.length || 0}</div>
            <div className="stat-label">Active Routes</div>
          </div>
          <div className="stat-card tickets">
            <div className="stat-value">{tickets.length || 0}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
          <div className="stat-card schedules">
            <div className="stat-value">{schedules.length || 0}</div>
            <div className="stat-label">Bus Schedules</div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="actions-grid">
          <button 
            className="action-button"
            onClick={() => navigate("/admin/routes")}
          >
            <div className="action-icon">
              <i className="fas fa-route"></i>
            </div>
            <div className="action-text">Manage Routes</div>
          </button>

          <button 
            className="action-button"
            onClick={() => navigate("/admin/tickets")}
          >
            <div className="action-icon">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <div className="action-text">Manage Tickets</div>
          </button>

          <button 
            className="action-button"
            onClick={() => navigate("/admin/schedules/assign")}
          >
            <div className="action-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="action-text">Assign Schedules</div>
          </button>

          <button 
            className="action-button"
            onClick={() => navigate("/admin/analytics")}
          >
            <div className="action-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="action-text">View Analytics</div>
          </button>

          <button 
            className="action-button"
            onClick={() => navigate("/admin/users")}
          >
            <div className="action-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="action-text">Manage Users</div>
          </button>

          <button 
            className="action-button"
            onClick={() => navigate("/admin/routes/add")}
          >
            <div className="action-icon">
              <i className="fas fa-plus"></i>
            </div>
            <div className="action-text">Add New Route</div>
          </button>
        </div>

        {/* Recent Activity Section */}
        <div className="dashboard-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Distance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {routes.slice(0, 5).map((route) => (
                  <tr key={route.id}>
                    <td>{route.routeName}</td>
                    <td>{route.origin}</td>
                    <td>{route.destination}</td>
                    <td>{route.distance} km</td>
                    <td>
                      <span className="status-badge status-active">Active</span>
                    </td>
                  </tr>
                ))}
                {routes.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      No routes available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notification Section */}
        <div className="dashboard-section">
          <h2 className="section-title">Send Notification</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Enter notification message..."
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              style={{ flex: 1 }}
            />
            <button 
              className="btn btn-primary"
              onClick={handleSendNotification}
            >
              Send Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={renderDashboard()} />
      <Route path="/tickets" element={<ManageTickets />} />
      <Route path="/routes" element={<ManageRoutes />} />
      <Route path="/users" element={<ViewUsers />} />
      <Route path="/schedules/assign" element={<AssignExistingSchedule />} />
      <Route path="/analytics" element={<Analytics data={{
        labels: ["Total Tickets", "Total Routes", "Total Schedules", "Total Users"],
        values: [
          analyticsData.totalTickets || tickets.length || 0,
          analyticsData.totalRoutes || routes.length || 0,
          analyticsData.totalSchedules || schedules.length || 0,
          analyticsData.totalUsers || users.length || 0,
        ],
      }} />} />
    </Routes>
  );
}

export default AdminDashboard;
