import React, { useEffect, useState, useCallback } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
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
  const [newRoute, setNewRoute] = useState({
    startPoint: "",
    endPoint: "",
    intermediateStops: "",
    distance: "",
    estimatedTravelTime: "",
  });
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Wrap fetchRoutes in useCallback
  const fetchRoutes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getRoutes();
      setRoutes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch routes.");
    } finally {
      setIsLoading(false);
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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedRoute({ ...editedRoute, [name]: value });
  };

  const handleNewRouteChange = (e) => {
    const { name, value } = e.target;
    setNewRoute({ ...newRoute, [name]: value });
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await ApiService.addRoute(newRoute);
      toast.success("Route added successfully!");
      await fetchRoutes();
      setNewRoute({
        startPoint: "",
        endPoint: "",
        intermediateStops: "",
        distance: "",
        estimatedTravelTime: "",
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to add route. Please try again.");
      console.error("Error adding route:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm("Are you sure you want to delete this route?")) {
      return;
    }
    
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
    <div style={{ padding: '24px' }}>
      <div className="modern-card">
        <div className="modern-card-header">
          <h2 className="modern-card-title">
            <i className="fas fa-route" style={{ marginRight: '12px', color: '#667eea' }}></i>
            Manage Routes
          </h2>
          <button 
            className="modern-btn modern-btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isLoading}
          >
            <i className="fas fa-plus"></i>
            {showAddForm ? 'Cancel' : 'Add New Route'}
          </button>
        </div>

        {error && (
          <div style={{ 
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)', 
            color: '#b91c1c', 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            border: '1px solid #fca5a5'
          }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            {error}
          </div>
        )}

        {/* Add New Route Form */}
        {showAddForm && (
          <div className="modern-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
            <h3 style={{ marginBottom: '20px', color: '#1e40af' }}>
              <i className="fas fa-plus-circle" style={{ marginRight: '8px' }}></i>
              Add New Route
            </h3>
            <form onSubmit={handleAddRoute}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="modern-form-group">
                  <label className="modern-label">Start Point</label>
                  <input
                    type="text"
                    name="startPoint"
                    value={newRoute.startPoint}
                    onChange={handleNewRouteChange}
                    className="modern-input"
                    placeholder="Enter start point"
                    required
                  />
                </div>
                <div className="modern-form-group">
                  <label className="modern-label">End Point</label>
                  <input
                    type="text"
                    name="endPoint"
                    value={newRoute.endPoint}
                    onChange={handleNewRouteChange}
                    className="modern-input"
                    placeholder="Enter end point"
                    required
                  />
                </div>
                <div className="modern-form-group">
                  <label className="modern-label">Intermediate Stops</label>
                  <input
                    type="text"
                    name="intermediateStops"
                    value={newRoute.intermediateStops}
                    onChange={handleNewRouteChange}
                    className="modern-input"
                    placeholder="Enter stops (comma separated)"
                  />
                </div>
                <div className="modern-form-group">
                  <label className="modern-label">Distance (km)</label>
                  <input
                    type="number"
                    name="distance"
                    value={newRoute.distance}
                    onChange={handleNewRouteChange}
                    className="modern-input"
                    placeholder="Enter distance"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
                <div className="modern-form-group">
                  <label className="modern-label">Estimated Travel Time</label>
                  <input
                    type="text"
                    name="estimatedTravelTime"
                    value={newRoute.estimatedTravelTime}
                    onChange={handleNewRouteChange}
                    className="modern-input"
                    placeholder="e.g., 2h 30m"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="modern-btn modern-btn-success"
                  disabled={isLoading}
                >
                  <i className="fas fa-save"></i>
                  {isLoading ? 'Adding...' : 'Add Route'}
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn-danger"
                  onClick={() => setShowAddForm(false)}
                  disabled={isLoading}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Routes Table */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#667eea' }}></i>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading routes...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>
                    <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>
                    Start Point
                  </th>
                  <th>
                    <i className="fas fa-flag-checkered" style={{ marginRight: '8px' }}></i>
                    End Point
                  </th>
                  <th>
                    <i className="fas fa-map-signs" style={{ marginRight: '8px' }}></i>
                    Intermediate Stops
                  </th>
                  <th>
                    <i className="fas fa-ruler" style={{ marginRight: '8px' }}></i>
                    Distance (km)
                  </th>
                  <th>
                    <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
                    Travel Time
                  </th>
                  <th>
                    <i className="fas fa-cog" style={{ marginRight: '8px' }}></i>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {routes.length > 0 ? (
                  routes.map((route) => (
                    <tr key={route.id}>
                      {editingRouteId === route.id ? (
                        // Edit mode
                        <>
                          <td>
                            <input
                              type="text"
                              name="startPoint"
                              value={editedRoute.startPoint}
                              onChange={handleEditChange}
                              className="modern-input"
                              style={{ margin: 0, padding: '8px 12px', fontSize: '14px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="endPoint"
                              value={editedRoute.endPoint}
                              onChange={handleEditChange}
                              className="modern-input"
                              style={{ margin: 0, padding: '8px 12px', fontSize: '14px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="intermediateStops"
                              value={editedRoute.intermediateStops}
                              onChange={handleEditChange}
                              className="modern-input"
                              style={{ margin: 0, padding: '8px 12px', fontSize: '14px' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="distance"
                              value={editedRoute.distance}
                              onChange={handleEditChange}
                              className="modern-input"
                              style={{ margin: 0, padding: '8px 12px', fontSize: '14px' }}
                              step="0.1"
                              min="0"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="estimatedTravelTime"
                              value={editedRoute.estimatedTravelTime}
                              onChange={handleEditChange}
                              className="modern-input"
                              style={{ margin: 0, padding: '8px 12px', fontSize: '14px' }}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                className="modern-btn modern-btn-success"
                                onClick={handleSaveEdit}
                                style={{ padding: '8px 16px', fontSize: '12px' }}
                              >
                                <i className="fas fa-save"></i>
                                Save
                              </button>
                              <button
                                className="modern-btn modern-btn-warning"
                                onClick={handleCancelEdit}
                                style={{ padding: '8px 16px', fontSize: '12px' }}
                              >
                                <i className="fas fa-times"></i>
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td>{route.startPoint}</td>
                          <td>{route.endPoint}</td>
                          <td>{route.intermediateStops || 'None'}</td>
                          <td>{route.distance}</td>
                          <td>{route.estimatedTravelTime}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                className="modern-btn modern-btn-primary"
                                onClick={() => handleEditClick(route)}
                                style={{ padding: '8px 16px', fontSize: '12px' }}
                              >
                                <i className="fas fa-edit"></i>
                                Edit
                              </button>
                              <button
                                className="modern-btn modern-btn-danger"
                                onClick={() => handleDeleteRoute(route.id)}
                                style={{ padding: '8px 16px', fontSize: '12px' }}
                              >
                                <i className="fas fa-trash"></i>
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      <i className="fas fa-route" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
                      <br />
                      No routes available. Click "Add New Route" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageRoutes;
