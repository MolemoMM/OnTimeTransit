import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import Navbar from "../Navbar";
import "./userPages.css";

function BookTicket() {
  const location = useLocation();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(location.state?.selectedRoute || null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(location.state?.schedule || null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(selectedRoute ? (selectedSchedule ? 3 : 2) : 1);
  
  const [ticket, setTicket] = useState({
    passengerName: "",
    email: "",
    phoneNumber: "",
    seatNumber: "",
    price: 25.00,
  });

  // Fetch routes on component mount
  useEffect(() => {
    if (bookingStep === 1) {
      setLoading(true);
      ApiService.getRoutes()
        .then((data) => setRoutes(data))
        .catch(() => toast.error("Failed to fetch routes."))
        .finally(() => setLoading(false));
    }
  }, [bookingStep]);

  // Fetch schedules when route is selected
  useEffect(() => {
    if (selectedRoute && bookingStep === 2) {
      setLoading(true);
      ApiService.getSchedulesByRoute(selectedRoute.id)
        .then((data) => setSchedules(data))
        .catch(() => toast.error("Failed to fetch schedules."))
        .finally(() => setLoading(false));
    }
  }, [selectedRoute, bookingStep]);

  // Fetch available seats when schedule is selected
  useEffect(() => {
    if (selectedSchedule && bookingStep === 3) {
      setLoading(true);
      // Generate dummy seats for demo
      const seats = Array.from({ length: 40 }, (_, i) => i + 1);
      const bookedSeats = [5, 12, 18, 23, 31, 37]; // Some dummy booked seats
      const available = seats.filter(seat => !bookedSeats.includes(seat));
      setAvailableSeats(available);
      setLoading(false);
    }
  }, [selectedSchedule, bookingStep]);

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setBookingStep(2);
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    setBookingStep(3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicket(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookTicket = async (e) => {
    e.preventDefault();
    
    if (!ticket.passengerName.trim()) {
      toast.error("Passenger name is required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(ticket.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(ticket.phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!ticket.seatNumber) {
      toast.error("Please select a seat.");
      return;
    }

    setLoading(true);
    try {
      await ApiService.createTicket({
        ...ticket,
        routeName: selectedRoute.routeName || selectedRoute.name,
        departureTime: selectedSchedule.departureTime,
        arrivalTime: selectedSchedule.arrivalTime,
      });
      toast.success("Ticket booked successfully!");
      navigate("/user", { state: { activeSection: 'tickets' } });
    } catch (error) {
      toast.error("Failed to book ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (bookingStep === 1) {
      return (
        <div className="step-content">
          <div className="step-header">
            <h2><i className="fas fa-route"></i> Select Route</h2>
            <p>Choose your departure and destination</p>
          </div>
          <div className="routes-grid">
            {routes.map((route, index) => (
              <div key={index} className="route-selection-card" onClick={() => handleRouteSelect(route)}>
                <div className="route-info">
                  <h4>{route.routeName || route.name}</h4>
                  <div className="route-details">
                    <span><i className="fas fa-map-marker-alt"></i> From: {route.source || route.startLocation}</span>
                    <span><i className="fas fa-map-marker-alt"></i> To: {route.destination || route.endLocation}</span>
                    <span><i className="fas fa-road"></i> Distance: {route.distance || 'N/A'} km</span>
                    <span><i className="fas fa-clock"></i> Duration: {route.estimatedTravelTime || 'N/A'}</span>
                  </div>
                </div>
                <div className="route-price">
                  <span>${route.price || '25.00'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (bookingStep === 2) {
      return (
        <div className="step-content">
          <div className="step-header">
            <h2><i className="fas fa-calendar-alt"></i> Select Schedule</h2>
            <p>Choose your preferred departure time</p>
            <div className="selected-route-info">
              <span><i className="fas fa-route"></i> {selectedRoute.routeName || selectedRoute.name}</span>
              <button className="btn-link" onClick={() => setBookingStep(1)}>
                <i className="fas fa-edit"></i> Change Route
              </button>
            </div>
          </div>
          <div className="schedules-grid">
            {schedules.length > 0 ? schedules.map((schedule, index) => (
              <div key={index} className="schedule-card" onClick={() => handleScheduleSelect(schedule)}>
                <div className="schedule-time">
                  <div className="departure">
                    <i className="fas fa-plane-departure"></i>
                    <span>Departure</span>
                    <strong>{schedule.departureTime}</strong>
                  </div>
                  <div className="arrival">
                    <i className="fas fa-plane-arrival"></i>
                    <span>Arrival</span>
                    <strong>{schedule.arrivalTime}</strong>
                  </div>
                </div>
                <div className="schedule-info">
                  <span><i className="fas fa-sync-alt"></i> {schedule.frequency}</span>
                </div>
              </div>
            )) : (
              <div className="no-data">
                <i className="fas fa-calendar-times"></i>
                <h3>No Schedules Available</h3>
                <p>There are no schedules available for this route.</p>
                <button className="btn btn-primary" onClick={() => setBookingStep(1)}>
                  <i className="fas fa-arrow-left"></i> Select Different Route
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (bookingStep === 3) {
      return (
        <div className="step-content">
          <div className="step-header">
            <h2><i className="fas fa-user-plus"></i> Passenger Details & Seat Selection</h2>
            <p>Complete your booking information</p>
            <div className="booking-summary">
              <div className="summary-item">
                <span><i className="fas fa-route"></i> Route:</span>
                <span>{selectedRoute.routeName || selectedRoute.name}</span>
              </div>
              <div className="summary-item">
                <span><i className="fas fa-clock"></i> Departure:</span>
                <span>{selectedSchedule.departureTime}</span>
              </div>
              <button className="btn-link" onClick={() => setBookingStep(2)}>
                <i className="fas fa-edit"></i> Change Schedule
              </button>
            </div>
          </div>
          
          <div className="booking-form-container">
            <form onSubmit={handleBookTicket} className="booking-form">
              <div className="form-section">
                <h3><i className="fas fa-user"></i> Passenger Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label><i className="fas fa-user"></i> Full Name</label>
                    <input
                      type="text"
                      name="passengerName"
                      value={ticket.passengerName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-envelope"></i> Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={ticket.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><i className="fas fa-phone"></i> Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={ticket.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit phone number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-dollar-sign"></i> Price</label>
                    <input
                      type="number"
                      name="price"
                      value={ticket.price}
                      onChange={handleInputChange}
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3><i className="fas fa-chair"></i> Seat Selection</h3>
                <div className="seat-selection">
                  <div className="seat-legend">
                    <div className="legend-item">
                      <div className="seat-icon available"></div>
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <div className="seat-icon selected"></div>
                      <span>Selected</span>
                    </div>
                    <div className="legend-item">
                      <div className="seat-icon booked"></div>
                      <span>Booked</span>
                    </div>
                  </div>
                  <div className="seats-grid">
                    {Array.from({ length: 40 }, (_, i) => i + 1).map(seatNum => {
                      const isAvailable = availableSeats.includes(seatNum);
                      const isSelected = ticket.seatNumber === seatNum.toString();
                      return (
                        <button
                          key={seatNum}
                          type="button"
                          className={`seat ${isAvailable ? 'available' : 'booked'} ${isSelected ? 'selected' : ''}`}
                          onClick={() => isAvailable && setTicket(prev => ({ ...prev, seatNumber: seatNum.toString() }))}
                          disabled={!isAvailable}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setBookingStep(2)}>
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || !ticket.seatNumber}>
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Booking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="user-page">
      <Navbar />
      
      <div className="page-container">
        <div className="page-header">
          <div className="breadcrumb">
            <span onClick={() => navigate("/user")}><i className="fas fa-home"></i> Dashboard</span>
            <i className="fas fa-chevron-right"></i>
            <span>Book Ticket</span>
          </div>
          <h1 className="page-title">
            <i className="fas fa-ticket-alt"></i> Book Your Journey
          </h1>
          <p className="page-subtitle">
            Reserve your seat in just a few simple steps
          </p>
        </div>

        <div className="booking-steps">
          <div className={`step ${bookingStep >= 1 ? 'active' : ''} ${bookingStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Select Route</span>
          </div>
          <div className={`step ${bookingStep >= 2 ? 'active' : ''} ${bookingStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Choose Schedule</span>
          </div>
          <div className={`step ${bookingStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Book Ticket</span>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading...</p>
            </div>
          </div>
        )}

        {renderStepContent()}
      </div>
    </div>
  );
}

export default BookTicket;
