import React, { useEffect, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./userDashboard.css";

function ViewRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = routes.filter(route => 
        (route.routeName || route.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.source || route.startLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.destination || route.endLocation || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(routes);
    }
  }, [searchTerm, routes]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const routesData = await ApiService.getRoutes();
      setRoutes(routesData);
      setFilteredRoutes(routesData);
    } catch (error) {
      toast.error("Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedules = (routeId) => {
    navigate(`/user/routes/${routeId}/schedules`);
  };

  const handleBookTicket = (route) => {
    navigate('/user', { state: { selectedRoute: route, activeSection: 'booking' } });
  };

  return (
    <div className="user-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              <i className="fas fa-route"></i> Available Routes
            </h1>
            <p className="dashboard-subtitle">
              Explore and book tickets for available routes
            </p>
          </div>
          <div className="header-actions">
            <div className="search-container">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading routes...</p>
            </div>
          </div>
        )}

        {/* Routes Content */}
        <div className="dashboard-content">
          <div className="routes-grid">
            {filteredRoutes.map((route, index) => (
              <div key={index} className="route-card">
                <div className="route-header">
                  <h4>{route.routeName || route.name}</h4>
                  <span className="route-price">${route.price || '25.00'}</span>
                </div>
                <div className="route-details">
                  <div className="route-stops">
                    <div className="stop-point">
                      <i className="fas fa-map-marker-alt start-marker"></i>
                      <span>{route.source || route.startLocation}</span>
                    </div>
                    <div className="route-line">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                    <div className="stop-point">
                      <i className="fas fa-map-marker-alt end-marker"></i>
                      <span>{route.destination || route.endLocation}</span>
                    </div>
                  </div>
                  <div className="route-info">
                    <div className="info-item">
                      <i className="fas fa-clock"></i>
                      <span>Departure: {route.departureTime}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-clock"></i>
                      <span>Arrival: {route.arrivalTime}</span>
                    </div>
                    {route.distance && (
                      <div className="info-item">
                        <i className="fas fa-road"></i>
                        <span>Distance: {route.distance} km</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="route-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleViewSchedules(route.id)}
                  >
                    <i className="fas fa-calendar-alt"></i> View Schedules
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleBookTicket(route)}
                  >
                    <i className="fas fa-ticket-alt"></i> Book Ticket
                  </button>
                </div>
              </div>
            ))}
            
            {filteredRoutes.length === 0 && !loading && (
              <div className="no-data">
                <i className="fas fa-route"></i>
                <h3>{searchTerm ? 'No Routes Found' : 'No Routes Available'}</h3>
                <p>
                  {searchTerm 
                    ? 'Try adjusting your search terms.'
                    : 'There are currently no routes available.'
                  }
                </p>
                {searchTerm && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i> Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewRoutes;
