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
    routeName: "",
    travelDateTime: "",
    seatNumber: 0,
    price: 0.0,
    status: "BOOKED"
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
      console.log("Fetched routes:", routesData);
      setRoutes(routesData || []);
      
      // Fetch all schedules
      const schedulesData = await ApiService.getSchedules();
      console.log("Fetched schedules:", schedulesData);
      setSchedules(schedulesData || []);
      
      // Calculate stats
      calculateStats(userTickets);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
      setRoutes([]);
      setSchedules([]);
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
      [name]: name === 'seatNumber' ? parseInt(value) || 0 : 
               name === 'price' ? parseFloat(value) || 0.0 : value,
    }));
  };

  const handleBookTicket = async (e) => {
    e.preventDefault();
    if (!selectedRoute) {
      toast.error("Please select a route first.");
      return;
    }

    if (!ticket.travelDateTime) {
      toast.error("Please select a travel date and time.");
      return;
    }

    setLoading(true);
    try {
      const ticketData = {
        ...ticket,
        routeName: selectedRoute.routeName || selectedRoute.name,
        travelDateTime: ticket.travelDateTime,
        status: "BOOKED"
      };
      
      await ApiService.createTicket(ticketData);
      toast.success("Ticket booked successfully!");
      setShowBookingForm(false);
      setTicket({
        passengerName: "",
        email: "",
        phoneNumber: "",
        routeName: "",
        travelDateTime: "",
        seatNumber: 0,
        price: 0.0,
        status: "BOOKED"
      });
      setSelectedRoute(null);
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
              <div className="action-card" onClick={() => setActiveSection('booking')}>
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
                onClick={() => setActiveSection('booking')}
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
                    onClick={() => setActiveSection('booking')}
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
              <button 
                className="btn btn-secondary"
                onClick={() => fetchDashboardData()}
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
            <div className="routes-grid">
              {routes.map((route, index) => {
                // Find schedules for this route
                const routeSchedules = schedules.filter(schedule => 
                  schedule.routeId === route.id || 
                  schedule.route?.id === route.id ||
                  schedule.routeName === route.routeName
                );
                
                return (
                  <div key={route.id || index} className="route-card">
                    <div className="route-header">
                      <h4>{route.routeName || route.name || 'Unnamed Route'}</h4>
                      <span className="route-price">${route.price || route.fare || '25.00'}</span>
                    </div>
                    <div className="route-details">
                      <div className="route-stops">
                        <span><i className="fas fa-map-marker-alt"></i> From: {route.source || route.startLocation || route.origin || 'N/A'}</span>
                        <span><i className="fas fa-map-marker-alt"></i> To: {route.destination || route.endLocation || route.target || 'N/A'}</span>
                      </div>
                      <div className="route-info">
                        <span><i className="fas fa-road"></i> Distance: {route.distance || 'N/A'} km</span>
                        <span><i className="fas fa-clock"></i> Duration: {route.duration || 'N/A'}</span>
                      </div>
                      
                      {/* Show available schedules for this route */}
                      {routeSchedules.length > 0 && (
                        <div className="route-schedules">
                          <h5><i className="fas fa-calendar-alt"></i> Available Schedules:</h5>
                          <div className="schedules-list">
                            {routeSchedules.map((schedule, scheduleIndex) => (
                              <div key={schedule.id || scheduleIndex} className="schedule-item">
                                <span className="schedule-time">
                                  <i className="fas fa-clock"></i>
                                  {schedule.departureTime} - {schedule.arrivalTime}
                                </span>
                                <span className="schedule-frequency">
                                  {schedule.frequency || 'Daily'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {routeSchedules.length === 0 && (
                        <div className="no-schedules">
                          <i className="fas fa-info-circle"></i>
                          <span>No schedules available for this route</span>
                        </div>
                      )}
                    </div>
                    <button 
                      className="btn btn-primary route-book-btn"
                      onClick={() => {
                        setSelectedRoute({...route, schedules: routeSchedules});
                        setActiveSection('booking');
                      }}
                      disabled={routeSchedules.length === 0}
                    >
                      <i className="fas fa-ticket-alt"></i> 
                      {routeSchedules.length > 0 ? 'Book Ticket' : 'No Schedules'}
                    </button>
                  </div>
                );
              })}
              {routes.length === 0 && !loading && (
                <div className="no-data">
                  <i className="fas fa-route"></i>
                  <h3>No Routes Available</h3>
                  <p>There are currently no routes available. Please check back later or contact support.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => fetchDashboardData()}
                  >
                    <i className="fas fa-sync-alt"></i> Refresh Routes
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'booking':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h2><i className="fas fa-plus-circle"></i> Book New Ticket</h2>
              <button 
                className="btn btn-secondary"
                onClick={() => fetchDashboardData()}
              >
                <i className="fas fa-sync-alt"></i> Refresh Data
              </button>
            </div>
            
            {/* Route Selection */}
            <div className="booking-section">
              <div className="section-card">
                <h3><i className="fas fa-route"></i> Select Route & Schedule</h3>
                <div className="routes-selection-grid">
                  {routes.map((route, index) => {
                    const routeSchedules = schedules.filter(schedule => 
                      schedule.routeId === route.id || 
                      schedule.route?.id === route.id ||
                      schedule.routeName === route.routeName
                    );
                    
                    return (
                      <div 
                        key={route.id || index} 
                        className={`route-selection-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                        onClick={() => routeSchedules.length > 0 && setSelectedRoute({...route, schedules: routeSchedules})}
                        style={{
                          opacity: routeSchedules.length === 0 ? 0.6 : 1,
                          cursor: routeSchedules.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <div className="route-info">
                          <h4>{route.routeName || route.name || 'Unnamed Route'}</h4>
                          <div className="route-details">
                            <span><i className="fas fa-map-marker-alt"></i> From: {route.source || route.startLocation || route.origin || 'N/A'}</span>
                            <span><i className="fas fa-map-marker-alt"></i> To: {route.destination || route.endLocation || route.target || 'N/A'}</span>
                            <span><i className="fas fa-road"></i> Distance: {route.distance || 'N/A'} km</span>
                            <span><i className="fas fa-dollar-sign"></i> Price: ${route.price || route.fare || '25.00'}</span>
                          </div>
                          
                          {/* Show available schedules */}
                          {routeSchedules.length > 0 && (
                            <div className="available-schedules">
                              <strong>Available Times:</strong>
                              {routeSchedules.map((schedule, scheduleIndex) => (
                                <span key={schedule.id || scheduleIndex} className="schedule-time-chip">
                                  {schedule.departureTime} - {schedule.arrivalTime}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {routeSchedules.length === 0 && (
                            <div className="no-schedules-warning">
                              <i className="fas fa-exclamation-triangle"></i>
                              <span>No schedules available</span>
                            </div>
                          )}
                        </div>
                        {selectedRoute?.id === route.id && (
                          <div className="selected-indicator">
                            <i className="fas fa-check-circle"></i>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Selection */}
              {selectedRoute && selectedRoute.schedules && selectedRoute.schedules.length > 0 && (
                <div className="section-card">
                  <h3><i className="fas fa-calendar-alt"></i> Select Schedule</h3>
                  <div className="schedules-selection-grid">
                    {selectedRoute.schedules.map((schedule, index) => (
                      <div 
                        key={schedule.id || index}
                        className={`schedule-selection-card ${ticket.scheduleId === schedule.id ? 'selected' : ''}`}
                        onClick={() => setTicket(prev => ({
                          ...prev,
                          scheduleId: schedule.id,
                          departureTime: schedule.departureTime,
                          arrivalTime: schedule.arrivalTime,
                          price: selectedRoute.price || selectedRoute.fare || 25.00
                        }))}
                      >
                        <div className="schedule-info">
                          <h4><i className="fas fa-clock"></i> {schedule.departureTime} - {schedule.arrivalTime}</h4>
                          <p><i className="fas fa-repeat"></i> {schedule.frequency || 'Daily'}</p>
                          {schedule.description && <p>{schedule.description}</p>}
                        </div>
                        {ticket.scheduleId === schedule.id && (
                          <div className="selected-indicator">
                            <i className="fas fa-check-circle"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Form */}
              {selectedRoute && ticket.scheduleId && (
                <div className="section-card">
                  <h3><i className="fas fa-ticket-alt"></i> Booking Details</h3>
                  <form onSubmit={handleBookTicket} className="booking-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-user"></i> Passenger Name
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          name="passengerName"
                          value={ticket.passengerName}
                          onChange={handleChange}
                          placeholder="Enter passenger name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-envelope"></i> Email Address
                        </label>
                        <input
                          type="email"
                          className="form-input"
                          name="email"
                          value={ticket.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-phone"></i> Phone Number
                        </label>
                        <input
                          type="tel"
                          className="form-input"
                          name="phoneNumber"
                          value={ticket.phoneNumber}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-calendar-alt"></i> Travel Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          className="form-input"
                          name="travelDateTime"
                          value={ticket.travelDateTime}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-chair"></i> Seat Number
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          name="seatNumber"
                          value={ticket.seatNumber}
                          onChange={handleChange}
                          placeholder="Enter seat number (1-50)"
                          required
                          min="1"
                          max="50"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-dollar-sign"></i> Price
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          name="price"
                          value={ticket.price}
                          onChange={handleChange}
                          placeholder="Enter price"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="booking-summary">
                      <h4><i className="fas fa-info-circle"></i> Booking Summary</h4>
                      <div className="summary-details">
                        <div className="summary-row">
                          <span>Route:</span>
                          <span>{selectedRoute.routeName || selectedRoute.name} ({selectedRoute.source || selectedRoute.origin || selectedRoute.startLocation} → {selectedRoute.destination || selectedRoute.target || selectedRoute.endLocation})</span>
                        </div>
                        <div className="summary-row">
                          <span>Travel Date & Time:</span>
                          <span>{ticket.travelDateTime ? new Date(ticket.travelDateTime).toLocaleString() : 'Not selected'}</span>
                        </div>
                        <div className="summary-row">
                          <span>Passenger:</span>
                          <span>{ticket.passengerName || 'Not specified'}</span>
                        </div>
                        <div className="summary-row">
                          <span>Seat:</span>
                          <span>{ticket.seatNumber || 'Not selected'}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Total Price:</span>
                          <span>${ticket.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> Booking...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-ticket-alt"></i> Book Ticket
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedRoute(null);
                          setTicket({
                            passengerName: "",
                            email: "",
                            phoneNumber: "",
                            routeName: "",
                            travelDateTime: "",
                            seatNumber: 0,
                            price: 0.0,
                            status: "BOOKED"
                          });
                        }}
                      >
                        <i className="fas fa-times"></i> Clear
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {routes.length === 0 && !loading && (
                <div className="no-data">
                  <i className="fas fa-route"></i>
                  <h3>No Routes Available</h3>
                  <p>There are currently no routes available for booking. Please contact your administrator.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => fetchDashboardData()}
                  >
                    <i className="fas fa-sync-alt"></i> Refresh Routes
                  </button>
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
              onClick={() => setActiveSection('booking')}
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
          <button 
            className={`nav-btn ${activeSection === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveSection('booking')}
          >
            <i className="fas fa-plus-circle"></i> Book Ticket
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