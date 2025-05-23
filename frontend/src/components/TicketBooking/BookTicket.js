import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ApiService } from "../../services/ApiService";

function BookTicket() {
  const location = useLocation();
  const preselectedRoute = location.state?.route;

  const [ticket, setTicket] = useState({
    passengerName: "",
    email: "",
    phoneNumber: "",
    routeId: preselectedRoute ? preselectedRoute.id : "",
    routeName: preselectedRoute ? `${preselectedRoute.startPoint} - ${preselectedRoute.endPoint}` : "",
    travelDateTime: "",
    seatNumber: "",
    price: 0,
  });
  const [routes, setRoutes] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch available routes on component mount
  useEffect(() => {
    setLoading(true);
    ApiService.getRoutes()
      .then((data) => setRoutes(data))
      .catch((error) => toast.error("Failed to fetch routes."))
      .finally(() => setLoading(false));
  }, []);

  // Fetch available seats when a route is selected
  useEffect(() => {
    if (ticket.routeId && ticket.routeName && ticket.travelDateTime) {
      ApiService.getAvailableSeats(ticket.routeName, ticket.travelDateTime)
        .then((data) => setAvailableSeats(data))
        .catch((error) => toast.error("Failed to fetch seat availability."));
    }
  }, [ticket.routeId, ticket.routeName, ticket.travelDateTime]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket({ ...ticket, [name]: value });

    // Update routeName when routeId changes
    if (name === "routeId") {
      const selectedRoute = routes.find((route) => route.id === Number(value));
      if (selectedRoute) {
        setTicket((prev) => ({
          ...prev,
          routeName: `${selectedRoute.startPoint} - ${selectedRoute.endPoint}`,
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const ticketData = {
      passengerName: ticket.passengerName,
      email: ticket.email,
      phoneNumber: ticket.phoneNumber,
      routeName: ticket.routeName, // Ensure routeName is included
      travelDateTime: ticket.travelDateTime,
      seatNumber: ticket.seatNumber,
      price: ticket.price,
    };

    ApiService.bookTicket(ticketData)
      .then(() => {
        toast.success("Ticket booked successfully!");
        navigate("/user/tickets");
      })
      .catch((error) => {
        toast.error("Failed to book ticket. Please try again.");
        console.error("Error booking ticket:", error);
      });
  };

  return (
    <div className="container mt-5">
      <h2>Book Ticket</h2>
      {loading && (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Passenger Name</label>
          <input
            type="text"
            className="form-control"
            name="passengerName"
            value={ticket.passengerName}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={ticket.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            className="form-control"
            name="phoneNumber"
            value={ticket.phoneNumber}
            onChange={handleChange}
            required
            placeholder="Enter your 10-digit phone number"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Route</label>
          <select
            className="form-control"
            name="routeId"
            value={ticket.routeId}
            onChange={handleChange}
            required
          >
            <option value="">Select a Route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.startPoint} - {route.endPoint}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Travel Date and Time</label>
          <input
            type="datetime-local"
            className="form-control"
            name="travelDateTime"
            value={ticket.travelDateTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Seat Number</label>
          <select
            className="form-control"
            name="seatNumber"
            value={ticket.seatNumber}
            onChange={handleChange}
            required
          >
            <option value="">Select a Seat</option>
            {availableSeats.map((seat) => (
              <option key={seat} value={seat}>
                {seat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={ticket.price}
            onChange={handleChange}
            required
            placeholder="Enter ticket price"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Booking..." : "Book Ticket"}
        </button>
      </form>
    </div>
  );
}

export default BookTicket;