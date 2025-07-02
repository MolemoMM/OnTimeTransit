import React, { useEffect, useState } from "react";
import "./adminDashboard.css";
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
    <div className="admin-dashboard">
      <Navbar />
      <div className="admin-main">
        {/* Modern Welcome Banner */}
        <Container maxWidth="xl" className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Paper
              elevation={6}
              className="admin-header"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <Typography variant="h3" className="font-bold mb-2 text-white">
                    Welcome back, {adminName}! 👋
                  </Typography>
                  <Typography variant="h6" className="mb-4 text-white">
                    Manage your transit system with ease and efficiency
                  </Typography>
                  <div className="flex gap-3 flex-wrap">
                    <Chip 
                      icon={<DashboardIcon />} 
                      label="Admin Dashboard" 
                      className="bg-white text-primary font-semibold" 
                    />
                    <Chip 
                      label={`${new Date().toLocaleDateString()}`} 
                      className="bg-white text-secondary" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon className="text-white" style={{ fontSize: '2rem' }} />
                  </Badge>
                  <IconButton
                    onClick={() => setDarkMode((prev) => !prev)}
                    className="text-white btn-outline"
                    size="large"
                  >
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </div>
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
                <Card className="card card-gradient-primary">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-semibold mb-2 text-white">
                        Total Users
                      </Typography>
                      <Typography variant="h3" className="font-bold text-white">
                        {users ? users.length : 0}
                      </Typography>
                      <Typography variant="body2" className="mt-2 flex items-center text-white">
                        <TrendingUp style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                        Active users
                      </Typography>
                    </div>
                    <Avatar className="bg-white text-primary" style={{ width: '56px', height: '56px' }}>
                      <PeopleIcon style={{ fontSize: '2rem' }} />
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
                <Card className="card card-gradient-error">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-semibold mb-2 text-white">
                        Total Routes
                      </Typography>
                      <Typography variant="h3" className="font-bold text-white">
                        {routes.length}
                      </Typography>
                      <Typography variant="body2" className="mt-2 flex items-center text-white">
                        <TrendingUp style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                        Available routes
                      </Typography>
                    </div>
                    <Avatar className="bg-white text-error" style={{ width: '56px', height: '56px' }}>
                      <BusIcon style={{ fontSize: '2rem' }} />
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
                <Card className="card card-gradient-primary">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-semibold mb-2 text-white">
                        Total Tickets
                      </Typography>
                      <Typography variant="h3" className="font-bold text-white">
                        {tickets.length}
                      </Typography>
                      <Typography variant="body2" className="mt-2 flex items-center text-white">
                        <TrendingUp style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                        Booked tickets
                      </Typography>
                    </div>
                    <Avatar className="bg-white text-primary" style={{ width: '56px', height: '56px' }}>
                      <TicketIcon style={{ fontSize: '2rem' }} />
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
                <Card className="card card-gradient-warning">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-semibold mb-2 text-white">
                        Total Schedules
                      </Typography>
                      <Typography variant="h3" className="font-bold text-white">
                        {schedules.length}
                      </Typography>
                      <Typography variant="body2" className="mt-2 flex items-center text-white">
                        <TrendingUp style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                        Active schedules
                      </Typography>
                    </div>
                    <Avatar className="bg-white text-warning" style={{ width: '56px', height: '56px' }}>
                      <ScheduleIcon style={{ fontSize: '2rem' }} />
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
            className="card p-6"
          >
            <Typography variant="h5" className="font-bold mb-6 flex items-center text-secondary">
              <DashboardIcon className="mr-3 text-primary" />
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
                    className="btn btn-primary"
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
                    className="btn btn-error"
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
                    className="btn btn-primary"
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
                    className="btn btn-warning"
                  >
                    Manage Users
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </Paper>
        </Container>

        {/* Main Dashboard Layout */}
        <div className="flex gap-8">
          <aside className="card" style={{ width: '320px', height: 'fit-content', position: 'sticky', top: '24px' }}>
            <h2 className="text-xl font-bold mb-6 text-secondary flex items-center">
              <DashboardIcon className="mr-2 text-primary" />
              Navigation
            </h2>
            <nav>
              <ul className="gap-2">
                <li>
                  <Link 
                    to="/admin/tickets" 
                    className={`sidebar-item ${
                      location.pathname.includes("/admin/tickets") 
                        ? "active" 
                        : ""
                    }`}
                  >
                    <TicketIcon className="sidebar-icon" />
                    Manage Tickets
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/routes" 
                    className={`sidebar-item ${
                      location.pathname.includes("/admin/routes") 
                        ? "active" 
                        : ""
                    }`}
                  >
                    <BusIcon className="sidebar-icon" />
                    Manage Routes
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/schedules" 
                    className={`sidebar-item ${
                      location.pathname.includes("/admin/schedules") 
                        ? "active" 
                        : ""
                    }`}
                  >
                    <ScheduleIcon className="sidebar-icon" />
                    Manage Schedules
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/analytics" 
                    className={`sidebar-item ${
                      location.pathname.includes("/admin/analytics") 
                        ? "active" 
                        : ""
                    }`}
                  >
                    <AnalyticsIcon className="sidebar-icon" />
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/users" 
                    className={`sidebar-item ${
                      location.pathname.includes("/admin/users") 
                        ? "active" 
                        : ""
                    }`}
                  >
                    <PeopleIcon className="sidebar-icon" />
                    View Users
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="flex-1">
            <div className="card" style={{ minHeight: '384px' }}>
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
                className="card p-6"
              >
                <Typography variant="h6" className="font-bold mb-6 flex items-center text-secondary">
                  <NotificationsIcon className="mr-3 text-primary" />
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
                  className="form-input mb-4"
                  placeholder="Enter your notification message here..."
                />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    onClick={handleSendNotification}
                    disabled={!notificationMessage.trim()}
                    startIcon={<NotificationsIcon />}
                    className="btn btn-primary"
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
                className="card p-6 h-full"
              >
                <Typography variant="h6" className="font-bold mb-6 flex items-center text-secondary">
                  <Settings className="mr-3 text-primary" />
                  System Status
                </Typography>
                <div className="mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-secondary">Database</Typography>
                    <Chip label="Online" className="bg-success text-white font-semibold" size="small" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-secondary">API Services</Typography>
                    <Chip label="Running" className="bg-success text-white font-semibold" size="small" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-secondary">Notifications</Typography>
                    <Chip label="Active" className="bg-success text-white font-semibold" size="small" />
                  </div>
                </div>
                <Divider className="mb-4" />
                <Typography variant="body2" className="text-secondary">
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