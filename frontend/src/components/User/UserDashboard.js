import React, { useEffect, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
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
  const navigate = useNavigate();

  // Fetch routes on component mount
  useEffect(() => {
    setLoading(true);
    ApiService.getRoutes()
      .then((data) => setRoutes(data))
      .catch(() => toast.error("Failed to fetch routes."))
      .finally(() => setLoading(false));
  }, []);

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

  // Monitor changes in localStorage and update schedules dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      if (selectedRoute) {
        const assignedSchedules = JSON.parse(localStorage.getItem("assignedSchedules")) || {};
        const routeSchedules = assignedSchedules[selectedRoute.id] || [];
        setSchedules(routeSchedules);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [selectedRoute, selectedRoute?.routeName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket({ ...ticket, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate user input
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
    if (!availableSeats.includes(Number(ticket.seatNumber))) {
      toast.error("Selected seat is not available.");
      return;
    }

    const ticketData = {
      ...ticket,
      routeName: selectedRoute.routeName,
      travelDateTime: selectedRoute.departureTime,
    };

    setLoading(true);
    ApiService.bookTicket(ticketData)
      .then(() => {
        toast.success("Ticket booked successfully!");
        setShowBookingForm(false);
        setTicket({
          passengerName: "",
          email: "",
          phoneNumber: "",
          seatNumber: "",
          price: 0,
        });

        // Refresh available seats
        ApiService.getAvailableSeats(selectedRoute.routeName, selectedRoute.departureTime)
          .then((data) => setAvailableSeats(data))
          .catch(() => toast.error("Failed to refresh seat availability."));
      })
      .catch(() => toast.error("Failed to book ticket. Please try again."))
      .finally(() => setLoading(false));
  };

  // Fetch schedules for the selected route
  const fetchSchedulesForRoute = (route) => {
    const assignedSchedules = JSON.parse(localStorage.getItem("assignedSchedules")) || {};
    let routeSchedules = assignedSchedules[route.id] || [];

    // Simulate a schedule if no schedules are found
    if (routeSchedules.length === 0) {
      routeSchedules = [
        {
          id: 999, // Temporary ID for the simulated schedule
          departureTime: "14:27:00",
          arrivalTime: "13:27:00",
          frequency: "Weekly",
        },
      ];
      toast.info("No schedules found. Displaying a simulated schedule.");
    }

    // Update the state immediately
    setSelectedRoute(route);
    setSchedules(routeSchedules);
  };

  return (
    <div className="container mt-5">
      <Navbar />
      <h1>Available Routes</h1>
      {loading && <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Start Point</th>
            <th>End Point</th>
            <th>Intermediate Stops</th>
            <th>Distance (km)</th>
            <th>Estimated Travel Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.length > 0 ? (
            routes.map((route) => (
              <tr key={route.id}>
                <td>{route.startPoint}</td>
                <td>{route.endPoint}</td>
                <td>{route.intermediateStops}</td>
                <td>{route.distance}</td>
                <td>{route.estimatedTravelTime}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchSchedulesForRoute(route)}
                  >
                    View Schedules
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} align="center">
                No routes available. Please check back later.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedRoute && (
        <>
          <h2>Schedules for {selectedRoute.startPoint} to {selectedRoute.endPoint}</h2>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Departure Time</th>
                <th>Arrival Time</th>
                <th>Frequency</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((schedule, index) => (
                  <tr key={index}>
                    <td>{schedule.departureTime}</td>
                    <td>{schedule.arrivalTime}</td>
                    <td>{schedule.frequency}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} align="center">
                    No schedules available for this route.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {showBookingForm && (
        <div className="mt-5">
          <h2>Book Ticket</h2>
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
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Book Ticket
            </button>
          </form>
        </div>
      )}
      <button
        className="btn btn-primary"
        onClick={() => navigate("/user/book-ticket")}
      >
        Book a Ticket
      </button>
    </div>
  );
}

export default UserDashboard;