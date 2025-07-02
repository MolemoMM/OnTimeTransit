import React, { useState, useEffect } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AssignExistingSchedule() {
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assignedSchedules, setAssignedSchedules] = useState({});
  const navigate = useNavigate();

  // Fetch all routes and schedules on component mount
  useEffect(() => {
    fetchData();
    loadAssignedSchedules();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [routesData, schedulesData] = await Promise.all([
        ApiService.getRoutes(),
        ApiService.getSchedules()
      ]);
      setRoutes(routesData);
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch routes and schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssignedSchedules = () => {
    const existing = JSON.parse(localStorage.getItem("assignedSchedules")) || {};
    setAssignedSchedules(existing);
  };

  const handleAssign = () => {
    if (!selectedRoute || !selectedSchedule) {
      toast.error("Please select both a route and a schedule.");
      return;
    }

    // Check if this schedule is already assigned to this route
    const existingAssignments = assignedSchedules[selectedRoute] || [];
    const isAlreadyAssigned = existingAssignments.some(
      (schedule) => schedule.id === parseInt(selectedSchedule)
    );

    if (isAlreadyAssigned) {
      toast.error("This schedule is already assigned to the selected route.");
      return;
    }

    // Simulate assigning the schedule to the route
    const updatedSchedules = { ...assignedSchedules };
    if (!updatedSchedules[selectedRoute]) {
      updatedSchedules[selectedRoute] = [];
    }
    
    const scheduleToAssign = schedules.find((schedule) => schedule.id === parseInt(selectedSchedule));
    updatedSchedules[selectedRoute].push(scheduleToAssign);

    // Save the updated schedules in localStorage
    localStorage.setItem("assignedSchedules", JSON.stringify(updatedSchedules));
    setAssignedSchedules(updatedSchedules);
    
    toast.success("Schedule assigned to route successfully!");
    
    // Reset selections
    setSelectedRoute("");
    setSelectedSchedule("");
  };

  const handleRemoveAssignment = (routeId, scheduleId) => {
    if (!window.confirm("Are you sure you want to remove this schedule assignment?")) {
      return;
    }

    const updatedSchedules = { ...assignedSchedules };
    if (updatedSchedules[routeId]) {
      updatedSchedules[routeId] = updatedSchedules[routeId].filter(
        (schedule) => schedule.id !== scheduleId
      );
      
      // Remove the route entry if no schedules remain
      if (updatedSchedules[routeId].length === 0) {
        delete updatedSchedules[routeId];
      }
    }

    localStorage.setItem("assignedSchedules", JSON.stringify(updatedSchedules));
    setAssignedSchedules(updatedSchedules);
    toast.success("Schedule assignment removed successfully!");
  };

  const getRouteDisplayName = (routeId) => {
    const route = routes.find((r) => r.id === parseInt(routeId));
    return route ? `${route.startPoint} → ${route.endPoint}` : `Route ${routeId}`;
  };

  return (
    <div style={{ padding: '24px' }}>
      <div className="modern-card">
        <div className="modern-card-header">
          <h2 className="modern-card-title">
            <i className="fas fa-calendar-check" style={{ marginRight: '12px', color: '#667eea' }}></i>
            Schedule Management
          </h2>
          <button 
            className="modern-btn modern-btn-primary"
            onClick={fetchData}
            disabled={isLoading}
          >
            <i className="fas fa-sync-alt"></i>
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>

        {/* Assign New Schedule */}
        <div className="modern-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
          <h3 style={{ marginBottom: '20px', color: '#1e40af' }}>
            <i className="fas fa-plus-circle" style={{ marginRight: '8px' }}></i>
            Assign Schedule to Route
          </h3>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '20px', color: '#667eea' }}></i>
              <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading data...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="modern-form-group">
                <label className="modern-label">
                  <i className="fas fa-route" style={{ marginRight: '8px' }}></i>
                  Select Route
                </label>
                <select
                  className="modern-select"
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                >
                  <option value="">Choose a route...</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.startPoint} → {route.endPoint} ({route.distance}km)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="modern-form-group">
                <label className="modern-label">
                  <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
                  Select Schedule
                </label>
                <select
                  className="modern-select"
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                >
                  <option value="">Choose a schedule...</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.departureTime} → {schedule.arrivalTime} ({schedule.frequency})
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <button 
                  className="modern-btn modern-btn-success"
                  onClick={handleAssign}
                  disabled={!selectedRoute || !selectedSchedule || isLoading}
                  style={{ width: '100%' }}
                >
                  <i className="fas fa-check"></i>
                  Assign Schedule
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Assignments */}
        <div className="modern-card">
          <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
            <i className="fas fa-list-alt" style={{ marginRight: '8px' }}></i>
            Current Schedule Assignments
          </h3>
          
          {Object.keys(assignedSchedules).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <i className="fas fa-calendar-times" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
              <br />
              No schedule assignments found. Assign schedules to routes above.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {Object.entries(assignedSchedules).map(([routeId, routeSchedules]) => (
                <div key={routeId} style={{ 
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ 
                    color: '#1e40af', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fas fa-route"></i>
                    {getRouteDisplayName(routeId)}
                  </h4>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {routeSchedules.map((schedule) => (
                      <div key={schedule.id} style={{ 
                        background: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <i className="fas fa-clock" style={{ color: '#667eea' }}></i>
                          <div>
                            <div style={{ fontWeight: '600', color: '#2d3748' }}>
                              {schedule.departureTime} → {schedule.arrivalTime}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              Frequency: {schedule.frequency}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          className="modern-btn modern-btn-danger"
                          onClick={() => handleRemoveAssignment(routeId, schedule.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <i className="fas fa-trash"></i>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignExistingSchedule;