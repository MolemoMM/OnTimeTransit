import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import Navbar from "../Navbar";
import { useAuth } from "../../context/AuthContext";
import "./userDashboard.css";

function ViewSchedules() {
  const { routeId } = useParams(); // Get the route ID from the URL
  const [schedules, setSchedules] = useState([]);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchRouteAndSchedules();
  }, [routeId, navigate]);

  const fetchRouteAndSchedules = async () => {
    setLoading(true);
    try {
      // Fetch the route details
      const routes = await ApiService.getRoutes();
      const selectedRoute = routes.find((r) => r.id === Number(routeId));
      if (selectedRoute) {
        setRoute(selectedRoute);
      } else {
        toast.error("Route not found.");
        navigate("/user/routes");
        return;
      }

      // Fetch schedules for the route
      const schedulesData = await ApiService.getSchedulesByRoute(routeId);
      setSchedules(schedulesData);
    } catch (error) {
      toast.error("Failed to fetch route details and schedules.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = (schedule) => {
    navigate("/user", { state: { selectedRoute: { ...route, ...schedule }, activeSection: 'booking' } });
  };

  return (
    <div className="user-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              <i className="fas fa-calendar-alt"></i> Schedules
              {route && (
                <span className="route-subtitle">
                  {route.source || route.startLocation} → {route.destination || route.endLocation}
                </span>
              )}
            </h1>
            <p className="dashboard-subtitle">
              Choose your preferred departure time
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => navigate("/user/routes")}
            >
              <i className="fas fa-arrow-left"></i> Back to Routes
            </button>
          </div>
        </div>

        {/* Route Information Card */}
        {route && (
          <div className="route-info-card">
            <div className="route-info-header">
              <h3><i className="fas fa-route"></i> {route.routeName || route.name}</h3>
              <span className="route-price">${route.price || '25.00'}</span>
            </div>
            <div className="route-info-details">
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>From: {route.source || route.startLocation}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>To: {route.destination || route.endLocation}</span>
              </div>
              {route.distance && (
                <div className="info-item">
                  <i className="fas fa-road"></i>
                  <span>Distance: {route.distance} km</span>
                </div>
              )}
              {route.estimatedTravelTime && (
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <span>Travel Time: {route.estimatedTravelTime}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading schedules...</p>
            </div>
          </div>
        )}

        {/* Schedules Content */}
        <div className="dashboard-content">
          <div className="content-header">
            <h2><i className="fas fa-calendar-alt"></i> Available Schedules</h2>
          </div>
          
          {schedules.length > 0 ? (
            <div className="schedules-grid">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="schedule-card">
                  <div className="schedule-header">
                    <div className="time-info">
                      <div className="departure-time">
                        <i className="fas fa-plane-departure"></i>
                        <span className="time">{schedule.departureTime}</span>
                        <span className="label">Departure</span>
                      </div>
                      <div className="journey-line">
                        <div className="line"></div>
                        <i className="fas fa-bus"></i>
                      </div>
                      <div className="arrival-time">
                        <i className="fas fa-plane-arrival"></i>
                        <span className="time">{schedule.arrivalTime}</span>
                        <span className="label">Arrival</span>
                      </div>
                    </div>
                  </div>
                  <div className="schedule-details">
                    <div className="detail-item">
                      <i className="fas fa-repeat"></i>
                      <span>Frequency: {schedule.frequency}</span>
                    </div>
                    {schedule.availableSeats && (
                      <div className="detail-item">
                        <i className="fas fa-chair"></i>
                        <span>Available Seats: {schedule.availableSeats}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <i className="fas fa-dollar-sign"></i>
                      <span className="price">Price: ${route?.price || '25.00'}</span>
                    </div>
                  </div>
                  <div className="schedule-actions">
                    <button
                      className="btn btn-primary btn-large"
                      onClick={() => handleBookTicket(schedule)}
                    >
                      <i className="fas fa-ticket-alt"></i> Book This Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !loading && (
            <div className="no-data">
              <i className="fas fa-calendar-times"></i>
              <h3>No Schedules Available</h3>
              <p>There are currently no schedules available for this route.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate("/user/routes")}
              >
                <i className="fas fa-route"></i> Browse Other Routes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewSchedules;