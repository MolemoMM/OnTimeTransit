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
    <div className="admin-dashboard-root">
      <Navbar />
      <div className="admin-dashboard-container">
        {/* Modern Welcome Banner */}
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Paper
              elevation={6}
              sx={{
                background: darkMode
                  ? 'linear-gradient(135deg, #232946 0%, #0066ff 100%)'
                  : 'linear-gradient(135deg, #0066ff 0%, #00e6ff 100%)',
                borderRadius: 4,
                p: 4,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  zIndex: 0
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: 1 }}>
                    Welcome back, {adminName}! 👋
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 2 }}>
                    Manage your transit system with ease and efficiency
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<DashboardIcon />} 
                      label="Admin Dashboard" 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} 
                    />
                    <Chip 
                      label={`${new Date().toLocaleDateString()}`} 
                      sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }} 
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon sx={{ fontSize: 32 }} />
                  </Badge>
                  <IconButton
                    onClick={() => setDarkMode((prev) => !prev)}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                      borderRadius: 2
                    }}
                    size="large"
                  >
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Container>

        <h1 className="admin-dashboard-title" style={{
          fontWeight: 800,
          fontSize: "2rem",
          color: "var(--color-accent)",
          marginBottom: 24,
          letterSpacing: "1px"
        }}>
          Admin Dashboard
        </h1>

        {/* Quick Statistics Cards Section */}
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)'
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Total Users
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {users ? users.length : 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        Active users
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PeopleIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(240, 147, 251, 0.15)'
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Total Routes
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {routes.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        Available routes
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <BusIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(79, 172, 254, 0.15)'
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Total Tickets
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {tickets.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        Booked tickets
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <TicketIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(250, 112, 154, 0.15)'
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Total Schedules
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {schedules.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        Active schedules
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <ScheduleIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* Quick Actions Panel */}
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              background: darkMode 
                ? 'linear-gradient(135deg, #232946 0%, #1a1f3a 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
              <DashboardIcon sx={{ mr: 2, color: '#0066ff' }} />
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/admin/routes/add")}
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    }
                  }}
                >
                  Add Route
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={() => navigate("/admin/schedules/assign")}
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.5,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                    }
                  }}
                >
                  Assign Schedule
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AnalyticsIcon />}
                  onClick={() => navigate("/admin/analytics")}
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.5,
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                    }
                  }}
                >
                  View Analytics
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate("/admin/users")}
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.5,
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
                    }
                  }}
                >
                  Manage Users
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>

        {/* Main Dashboard Layout */}
        <div className="admin-dashboard-layout">
          <aside className="admin-sidebar">
            <h2 className="sidebar-title">Navigation</h2>
            <nav>
              <ul>
                <li>
                  <Link to="/admin/tickets" className={location.pathname.includes("/admin/tickets") ? "active" : ""}>
                    <TicketIcon sx={{ mr: 1, fontSize: 20 }} />
                    Manage Tickets
                  </Link>
                </li>
                <li>
                  <Link to="/admin/routes" className={location.pathname.includes("/admin/routes") ? "active" : ""}>
                    <BusIcon sx={{ mr: 1, fontSize: 20 }} />
                    Manage Routes
                  </Link>
                </li>
                <li>
                  <Link to="/admin/schedules" className={location.pathname.includes("/admin/schedules") ? "active" : ""}>
                    <ScheduleIcon sx={{ mr: 1, fontSize: 20 }} />
                    Manage Schedules
                  </Link>
                </li>
                <li>
                  <Link to="/admin/analytics" className={location.pathname.includes("/admin/analytics") ? "active" : ""}>
                    <AnalyticsIcon sx={{ mr: 1, fontSize: 20 }} />
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" className={location.pathname.includes("/admin/users") ? "active" : ""}>
                    <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
                    View Users
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="admin-dashboard-content">
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
          </main>
        </div>

        {/* Notifications and System Management */}
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            {/* Send Notifications Panel */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: darkMode 
                    ? 'linear-gradient(135deg, #232946 0%, #1a1f3a 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ mr: 2, color: '#0066ff' }} />
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
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'
                    }
                  }}
                  placeholder="Enter your notification message here..."
                />
                <Button
                  variant="contained"
                  onClick={handleSendNotification}
                  disabled={!notificationMessage.trim()}
                  startIcon={<NotificationsIcon />}
                  sx={{ 
                    borderRadius: 2, 
                    py: 1.2,
                    px: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  Send Notification
                </Button>
              </Paper>
            </Grid>

            {/* System Status Panel */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: darkMode 
                    ? 'linear-gradient(135deg, #232946 0%, #1a1f3a 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  height: '100%'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Settings sx={{ mr: 2, color: '#0066ff' }} />
                  System Status
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Database</Typography>
                    <Chip label="Online" color="success" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">API Services</Typography>
                    <Chip label="Running" color="success" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Notifications</Typography>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
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