import React, { useEffect, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import Navbar from "../Navbar";
import { useAuth } from "../../context/AuthContext";
import "./userDashboard.css";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const userTickets = await ApiService.getAllTickets();
      setTickets(userTickets);
    } catch (error) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              <i className="fas fa-ticket-alt"></i> My Tickets
            </h1>
            <p className="dashboard-subtitle">
              View and manage all your booked tickets
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading tickets...</p>
            </div>
          </div>
        )}

        {/* Tickets Content */}
        <div className="dashboard-content">
          <div className="tickets-grid">
            {tickets.map((ticket, index) => (
              <div key={index} className="ticket-detail-card">
                <div className="ticket-header">
                  <h4>{ticket.routeName || 'Route Name'}</h4>
                  <span className={`status ${ticket.status || 'confirmed'}`}>
                    {ticket.status || 'Confirmed'}
                  </span>
                </div>
                <div className="ticket-details">
                  <div className="detail-row">
                    <span><i className="fas fa-user"></i> Passenger:</span>
                    <span>{ticket.passengerName}</span>
                  </div>
                  <div className="detail-row">
                    <span><i className="fas fa-envelope"></i> Email:</span>
                    <span>{ticket.email}</span>
                  </div>
                  <div className="detail-row">
                    <span><i className="fas fa-phone"></i> Phone:</span>
                    <span>{ticket.phoneNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span><i className="fas fa-chair"></i> Seat:</span>
                    <span>{ticket.seatNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span><i className="fas fa-calendar"></i> Date:</span>
                    <span>{new Date(ticket.departureTime).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span><i className="fas fa-clock"></i> Time:</span>
                    <span>{new Date(ticket.departureTime).toLocaleTimeString()}</span>
                  </div>
                  <div className="detail-row">
                    <span><i className="fas fa-dollar-sign"></i> Price:</span>
                    <span className="price">${ticket.price}</span>
                  </div>
                </div>
                <div className="ticket-actions">
                  <button className="btn btn-outline">
                    <i className="fas fa-download"></i> Download
                  </button>
                  <button className="btn btn-outline">
                    <i className="fas fa-print"></i> Print
                  </button>
                </div>
              </div>
            ))}
            
            {tickets.length === 0 && !loading && (
              <div className="no-data">
                <i className="fas fa-ticket-alt"></i>
                <h3>No Tickets Found</h3>
                <p>You haven't booked any tickets yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/user'}
                >
                  <i className="fas fa-plus"></i> Book Your First Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyTickets;
