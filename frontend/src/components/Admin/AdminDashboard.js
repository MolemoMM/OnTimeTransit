import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Button, TextField } from "@mui/material";
import { motion } from "framer-motion";
import { ApiService } from "../../services/ApiService";
import Navbar from "../Navbar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Analytics from "../Analytics";

function AdminDashboard() {
  const [routes, setRoutes] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [analyticsData, setAnalyticsData] = useState({});

  const navigate = useNavigate();

  // Fetch data for routes, tickets, schedules, and analytics
  useEffect(() => {
    ApiService.getRoutes().then(setRoutes).catch(() => toast.error("Failed to fetch routes."));
    ApiService.getTickets().then(setTickets).catch(() => toast.error("Failed to fetch tickets."));
    ApiService.getSchedules().then(setSchedules).catch(() => toast.error("Failed to fetch schedules."));
    ApiService.getAnalyticsSummary().then(setAnalyticsData).catch(() => toast.error("Failed to fetch analytics."));
  }, []);

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
    <div>
      <Navbar />
      <div className="container mt-5">
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Analytics Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card component={motion.div} whileHover={{ scale: 1.05 }}>
              <CardContent>
                <Typography variant="h6">Total Tickets</Typography>
                <Typography variant="h4">{tickets.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card component={motion.div} whileHover={{ scale: 1.05 }}>
              <CardContent>
                <Typography variant="h6">Total Routes</Typography>
                <Typography variant="h4">{routes.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card component={motion.div} whileHover={{ scale: 1.05 }}>
              <CardContent>
                <Typography variant="h6">Total Schedules</Typography>
                <Typography variant="h4">{schedules.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Manage Tickets Section */}
        <div className="mt-5">
          <Typography variant="h5" gutterBottom>
            Manage Tickets
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate("/admin/tickets")}>
            View Tickets
          </Button>
        </div>

        {/* Manage Routes Section */}
        <div className="mt-5">
          <Typography variant="h5" gutterBottom>
            Manage Routes
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate("/admin/routes")}>
            View Routes
          </Button>
          <Button variant="contained" color="secondary" className="ms-3" onClick={() => navigate("/admin/routes/add")}>
            Add Route
          </Button>
        </div>

        {/* Manage Schedules Section */}
        <div className="mt-5">
          <Typography variant="h5" gutterBottom>
            Manage Schedules
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate("/admin/schedules")}>
            View Schedules
          </Button>
          <Button variant="contained" color="secondary" className="ms-3" onClick={() => navigate("/admin/schedules/add")}>
            Add Schedule
          </Button>
          <Button variant="contained" color="success" className="ms-3" onClick={() => navigate("/admin/schedules/assign")}>
            Assign Schedule
          </Button>
          <Button
            variant="contained"
            color="success"
            className="ms-3"
            onClick={() => navigate("/admin/schedules/assign-existing")}
          >
            Assign Existing Schedule
          </Button>
        </div>

        {/* Send Notifications Section */}
        <div className="mt-5">
          <Typography variant="h5" gutterBottom>
            Send Notifications
          </Typography>
          <TextField
            label="Notification Message"
            variant="outlined"
            fullWidth
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
          />
          <Button variant="contained" color="secondary" className="mt-3" onClick={handleSendNotification}>
            Send Notification
          </Button>
        </div>

        {/* Analytics Component */}
        <div className="mt-5">
          <Typography variant="h5" gutterBottom>
            Analytics
          </Typography>
          <Analytics data={analyticsData} /> {/* Pass the analytics data to the Analytics component */}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;