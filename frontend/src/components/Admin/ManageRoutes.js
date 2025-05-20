/*import React, { useEffect, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import { useData } from "../../context/DataContext";

function ManageRoutes() {
  const { routes, setRoutes } = useData(); // Destructure both routes and setRoutes
  const [newRoute, setNewRoute] = useState({
    startPoint: "",
    endPoint: "",
    intermediateStops: "",
    distance: "",
    estimatedTravelTime: "",
  });
  const [error, setError] = useState(null);

  // Fetch routes on component mount
  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await ApiService.getRoutes();
      setRoutes(data); // Ensure this updates the state
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch routes.");
    }
  };

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

  // Handle deleting a route
  const handleDeleteRoute = async (routeId) => {
    try {
      await ApiService.deleteRoute(routeId);
      toast.success("Route deleted successfully!");
      setRoutes((prevRoutes) => prevRoutes.filter((route) => route.id !== routeId)); // Optimistic update
    } catch (err) {
      setError(err.message);
      toast.error("Failed to delete route.");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Manage Routes</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Add Route Form }
  

      {/* Routes Table }
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Start Point</TableCell>
              <TableCell>End Point</TableCell>
              <TableCell>Intermediate Stops</TableCell>
              <TableCell>Distance (km)</TableCell>
              <TableCell>Estimated Travel Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.length > 0 ? (
              routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.startPoint}</TableCell>
                  <TableCell>{route.endPoint}</TableCell>
                  <TableCell>{route.intermediateStops}</TableCell>
                  <TableCell>{route.distance}</TableCell>
                  <TableCell>{route.estimatedTravelTime}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteRoute(route.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No routes available. Add a new route to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default ManageRoutes;*/

import React, { useEffect, useState, useCallback } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import { useData } from "../../context/DataContext";

function ManageRoutes() {
  const { routes, setRoutes } = useData();
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [editedRoute, setEditedRoute] = useState({
    startPoint: "",
    endPoint: "",
    intermediateStops: "",
    distance: "",
    estimatedTravelTime: "",
  });
  const [error, setError] = useState(null);

  // Wrap fetchRoutes in useCallback
  const fetchRoutes = useCallback(async () => {
    try {
      const data = await ApiService.getRoutes();
      setRoutes(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch routes.");
    }
  }, [setRoutes]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleEditClick = (route) => {
    setEditingRouteId(route.id);
    setEditedRoute({ ...route });
  };

  const handleCancelEdit = () => {
    setEditingRouteId(null);
    setEditedRoute({
      startPoint: "",
      endPoint: "",
      intermediateStops: "",
      distance: "",
      estimatedTravelTime: "",
    });
  };

  /*const handleSaveEdit = async () => {
    try {
      // Call the API to update the route in the backend
      const updatedRoute = await ApiService.updateRoute(editingRouteId, editedRoute);
  
      // Update the frontend state with the updated route
      setRoutes((prevRoutes) =>
        prevRoutes.map((route) =>
          route.id === editingRouteId ? updatedRoute : route
        )
      );
  
      toast.success("Route updated successfully!");
      handleCancelEdit(); // Exit edit mode
    } catch (err) {
      toast.error("Failed to update route. Please try again.");
      console.error("Error updating route:", err);
    }
  };*/

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Authorization Token:", token);
  
      const updatedRoute = await ApiService.updateRoute(editingRouteId, editedRoute);
      setRoutes((prevRoutes) =>
        prevRoutes.map((route) =>
          route.id === editingRouteId ? updatedRoute : route
        )
      );
      toast.success("Route updated successfully!");
      handleCancelEdit();
    } catch (err) {
      console.error("Error updating route:", err);
      toast.error("Failed to update route. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedRoute({ ...editedRoute, [name]: value });
  };

  const handleDeleteRoute = async (routeId) => {
    try {
      await ApiService.deleteRoute(routeId);
      toast.success("Route deleted successfully!");
      setRoutes((prevRoutes) => prevRoutes.filter((route) => route.id !== routeId));
    } catch (err) {
      setError(err.message);
      toast.error("Failed to delete route.");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Manage Routes</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Start Point</TableCell>
              <TableCell>End Point</TableCell>
              <TableCell>Intermediate Stops</TableCell>
              <TableCell>Distance (km)</TableCell>
              <TableCell>Estimated Travel Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.length > 0 ? (
              routes.map((route) => (
                <TableRow key={route.id}>
                  {editingRouteId === route.id ? (
                    <>
                      <TableCell>
                        <TextField
                          name="startPoint"
                          value={editedRoute.startPoint}
                          onChange={handleChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="endPoint"
                          value={editedRoute.endPoint}
                          onChange={handleChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="intermediateStops"
                          value={editedRoute.intermediateStops}
                          onChange={handleChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="distance"
                          type="number"
                          value={editedRoute.distance}
                          onChange={handleChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="estimatedTravelTime"
                          value={editedRoute.estimatedTravelTime}
                          onChange={handleChange}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSaveEdit}
                        >
                          Save
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleCancelEdit}
                          className="ms-2"
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{route.startPoint}</TableCell>
                      <TableCell>{route.endPoint}</TableCell>
                      <TableCell>{route.intermediateStops}</TableCell>
                      <TableCell>{route.distance}</TableCell>
                      <TableCell>{route.estimatedTravelTime}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleEditClick(route)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteRoute(route.id)}
                          className="ms-2"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No routes available. Add a new route to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default ManageRoutes;