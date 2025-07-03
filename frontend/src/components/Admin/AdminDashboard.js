import React, { useEffect, useState } from "react";
import "./adminDashboard.css";
import { useNavigate } from "react-router-dom";
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
  const [activeView, setActiveView] = useState("dashboard"); // New state for active view
  const [loading, setLoading] = useState(false); // Add loading state
  const [serviceStatus, setServiceStatus] = useState({
    routes: 'unknown',
    tickets: 'unknown', 
    schedules: 'unknown',
    users: 'unknown'
  }); // Track service health

  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin";

  // Fetch data for dashboard
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching admin dashboard data...");
      
      // Fetch all data with individual error handling
      const [routesData, ticketsData, schedulesData, usersData, analytics] = await Promise.allSettled([
        ApiService.getRoutes(),
        ApiService.getAllTickets(),
        ApiService.getSchedules(),
        ApiService.getAllUsers(),
        ApiService.getAnalyticsSummary()
      ]);
      
      // Process results
      const routes = routesData.status === 'fulfilled' ? routesData.value : [];
      const tickets = ticketsData.status === 'fulfilled' ? ticketsData.value : [];
      const schedules = schedulesData.status === 'fulfilled' ? schedulesData.value : [];
      const users = usersData.status === 'fulfilled' ? usersData.value : [];
      const analyticsResult = analytics.status === 'fulfilled' ? analytics.value : {};
      
      // Update service status
      setServiceStatus({
        routes: routesData.status === 'fulfilled' ? 'online' : 'offline',
        tickets: ticketsData.status === 'fulfilled' ? 'online' : 'offline',
        schedules: schedulesData.status === 'fulfilled' ? 'online' : 'offline',
        users: usersData.status === 'fulfilled' ? 'online' : 'offline'
      });
      
      console.log("Fetched data:", {
        routes: routes.length,
        tickets: tickets.length,
        schedules: schedules.length,
        users: users.length
      });

      // Log any failed requests
      if (routesData.status === 'rejected') console.error("Routes fetch failed:", routesData.reason);
      if (ticketsData.status === 'rejected') console.error("Tickets fetch failed:", ticketsData.reason);
      if (schedulesData.status === 'rejected') console.error("Schedules fetch failed:", schedulesData.reason);
      if (usersData.status === 'rejected') console.error("Users fetch failed:", usersData.reason);
      if (analytics.status === 'rejected') console.error("Analytics fetch failed:", analytics.reason);
      
      setRoutes(routes);
      setTickets(tickets);
      setSchedules(schedules);
      setUsers(users);
      setAnalyticsData(analyticsResult);
      
      // Show partial success message if some data was loaded
      const successCount = [routesData, ticketsData, schedulesData, usersData].filter(r => r.status === 'fulfilled').length;
      if (successCount > 0 && successCount < 4) {
        toast.warning(`Loaded ${successCount}/4 data sources. Some services may be unavailable.`);
      } else if (successCount === 0) {
        toast.error("Failed to load dashboard data. All services appear to be down.");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case "routes":
        return <ManageRoutes />;
      case "tickets":
        return <ManageTickets />;
      case "schedules":
        return <AssignExistingSchedule />;
      case "analytics":
        return <Analytics />;
      case "users":
        return <ViewUsers />;
      default:
        return (
          <>
            {/* Enhanced Statistics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px', 
              marginBottom: '32px' 
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                color: 'white',
                padding: '32px', 
                borderRadius: '20px', 
                textAlign: 'center',
                boxShadow: '0 15px 40px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <i className="fas fa-users" style={{ fontSize: '48px', opacity: 0.9 }}></i>
                    <div style={{ 
                      padding: '4px 8px', 
                      background: serviceStatus.users === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      <i className={`fas fa-circle`} style={{ 
                        color: serviceStatus.users === 'online' ? '#10b981' : '#ef4444', 
                        fontSize: '8px', 
                        marginRight: '4px' 
                      }}></i>
                      {serviceStatus.users === 'online' ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{users.length || 0}</div>
                  <div style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>Total Users</div>
                  <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>
                    {users.filter(u => u.role?.toLowerCase() === 'admin').length} Admins • {users.filter(u => u.role?.toLowerCase() !== 'admin').length} Regular
                  </div>
                </div>
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '-20px', 
                  width: '100px', 
                  height: '100px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '50%' 
                }}></div>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                color: 'white',
                padding: '32px', 
                borderRadius: '20px', 
                textAlign: 'center',
                boxShadow: '0 15px 40px rgba(16, 185, 129, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <i className="fas fa-route" style={{ fontSize: '48px', opacity: 0.9 }}></i>
                    <div style={{ 
                      padding: '4px 8px', 
                      background: serviceStatus.routes === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      <i className={`fas fa-circle`} style={{ 
                        color: serviceStatus.routes === 'online' ? '#10b981' : '#ef4444', 
                        fontSize: '8px', 
                        marginRight: '4px' 
                      }}></i>
                      {serviceStatus.routes === 'online' ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{routes.length || 0}</div>
                  <div style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>Active Routes</div>
                  <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>
                    {routes.reduce((total, route) => total + parseFloat(route.distance || 0), 0).toFixed(1)} km total distance
                  </div>
                </div>
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '-20px', 
                  width: '100px', 
                  height: '100px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '50%' 
                }}></div>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                color: 'white',
                padding: '32px', 
                borderRadius: '20px', 
                textAlign: 'center',
                boxShadow: '0 15px 40px rgba(59, 130, 246, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <i className="fas fa-ticket-alt" style={{ fontSize: '48px', opacity: 0.9 }}></i>
                    <div style={{ 
                      padding: '4px 8px', 
                      background: serviceStatus.tickets === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      <i className={`fas fa-circle`} style={{ 
                        color: serviceStatus.tickets === 'online' ? '#10b981' : '#ef4444', 
                        fontSize: '8px', 
                        marginRight: '4px' 
                      }}></i>
                      {serviceStatus.tickets === 'online' ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{tickets.length || 0}</div>
                  <div style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>Total Tickets</div>
                  <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>
                    {tickets.filter(t => t.status?.toUpperCase() === 'BOOKED').length} Booked • {tickets.filter(t => t.status?.toUpperCase() === 'CANCELLED').length} Cancelled
                  </div>
                </div>
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '-20px', 
                  width: '100px', 
                  height: '100px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '50%' 
                }}></div>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                color: 'white',
                padding: '32px', 
                borderRadius: '20px', 
                textAlign: 'center',
                boxShadow: '0 15px 40px rgba(245, 158, 11, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <i className="fas fa-calendar-alt" style={{ fontSize: '48px', opacity: 0.9 }}></i>
                    <div style={{ 
                      padding: '4px 8px', 
                      background: serviceStatus.schedules === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      <i className={`fas fa-circle`} style={{ 
                        color: serviceStatus.schedules === 'online' ? '#10b981' : '#ef4444', 
                        fontSize: '8px', 
                        marginRight: '4px' 
                      }}></i>
                      {serviceStatus.schedules === 'online' ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{schedules.length || 0}</div>
                  <div style={{ fontSize: '16px', opacity: 0.9, fontWeight: '500' }}>Bus Schedules</div>
                  <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>
                    Active schedules across all routes
                  </div>
                </div>
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  right: '-20px', 
                  width: '100px', 
                  height: '100px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '50%' 
                }}></div>
              </div>
            </div>

            {/* Enhanced Action Buttons Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px', 
              marginBottom: '32px' 
            }}>
              <button 
                className="modern-btn modern-btn-primary"
                onClick={() => setActiveView("routes")}
                style={{ 
                  padding: '20px', 
                  height: 'auto', 
                  flexDirection: 'column', 
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <i className="fas fa-route" style={{ fontSize: '32px' }}></i>
                Manage Routes
              </button>

              <button 
                className="modern-btn modern-btn-primary"
                onClick={() => setActiveView("tickets")}
                style={{ 
                  padding: '20px', 
                  height: 'auto', 
                  flexDirection: 'column', 
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <i className="fas fa-ticket-alt" style={{ fontSize: '32px' }}></i>
                Manage Tickets
              </button>

              <button 
                className="modern-btn modern-btn-primary"
                onClick={() => setActiveView("schedules")}
                style={{ 
                  padding: '20px', 
                  height: 'auto', 
                  flexDirection: 'column', 
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <i className="fas fa-calendar-alt" style={{ fontSize: '32px' }}></i>
                Assign Schedules
              </button>

              <button 
                className="modern-btn modern-btn-primary"
                onClick={() => setActiveView("analytics")}
                style={{ 
                  padding: '20px', 
                  height: 'auto', 
                  flexDirection: 'column', 
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <i className="fas fa-chart-line" style={{ fontSize: '32px' }}></i>
                View Analytics
              </button>

              <button 
                className="modern-btn modern-btn-primary"
                onClick={() => setActiveView("users")}
                style={{ 
                  padding: '20px', 
                  height: 'auto', 
                  flexDirection: 'column', 
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <i className="fas fa-users" style={{ fontSize: '32px' }}></i>
                Manage Users
              </button>
            </div>

            {/* Enhanced Recent Activity Section */}
            <div className="modern-card" style={{ marginBottom: '32px' }}>
              <div className="modern-card-header">
                <h2 className="modern-card-title">
                  <i className="fas fa-clock" style={{ marginRight: '12px', color: '#667eea' }}></i>
                  Recent Activity
                </h2>
                <button 
                  className="modern-btn modern-btn-primary"
                  onClick={() => setActiveView("routes")}
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  <i className="fas fa-eye"></i>
                  View All
                </button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>
                        <i className="fas fa-route" style={{ marginRight: '8px' }}></i>
                        Route Name
                      </th>
                      <th>
                        <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>
                        Origin
                      </th>
                      <th>
                        <i className="fas fa-flag-checkered" style={{ marginRight: '8px' }}></i>
                        Destination
                      </th>
                      <th>
                        <i className="fas fa-ruler" style={{ marginRight: '8px' }}></i>
                        Distance
                      </th>
                      <th>
                        <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.length > 0 ? (
                      routes.slice(0, 5).map((route) => (
                        <tr key={route.id}>
                          <td>
                            <strong>{route.routeName || `${route.startPoint} - ${route.endPoint}`}</strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <i className="fas fa-map-marker-alt" style={{ color: '#10b981' }}></i>
                              {route.startPoint || route.origin}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <i className="fas fa-flag-checkered" style={{ color: '#ef4444' }}></i>
                              {route.endPoint || route.destination}
                            </div>
                          </td>
                          <td>
                            <span style={{ 
                              background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}>
                              {route.distance} km
                            </span>
                          </td>
                          <td>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                              color: '#166534',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}>
                              <i className="fas fa-check-circle"></i>
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                          <i className="fas fa-route" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
                          <br />
                          No routes available. Add routes to see activity here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Notification Section */}
            <div className="modern-card">
              <div className="modern-card-header">
                <h2 className="modern-card-title">
                  <i className="fas fa-bell" style={{ marginRight: '12px', color: '#667eea' }}></i>
                  Send Notification
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                  <i className="fas fa-users" style={{ color: '#10b981' }}></i>
                  Broadcast to {users.length} users
                </div>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div className="modern-form-group" style={{ marginBottom: '20px' }}>
                  <label className="modern-label">
                    <i className="fas fa-comment-alt" style={{ marginRight: '8px' }}></i>
                    Notification Message
                  </label>
                  <textarea
                    className="modern-input"
                    placeholder="Enter your notification message here... (e.g., Service updates, schedule changes, maintenance notices)"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                  <small style={{ color: '#6b7280', marginTop: '8px', display: 'block' }}>
                    {notificationMessage.length}/500 characters
                  </small>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    className="modern-btn modern-btn-success"
                    onClick={handleSendNotification}
                    disabled={!notificationMessage.trim() || notificationMessage.length > 500}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fas fa-paper-plane"></i>
                    Send Notification
                  </button>
                  <button 
                    className="modern-btn modern-btn-warning"
                    onClick={() => setNotificationMessage("")}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fas fa-eraser"></i>
                    Clear
                  </button>
                </div>
              </div>
              
              {/* Quick notification templates */}
              <div>
                <h4 style={{ marginBottom: '12px', color: '#2d3748', fontSize: '16px' }}>
                  <i className="fas fa-templates" style={{ marginRight: '8px' }}></i>
                  Quick Templates
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    "🚍 Service disruption on Route A due to maintenance. Expected resolution: 2 hours.",
                    "⏰ New schedule updates effective immediately. Check the latest timings.",
                    "🎉 New route launched! Connecting downtown to airport with express service.",
                    "🔧 System maintenance scheduled for tonight 11 PM - 2 AM. Limited service expected."
                  ].map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setNotificationMessage(template)}
                      style={{
                        background: 'white',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#4a5568',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        maxWidth: '300px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.background = '#f7fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.background = 'white';
                      }}
                    >
                      {template.substring(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Tickets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {/* Quick Actions */}
              <div className="modern-card">
                <div className="modern-card-header">
                  <h3 className="modern-card-title" style={{ fontSize: '18px' }}>
                    <i className="fas fa-bolt" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
                    Quick Actions
                  </h3>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <button 
                    className="modern-btn modern-btn-primary"
                    onClick={() => setActiveView("routes")}
                    style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                  >
                    <i className="fas fa-plus-circle" style={{ marginRight: '8px' }}></i>
                    Add New Route
                  </button>
                  <button 
                    className="modern-btn modern-btn-success"
                    onClick={() => setActiveView("schedules")}
                    style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                  >
                    <i className="fas fa-calendar-plus" style={{ marginRight: '8px' }}></i>
                    Create Schedule
                  </button>
                  <button 
                    className="modern-btn modern-btn-warning"
                    onClick={() => setActiveView("analytics")}
                    style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                  >
                    <i className="fas fa-chart-bar" style={{ marginRight: '8px' }}></i>
                    View Reports
                  </button>
                </div>
              </div>

              {/* Recent Tickets Summary */}
              <div className="modern-card">
                <div className="modern-card-header">
                  <h3 className="modern-card-title" style={{ fontSize: '18px' }}>
                    <i className="fas fa-ticket-alt" style={{ marginRight: '8px', color: '#3b82f6' }}></i>
                    Recent Tickets
                  </h3>
                  <button 
                    className="modern-btn modern-btn-primary"
                    onClick={() => setActiveView("tickets")}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    View All
                  </button>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {tickets.slice(0, 3).map((ticket, index) => (
                    <div key={ticket.id || index} style={{ 
                      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#2d3748' }}>
                          {ticket.passengerName || 'Unknown Passenger'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {ticket.routeName || 'Unknown Route'}
                        </div>
                      </div>
                      <span style={{ 
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        background: ticket.status?.toLowerCase() === 'confirmed' ? '#dcfce7' : 
                                  ticket.status?.toLowerCase() === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: ticket.status?.toLowerCase() === 'confirmed' ? '#166534' : 
                              ticket.status?.toLowerCase() === 'pending' ? '#92400e' : '#991b1b'
                      }}>
                        {ticket.status || 'Unknown'}
                      </span>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                      <i className="fas fa-inbox" style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.3 }}></i>
                      <br />
                      <small>No recent tickets</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {adminName}! Manage your transit system efficiently.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className="refresh-button" 
              onClick={fetchData}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 15px',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i> 
              {loading ? ' Refreshing...' : ' Refresh Data'}
            </button>
            <button className="logout-button" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="nav-pills">
          <button 
            className={`nav-pill ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </button>
          <button 
            className={`nav-pill ${activeView === "routes" ? "active" : ""}`}
            onClick={() => setActiveView("routes")}
          >
            <i className="fas fa-route"></i> Routes
          </button>
          <button 
            className={`nav-pill ${activeView === "tickets" ? "active" : ""}`}
            onClick={() => setActiveView("tickets")}
          >
            <i className="fas fa-ticket-alt"></i> Tickets
          </button>
          <button 
            className={`nav-pill ${activeView === "schedules" ? "active" : ""}`}
            onClick={() => setActiveView("schedules")}
          >
            <i className="fas fa-calendar-alt"></i> Schedules
          </button>
          <button 
            className={`nav-pill ${activeView === "analytics" ? "active" : ""}`}
            onClick={() => setActiveView("analytics")}
          >
            <i className="fas fa-chart-line"></i> Analytics
          </button>
          <button 
            className={`nav-pill ${activeView === "users" ? "active" : ""}`}
            onClick={() => setActiveView("users")}
          >
            <i className="fas fa-users"></i> Users
          </button>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '400px',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{
                fontSize: '16px',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Loading dashboard data...
                <br />
                <small>This may take a few moments if services are starting up</small>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;