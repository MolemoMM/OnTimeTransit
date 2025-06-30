/*import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ApiService } from "../../services/ApiService";
import { useForm } from "react-hook-form";

function AddRoute() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    ApiService.addRoute(data)
      .then(() => {
        toast.success("Route added successfully!");
        navigate("/admin/routes"); // Redirect to the route list page
      })
      .catch((error) => {
        toast.error("Failed to add route. Please try again.");
        console.error("Error adding route:", error);
      });
  };

  return (
    <div className="container mt-5">
      <h2>Add Route</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Start Point</label>
          <input
            type="text"
            className="form-control"
            {...register("startPoint", { required: "Start Point is required" })}
          />
          {errors.startPoint && <p className="text-danger">{errors.startPoint.message}</p>}
        </div>
        <div className="mb-3">
          <label className="form-label">End Point</label>
          <input
            type="text"
            className="form-control"
            {...register("endPoint", { required: "End Point is required" })}
          />
          {errors.endPoint && <p className="text-danger">{errors.endPoint.message}</p>}
        </div>
        <div className="mb-3">
          <label className="form-label">Intermediate Stops</label>
          <input
            type="text"
            className="form-control"
            {...register("intermediateStops")}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Distance (km)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            {...register("distance", { required: "Distance is required" })}
          />
          {errors.distance && <p className="text-danger">{errors.distance.message}</p>}
        </div>
        <div className="mb-3">
          <label className="form-label">Estimated Travel Time</label>
          <input
            type="text"
            className="form-control"
            {...register("estimatedTravelTime", { required: "Estimated Travel Time is required" })}
          />
          {errors.estimatedTravelTime && <p className="text-danger">{errors.estimatedTravelTime.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary">
          Add Route
        </button>
      </form>
    </div>
  );
}*/
import React, { useEffect, useState, useCallback } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import {
  Button,
  TextField,
} from "@mui/material";
import { useData } from "../../context/DataContext";

function AddRoute() {
  const { setRoutes, routes } = useData();
  const [newRoute, setNewRoute] = useState({
    startPoint: "",
    endPoint: "",
    intermediateStops: "",
    distance: "",
    estimatedTravelTime: "",
  });
  const [error, setError] = useState(null);

  // Fetch routes on component mount
  const fetchRoutes = useCallback(async () => {
    try {
      const data = await ApiService.getRoutes();
      setRoutes(data); // Ensure this updates the state
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch routes.");
    }
  }, [setRoutes]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Handle adding a new route
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(newRoute); // Log the route data to verify
    try {
      await ApiService.addRoute(newRoute); // Add the new route
      toast.success("Route added successfully!");
      await fetchRoutes(); // Refresh the list of routes after adding
      setNewRoute({
        startPoint: "",
        endPoint: "",
        intermediateStops: "",
        distance: "",
        estimatedTravelTime: "",
      }); // Reset the form fields
    } catch (err) {
      setError(err.message);
      toast.error("Failed to add route. Please try again.");
      console.error("Error adding route:", err);
    }
  };

  // Add these handlers to avoid ESLint errors
  const handleEdit = (id) => {
    // TODO: Implement edit functionality
    toast.info("Edit functionality coming soon!");
  };

  const handleDelete = async (id) => {
    try {
      await ApiService.deleteRoute(id);
      toast.success("Route deleted successfully!");
      await fetchRoutes();
    } catch (err) {
      toast.error("Failed to delete route.");
      console.error("Error deleting route:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Manage Routes</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Add Route Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <TextField
            label="Start Point"
            variant="outlined"
            fullWidth
            value={newRoute.startPoint}
            onChange={(e) => setNewRoute({ ...newRoute, startPoint: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <TextField
            label="End Point"
            variant="outlined"
            fullWidth
            value={newRoute.endPoint}
            onChange={(e) => setNewRoute({ ...newRoute, endPoint: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <TextField
            label="Intermediate Stops"
            variant="outlined"
            fullWidth
            value={newRoute.intermediateStops}
            onChange={(e) => setNewRoute({ ...newRoute, intermediateStops: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <TextField
            label="Distance (km)"
            variant="outlined"
            fullWidth
            type="number"
            value={newRoute.distance}
            onChange={(e) => setNewRoute({ ...newRoute, distance: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <TextField
            label="Estimated Travel Time"
            variant="outlined"
            fullWidth
            value={newRoute.estimatedTravelTime}
            onChange={(e) =>
              setNewRoute({ ...newRoute, estimatedTravelTime: e.target.value })
            }
            required
          />
        </div>
        <Button type="submit" variant="contained" color="primary">
          Add Route
        </Button>
      </form>

      {/* Routes Table */}
      <div className="add-route-table-wrapper">
        <table className="add-route-table" aria-label="Routes Table">
          <thead>
            <tr>
              <th>Start Point<span style={{ color: "#ff5252" }}>*</span></th>
              <th>End Point<span style={{ color: "#ff5252" }}>*</span></th>
              <th>Intermediate Stops</th>
              <th>Distance (km)<span style={{ color: "#ff5252" }}>*</span></th>
              <th>Estimated Travel Time<span style={{ color: "#ff5252" }}>*</span></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id}>
                <td title={route.startPoint}>{route.startPoint}</td>
                <td title={route.endPoint}>{route.endPoint}</td>
                <td title={route.intermediateStops}>{route.intermediateStops}</td>
                <td>{route.distance}</td>
                <td>{route.estimatedTravelTime}</td>
                <td>
                  <button
                    className="btn btn-primary route-action-btn"
                    onClick={() => handleEdit(route.id)}
                    aria-label="Edit Route"
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger route-action-btn"
                    onClick={() => handleDelete(route.id)}
                    aria-label="Delete Route"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddRoute;