import React, { useEffect, useState } from "react";
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DirectionsBus as BusIcon,
  ConfirmationNumber as TicketIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  TrendingUp,
  Settings
} from "@mui/icons-material";
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

  // Transform analyticsData for the Analytics component
  const analyticsChartData = {
    labels: ["Total Tickets", "Total Routes", "Total Schedules", "Total Users"],
    values: [
      analyticsData.totalTickets || tickets.length || 0,
      analyticsData.totalRoutes || routes.length || 0,
      analyticsData.totalSchedules || schedules.length || 0,
      analyticsData.totalUsers || users.length || 0,
    ],
  };

  return (
    <div className="admin-dashboard">
      <Navbar />
      <div className="tw-container">
        {/* Modern Welcome Banner */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`welcome-banner ${darkMode ? 'dark' : ''}`}>
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-black mb-2 tracking-wide text-white">
                    Welcome back, {adminName}! 👋
                  </h1>
                  <p className="text-lg opacity-90 font-normal mb-4 text-white">
                    Manage your transit system with ease and efficiency
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <span className="tw-badge-primary flex items-center gap-2">
                      <DashboardIcon className="w-4 h-4" />
                      Admin Dashboard
                    </span>
                    <span className="tw-badge-secondary">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <NotificationsIcon className="text-3xl text-white" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      4
                    </span>
                  </div>
                  <button
                    onClick={() => setDarkMode((prev) => !prev)}
                    className="p-3 text-white bg-white/15 hover:bg-white/25 rounded-xl backdrop-blur-sm transition-all duration-200"
                  >
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </button>
                </div>
              </div>
              <div className="absolute inset-0 opacity-30">
                <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px]"></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Statistics Cards Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Users Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="stat-card stat-card-users">
                <div className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Total Users
                    </h3>
                    <div className="text-3xl font-bold text-white">
                      {users ? users.length : 0}
                    </div>
                    <p className="text-sm opacity-80 mt-2 flex items-center text-white">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Active users
                    </p>
                  </div>
                  <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <PeopleIcon className="text-2xl text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Routes Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="stat-card stat-card-routes">
                <div className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Total Routes
                    </h3>
                    <div className="text-3xl font-bold text-white">
                      {routes.length}
                    </div>
                    <p className="text-sm opacity-80 mt-2 flex items-center text-white">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Available routes
                    </p>
                  </div>
                  <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <BusIcon className="text-2xl text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tickets Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="stat-card stat-card-tickets">
                <div className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Total Tickets
                    </h3>
                    <div className="text-3xl font-bold text-white">
                      {tickets.length}
                    </div>
                    <p className="text-sm opacity-80 mt-2 flex items-center text-white">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Booked tickets
                    </p>
                  </div>
                  <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <TicketIcon className="text-2xl text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Schedules Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="stat-card stat-card-schedules">
                <div className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Total Schedules
                    </h3>
                    <div className="text-3xl font-bold text-white">
                      {schedules.length}
                    </div>
                    <p className="text-sm opacity-80 mt-2 flex items-center text-white">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Active schedules
                    </p>
                  </div>
                  <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <ScheduleIcon className="text-2xl text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="mb-8">
          <div className="tw-card">
            <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800 dark:text-white">
              <DashboardIcon className="mr-3 text-blue-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => navigate("/admin/routes/add")}
                  className="tw-btn-primary tw-btn-gradient-purple w-full flex items-center justify-center gap-2"
                >
                  <AddIcon />
                  Add Route
                </button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => navigate("/admin/schedules/assign")}
                  className="tw-btn-primary tw-btn-gradient-pink w-full flex items-center justify-center gap-2"
                >
                  <ScheduleIcon />
                  Assign Schedule
                </button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => navigate("/admin/analytics")}
                  className="tw-btn-primary tw-btn-gradient-blue w-full flex items-center justify-center gap-2"
                >
                  <AnalyticsIcon />
                  View Analytics
                </button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="tw-btn-primary tw-btn-gradient-orange w-full flex items-center justify-center gap-2"
                >
                  <PeopleIcon />
                  Manage Users
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="flex gap-8 max-w-7xl mx-auto px-6">
          <aside className="tw-sidebar">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
              <DashboardIcon className="mr-2 text-blue-600" />
              Navigation
            </h2>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/admin/tickets" 
                    className={`tw-nav-link ${
                      location.pathname.includes("/admin/tickets") 
                        ? "tw-nav-link-active" 
                        : ""
                    }`}
                  >
                    <TicketIcon className="mr-3 w-5 h-5" />
                    Manage Tickets
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/routes" 
                    className={`tw-nav-link ${
                      location.pathname.includes("/admin/routes") 
                        ? "tw-nav-link-active" 
                        : ""
                    }`}
                  >
                    <BusIcon className="mr-3 w-5 h-5" />
                    Manage Routes
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/schedules" 
                    className={`tw-nav-link ${
                      location.pathname.includes("/admin/schedules") 
                        ? "tw-nav-link-active" 
                        : ""
                    }`}
                  >
                    <ScheduleIcon className="mr-3 w-5 h-5" />
                    Manage Schedules
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/analytics" 
                    className={`tw-nav-link ${
                      location.pathname.includes("/admin/analytics") 
                        ? "tw-nav-link-active" 
                        : ""
                    }`}
                  >
                    <AnalyticsIcon className="mr-3 w-5 h-5" />
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/users" 
                    className={`tw-nav-link ${
                      location.pathname.includes("/admin/users") 
                        ? "tw-nav-link-active" 
                        : ""
                    }`}
                  >
                    <PeopleIcon className="mr-3 w-5 h-5" />
                    View Users
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="flex-1">
            <div className="tw-card min-h-96">
              <Routes>
                <Route path="tickets" element={<ManageTickets />} />
                <Route path="routes" element={<ManageRoutes />} />
                <Route path="routes/add" element={<AddRoute />} />
                <Route path="schedules" element={<BusScheduleList />} />
                <Route path="schedules/assign" element={<AssignSchedule />} />
                <Route path="analytics" element={<Analytics data={analyticsChartData} />} />
                <Route path="users" element={<ViewUsers />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Notifications and System Management */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Send Notifications Panel */}
            <div className="lg:col-span-2">
              <div className="tw-card">
                <h3 className="text-lg font-bold mb-6 flex items-center text-gray-800 dark:text-white">
                  <NotificationsIcon className="mr-3 text-blue-600" />
                  Send System Notifications
                </h3>
                <textarea
                  placeholder="Enter your notification message here..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="tw-input w-full h-24 mb-4 resize-none"
                />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={handleSendNotification}
                    disabled={!notificationMessage.trim()}
                    className="tw-btn-primary tw-btn-gradient-purple flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <NotificationsIcon className="w-4 h-4" />
                    Send Notification
                  </button>
                </motion.div>
              </div>
            </div>

            {/* System Status Panel */}
            <div>
              <div className="tw-card h-full">
                <h3 className="text-lg font-bold mb-6 flex items-center text-gray-800 dark:text-white">
                  <Settings className="mr-3 text-blue-600" />
                  System Status
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Database</span>
                    <span className="tw-badge-success">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">API Services</span>
                    <span className="tw-badge-success">Running</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Notifications</span>
                    <span className="tw-badge-success">Active</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;