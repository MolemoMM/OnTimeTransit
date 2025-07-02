import React, { useEffect, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./userDashboard.css";

function UserDashboard() {
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [ticket, setTicket] = useState({
    passengerName: "",
    email: "",
    phoneNumber: "",
    seatNumber: "",
    price: 0,
  });
  const [availableSeats, setAvailableSeats] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalTickets: 0,
    upcomingTrips: 0,
    totalSpent: 0,
    favoriteRoute: 'N/A'
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user tickets
      const userTickets = await ApiService.getAllTickets();
      setTickets(userTickets);
      
      // Fetch routes
      const routesData = await ApiService.getRoutes();
      setRoutes(routesData);
      
      // Calculate stats
      calculateStats(userTickets);
      
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketsData) => {
    const totalTickets = ticketsData.length;
    const upcomingTrips = ticketsData.filter(ticket => 
      new Date(ticket.departureTime) > new Date()
    ).length;
    const totalSpent = ticketsData.reduce((sum, ticket) => sum + ticket.price, 0);
    
    setStats({
      totalTickets,
      upcomingTrips,
      totalSpent,
      favoriteRoute: 'Downtown Express' // This could be calculated from ticket data
    });
  };

  // Fetch schedules when a route is selected
  useEffect(() => {
    if (selectedRoute) {
      setLoading(true);
      ApiService.getSchedulesByRoute(selectedRoute.id)
        .then((data) => setSchedules(data))
        .catch(() => toast.error("Failed to fetch schedules."))
        .finally(() => setLoading(false));
    }
  }, [selectedRoute]);

  // Fetch available seats when a schedule is selected
  useEffect(() => {
    if (selectedRoute) {
      setLoading(true);
      ApiService.getAvailableSeats(selectedRoute.routeName, selectedRoute.departureTime)
        .then((data) => setAvailableSeats(data))
        .catch(() => toast.error("Failed to fetch seat availability."))
        .finally(() => setLoading(false));
    }
  }, [selectedRoute]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookTicket = async (e) => {
    e.preventDefault();
    if (!selectedRoute) {
      toast.error("Please select a route first.");
      return;
    }

    setLoading(true);
    try {
      await ApiService.createTicket({
        ...ticket,
        routeName: selectedRoute.routeName,
        departureTime: selectedRoute.departureTime,
        arrivalTime: selectedRoute.arrivalTime,
      });
      toast.success("Ticket booked successfully!");
      setShowBookingForm(false);
      setTicket({
        passengerName: "",
        email: "",
        phoneNumber: "",
        seatNumber: "",
        price: 0,
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error("Failed to book ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="dashboard-content">
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-ticket-alt"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalTickets}</h3>
                  <p>Total Tickets</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.upcomingTrips}</h3>
                  <p>Upcoming Trips</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="stat-content">
                  <h3>${stats.totalSpent.toFixed(2)}</h3>
                  <p>Total Spent</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-route"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.favoriteRoute}</h3>
                  <p>Favorite Route</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="action-grid">
              <div className="action-card" onClick={() => navigate("/user/book-ticket")}>
                <div className="action-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <h4>Book New Ticket</h4>
                <p>Find and book your next journey</p>
              </div>
              <div className="action-card" onClick={() => setActiveSection('tickets')}>
                <div className="action-icon">
                  <i className="fas fa-list"></i>
                </div>
                <h4>My Tickets</h4>
                <p>View all your booked tickets</p>
              </div>
              <div className="action-card" onClick={() => setActiveSection('routes')}>
                <div className="action-icon">
                  <i className="fas fa-map-marked-alt"></i>
                </div>
                <h4>Browse Routes</h4>
                <p>Explore available routes</p>
              </div>
            </div>

            {/* Recent Tickets */}
            <div className="recent-section">
              <h3>Recent Tickets</h3>
              <div className="recent-tickets">
                {tickets.slice(0, 3).map((ticket, index) => (
                  <div key={index} className="ticket-card">
                    <div className="ticket-info">
                      <h4>{ticket.routeName || 'Route Name'}</h4>
                      <p><i className="fas fa-user"></i> {ticket.passengerName}</p>
                      <p><i className="fas fa-calendar"></i> {new Date(ticket.departureTime).toLocaleDateString()}</p>
                    </div>
                    <div className="ticket-price">
                      <span>${ticket.price}</span>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="no-tickets">
                    <i className="fas fa-ticket-alt"></i>
                    <p>No tickets found. Book your first ticket!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'tickets':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h2><i className="fas fa-ticket-alt"></i> My Tickets</h2>
              <button 
                className="btn btn-primary"
                onClick={() => navigate("/user/book-ticket")}
              >
                <i className="fas fa-plus"></i> Book New Ticket
              </button>
            </div>
            <div className="tickets-grid">
              {tickets.map((ticket, index) => (
                <div key={index} className="ticket-detail-card">
                  <div className="ticket-header">
                    <h4>{ticket.routeName || 'Route Name'}</h4>
                    <span className={`status ${ticket.status || 'confirmed'}`}>
                      {ticket.status || 'Confirmed'}
                    </span>
                  </div>
                  <div className="ticket-details">
                    <div className="detail-row">
                      <span><i className="fas fa-user"></i> Passenger:</span>
                      <span>{ticket.passengerName}</span>
                    </div>
                    <div className="detail-row">
                      <span><i className="fas fa-envelope"></i> Email:</span>
                      <span>{ticket.email}</span>
                    </div>
                    <div className="detail-row">
                      <span><i className="fas fa-phone"></i> Phone:</span>
                      <span>{ticket.phoneNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span><i className="fas fa-chair"></i> Seat:</span>
                      <span>{ticket.seatNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span><i className="fas fa-calendar"></i> Date:</span>
                      <span>{new Date(ticket.departureTime).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span><i className="fas fa-dollar-sign"></i> Price:</span>
                      <span className="price">${ticket.price}</span>
                    </div>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="no-data">
                  <i className="fas fa-ticket-alt"></i>
                  <h3>No Tickets Found</h3>
                  <p>You haven't booked any tickets yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate("/user/book-ticket")}
                  >
                    Book Your First Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'routes':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h2><i className="fas fa-map-marked-alt"></i> Available Routes</h2>
            </div>
            <div className="routes-grid">
              {routes.map((route, index) => (
                <div key={index} className="route-card">
                  <div className="route-header">
                    <h4>{route.routeName || route.name}</h4>
                    <span className="route-price">${route.price || '25.00'}</span>
                  </div>
                  <div className="route-details">
                    <div className="route-stops">
                      <span><i className="fas fa-map-marker-alt"></i> From: {route.source || route.startLocation}</span>
                      <span><i className="fas fa-map-marker-alt"></i> To: {route.destination || route.endLocation}</span>
                    </div>
                    <div className="route-times">
                      <span><i className="fas fa-clock"></i> Departure: {route.departureTime}</span>
                      <span><i className="fas fa-clock"></i> Arrival: {route.arrivalTime}</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary route-book-btn"
                    onClick={() => {
                      setSelectedRoute(route);
                      navigate("/user/book-ticket", { state: { selectedRoute: route } });
                    }}
                  >
                    <i className="fas fa-ticket-alt"></i> Book Ticket
                  </button>
                </div>
              ))}
              {routes.length === 0 && (
                <div className="no-data">
                  <i className="fas fa-route"></i>
                  <h3>No Routes Available</h3>
                  <p>There are currently no routes available.</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="user-dashboard">
      <Navbar />
      
      {/* Dashboard Header */}
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              <i className="fas fa-user"></i> Welcome back, {user?.username || 'User'}!
            </h1>
            <p className="dashboard-subtitle">
              Manage your tickets and explore new destinations
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/user/book-ticket")}
            >
              <i className="fas fa-plus"></i> Quick Book
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-nav">
          <button 
            className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <i className="fas fa-tachometer-alt"></i> Overview
          </button>
          <button 
            className={`nav-btn ${activeSection === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveSection('tickets')}
          >
            <i className="fas fa-ticket-alt"></i> My Tickets
          </button>
          <button 
            className={`nav-btn ${activeSection === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveSection('routes')}
          >
            <i className="fas fa-route"></i> Routes
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading...</p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {renderContent()}
      </div>
    </div>
  );
}

export default UserDashboard;