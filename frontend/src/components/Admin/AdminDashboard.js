import React, { useEffect, useState } from "react";
import { 
  Grid, 
  Button, 
  TextField, 
  IconButton, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Avatar,
  Chip,
  Divider,
  Paper,
  Container,
  Badge
} from "@mui/material";
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
  TrendingDown,
  Settings,
  ExitToApp
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <Navbar />
      <div className="p-6 space-y-8">
        {/* Modern Welcome Banner */}
        <Container maxWidth="xl" className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Paper
              elevation={6}
              className={`p-6 rounded-2xl text-white relative overflow-hidden ${
                darkMode 
                  ? 'bg-gradient-to-r from-indigo-800 via-blue-700 to-blue-600' 
                  : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400'
              }`}
            >
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <Typography variant="h3" className="font-black mb-2 tracking-wide text-white">
                    Welcome back, {adminName}! 👋
                  </Typography>
                  <Typography variant="h6" className="opacity-90 font-normal mb-4 text-white">
                    Manage your transit system with ease and efficiency
                  </Typography>
                  <div className="flex gap-3 flex-wrap">
                    <Chip 
                      icon={<DashboardIcon />} 
                      label="Admin Dashboard" 
                      className="bg-white/20 text-white font-semibold backdrop-blur-sm" 
                    />
                    <Chip 
                      label={`${new Date().toLocaleDateString()}`} 
                      className="bg-white/15 text-white backdrop-blur-sm" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon className="text-3xl text-white" />
                  </Badge>
                  <IconButton
                    onClick={() => setDarkMode((prev) => !prev)}
                    className="text-white bg-white/15 hover:bg-white/25 rounded-xl backdrop-blur-sm transition-all duration-200"
                    size="large"
                  >
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </div>
              </div>
              <div className="absolute inset-0 opacity-30">
                <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px]"></div>
              </div>
            </Paper>
          </motion.div>
        </Container>

        {/* Quick Statistics Cards Section */}
        <Container maxWidth="xl" className="mb-8">
          <Grid container spacing={3}>
            {/* Users Card */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-semibold mb-2 text-white">
                        Total Users
                      </Typography>
                      <Typography variant="h3" className="font-bold text-white">
                        {users ? users.length : 0}
                      </Typography>
                      <Typography variant="body2" className="opacity-80 mt-2 flex items-center text-white">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Active users
                      </Typography>
                    </div>
                    <Avatar className="bg-white/20 w-14 h-14 backdrop-blur-sm">
                      <PeopleIcon className="text-2xl text-white" />
                    </Avatar>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Routes Card */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-semibold mb-2 text-white">
                        Total Routes
                      </Typography>
                      <Typography variant="h3" className="font-bold text-white">
                        {routes.length}
                      </Typography>
                      <Typography variant="body2" className="opacity-80 mt-2 flex items-center text-white">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Available routes
                      </Typography>
                    </div>
                    <Avatar className="bg-white/20 w-14 h-14 backdrop-blur-sm">
                      <BusIcon className="text-2xl text-white" />
                    </Avatar>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Tickets Card */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-semibold mb-2 text-white">
                        Total Tickets
                      </Typography>
                      <Typography variant="h3" className="font-bold text-white">
                        {tickets.length}
                      </Typography>
                      <Typography variant="body2" className="opacity-80 mt-2 flex items-center text-white">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Booked tickets
                      </Typography>
                    </div>
                    <Avatar className="bg-white/20 w-14 h-14 backdrop-blur-sm">
                      <TicketIcon className="text-2xl text-white" />
                    </Avatar>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Schedules Card */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-orange-500 to-yellow-400 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-semibold mb-2 text-white">
                        Total Schedules
                      </Typography>
                      <Typography variant="h3" className="font-bold text-white">
                        {schedules.length}
                      </Typography>
                      <Typography variant="body2" className="opacity-80 mt-2 flex items-center text-white">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Active schedules
                      </Typography>
                    </div>
                    <Avatar className="bg-white/20 w-14 h-14 backdrop-blur-sm">
                      <ScheduleIcon className="text-2xl text-white" />
                    </Avatar>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* Quick Actions Panel */}
        <Container maxWidth="xl" className="mb-8">
          <Paper 
            elevation={3} 
            className={`p-6 rounded-2xl ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-slate-50 to-gray-100'
            }`}
          >
            <Typography variant="h5" className="font-bold mb-6 flex items-center text-gray-800 dark:text-white">
              <DashboardIcon className="mr-3 text-blue-600" />
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/admin/routes/add")}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    Add Route
                  </Button>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ScheduleIcon />}
                    onClick={() => navigate("/admin/schedules/assign")}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    Assign Schedule
                  </Button>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AnalyticsIcon />}
                    onClick={() => navigate("/admin/analytics")}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    View Analytics
                  </Button>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate("/admin/users")}
                    className="bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    Manage Users
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </Paper>
        </Container>

        {/* Main Dashboard Layout */}
        <div className="flex gap-8 max-w-7xl mx-auto px-6">
          <aside className={`w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 h-fit sticky top-6`}>
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
              <DashboardIcon className="mr-2 text-blue-600" />
              Navigation
            </h2>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/admin/tickets" 
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 ${
                      location.pathname.includes("/admin/tickets") 
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500" 
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <TicketIcon className="mr-3 w-5 h-5" />
                    Manage Tickets
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/routes" 
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 ${
                      location.pathname.includes("/admin/routes") 
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500" 
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <BusIcon className="mr-3 w-5 h-5" />
                    Manage Routes
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/schedules" 
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 ${
                      location.pathname.includes("/admin/schedules") 
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500" 
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <ScheduleIcon className="mr-3 w-5 h-5" />
                    Manage Schedules
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/analytics" 
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 ${
                      location.pathname.includes("/admin/analytics") 
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500" 
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <AnalyticsIcon className="mr-3 w-5 h-5" />
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/users" 
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 ${
                      location.pathname.includes("/admin/users") 
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500" 
                        : "text-gray-600 dark:text-gray-300"
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
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 min-h-96`}>
              <Routes>
                <Route path="tickets" element={<ManageTickets />} />
                <Route path="routes" element={<ManageRoutes />} />
                <Route path="routes/add" element={<AddRoute />} />
                <Route path="schedules" element={<BusScheduleList />} />
                <Route path="schedules/assign" element={<AssignSchedule />} />
                <Route path="analytics" element={<Analytics data={analyticsChartData} />} />
                <Route path="users" element={<ViewUsers />} />
                {/* Add more admin routes as needed */}
              </Routes>
            </div>
          </main>
        </div>

        {/* Notifications and System Management */}
        <Container maxWidth="xl" className="mb-8">
          <Grid container spacing={4}>
            {/* Send Notifications Panel */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={3} 
                className={`p-6 rounded-2xl ${
                  darkMode 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
                    : 'bg-gradient-to-br from-slate-50 to-gray-100'
                }`}
              >
                <Typography variant="h6" className="font-bold mb-6 flex items-center text-gray-800 dark:text-white">
                  <NotificationsIcon className="mr-3 text-blue-600" />
                  Send System Notifications
                </Typography>
                <TextField
                  label="Notification Message"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="mb-4"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'
                    }
                  }}
                  placeholder="Enter your notification message here..."
                />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    onClick={handleSendNotification}
                    disabled={!notificationMessage.trim()}
                    startIcon={<NotificationsIcon />}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Notification
                  </Button>
                </motion.div>
              </Paper>
            </Grid>

            {/* System Status Panel */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                className={`p-6 rounded-2xl h-full ${
                  darkMode 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
                    : 'bg-gradient-to-br from-slate-50 to-gray-100'
                }`}
              >
                <Typography variant="h6" className="font-bold mb-6 flex items-center text-gray-800 dark:text-white">
                  <Settings className="mr-3 text-blue-600" />
                  System Status
                </Typography>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-300">Database</Typography>
                    <Chip label="Online" className="bg-green-100 text-green-700 font-semibold" size="small" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-300">API Services</Typography>
                    <Chip label="Running" className="bg-green-100 text-green-700 font-semibold" size="small" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-300">Notifications</Typography>
                    <Chip label="Active" className="bg-green-100 text-green-700 font-semibold" size="small" />
                  </div>
                </div>
                <Divider className="mb-4" />
                <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </div>
    </div>
  );
}

export default AdminDashboard;