import React, { useState, useEffect } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./stylings/AssignExistingSchedule.css";

function AssignExistingSchedule() {
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const navigate = useNavigate();

  // Fetch all routes and schedules on component mount
  useEffect(() => {
    ApiService.getRoutes()
      .then((data) => setRoutes(data))
      .catch(() => toast.error("Failed to fetch routes."));

    ApiService.getSchedules()
      .then((data) => setSchedules(data))
      .catch(() => toast.error("Failed to fetch schedules."));
  }, []);

  const handleAssign = () => {
    if (!selectedRoute || !selectedSchedule) {
      toast.error("Please select both a route and a schedule.");
      return;
    }

    // Simulate assigning the schedule to the route
    const updatedSchedules = JSON.parse(localStorage.getItem("assignedSchedules")) || {};
    if (!updatedSchedules[selectedRoute]) {
      updatedSchedules[selectedRoute] = [];
    }
    updatedSchedules[selectedRoute].push(
      schedules.find((schedule) => schedule.id === parseInt(selectedSchedule))
    );

    // Save the updated schedules in localStorage
    localStorage.setItem("assignedSchedules", JSON.stringify(updatedSchedules));
    toast.success("Schedule assigned to route successfully!");
    navigate("/admin/schedules"); // Redirect to the schedules page
  };

  return (
    <div className="container mt-5">
      <h2>Assign Existing Schedule to Route</h2>
      <div className="mb-3">
        <label className="form-label">Select Route</label>
        <select
          className="form-control"
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
        >
          <option value="">Select a Route</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.startPoint} → {route.endPoint}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Select Schedule</label>
        <select
          className="form-control"
          value={selectedSchedule}
          onChange={(e) => setSelectedSchedule(e.target.value)}
        >
          <option value="">Select a Schedule</option>
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.departureTime} → {schedule.arrivalTime} ({schedule.frequency})
            </option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary" onClick={handleAssign}>
        Assign Schedule
      </button>
    </div>
  );
}

export default AssignExistingSchedule;