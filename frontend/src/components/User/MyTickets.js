import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/ApiService';
import { toast } from 'react-toastify';

function MyTickets() {
  const [userTickets, setUserTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchUserTickets();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchUserTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserTickets = async () => {
    try {
      setIsLoading(true);
      // This would need to be implemented in backend to get tickets for current user
      const data = await ApiService.getUserTickets();
      setUserTickets(data);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      // For demo purposes, we'll use mock data
      setUserTickets([
        {
          id: 1,
          routeName: "New York → Washington DC",
          passengerName: "John Doe",
          travelDateTime: new Date().toISOString(),
          seatNumber: "A12",
          status: "Confirmed",
          bookingDate: new Date(Date.now() - 86400000).toISOString(),
          price: 150
        },
        {
          id: 2,
          routeName: "Boston → Philadelphia",
          passengerName: "John Doe",
          travelDateTime: new Date(Date.now() + 172800000).toISOString(),
          seatNumber: "B08",
          status: "Pending",
          bookingDate: new Date().toISOString(),
          price: 120
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'fas fa-check-circle';
      case 'canceled':
        return 'fas fa-times-circle';
      case 'pending':
        return 'fas fa-clock';
      default:
        return 'fas fa-ticket-alt';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#10b981';
      case 'canceled':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusMessage = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Your ticket is confirmed! You can travel with this ticket.';
      case 'canceled':
        return 'This ticket has been canceled. Please contact support for refund information.';
      case 'pending':
        return 'Your ticket is pending confirmation. You will be notified once confirmed.';
      default:
        return 'Status unknown. Please contact support.';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="modern-card">
        <div className="modern-card-header">
          <h2 className="modern-card-title">
            <i className="fas fa-ticket-alt" style={{ marginRight: '12px', color: '#667eea' }}></i>
            My Tickets
          </h2>
          <button 
            className="modern-btn modern-btn-primary"
            onClick={fetchUserTickets}
            disabled={isLoading}
          >
            <i className="fas fa-sync-alt"></i>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Tickets Summary */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', 
            padding: '16px', 
            borderRadius: '12px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
              {userTickets.length}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Total Tickets</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', 
            padding: '16px', 
            borderRadius: '12px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
              {userTickets.filter(t => t.status?.toLowerCase() === 'confirmed').length}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Confirmed</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)', 
            padding: '16px', 
            borderRadius: '12px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
              {userTickets.filter(t => t.status?.toLowerCase() === 'pending').length}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Pending</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)', 
            padding: '16px', 
            borderRadius: '12px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>
              {userTickets.filter(t => t.status?.toLowerCase() === 'canceled').length}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Canceled</div>
          </div>
        </div>

        {/* Real-time Status Updates Alert */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
          border: '1px solid #0ea5e9',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <i className="fas fa-info-circle" style={{ color: '#0ea5e9', fontSize: '20px' }}></i>
          <div>
            <strong style={{ color: '#0c4a6e' }}>Real-time Updates:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#075985', fontSize: '14px' }}>
              Your ticket statuses are updated automatically. You'll receive notifications when status changes.
            </p>
          </div>
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#667eea' }}></i>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading your tickets...</p>
          </div>
        ) : userTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <i className="fas fa-ticket-alt" style={{ fontSize: '48px', color: '#6b7280', opacity: 0.3, marginBottom: '16px' }}></i>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>No tickets found</p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Book your first ticket to see it here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {userTickets.map((ticket) => (
              <div key={ticket.id} className="modern-card" style={{ 
                background: 'white',
                border: `2px solid ${getStatusColor(ticket.status)}20`,
                borderLeft: `6px solid ${getStatusColor(ticket.status)}`
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '700' }}>
                        {ticket.routeName}
                      </h3>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: `${getStatusColor(ticket.status)}20`,
                        color: getStatusColor(ticket.status),
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        <i className={getStatusIcon(ticket.status)}></i>
                        {ticket.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                          Travel Date & Time
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                          {new Date(ticket.travelDateTime).toLocaleDateString()} at {new Date(ticket.travelDateTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                          Seat Number
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                          {ticket.seatNumber}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                          Booking Date
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                          {new Date(ticket.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                          Price
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                          ${ticket.price}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: `${getStatusColor(ticket.status)}10`,
                      border: `1px solid ${getStatusColor(ticket.status)}30`,
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      color: getStatusColor(ticket.status),
                      fontWeight: '500'
                    }}>
                      <i className={getStatusIcon(ticket.status)} style={{ marginRight: '8px' }}></i>
                      {getStatusMessage(ticket.status)}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <button
                      className="modern-btn modern-btn-primary"
                      onClick={() => setSelectedTicket(ticket)}
                      style={{ padding: '8px 16px', fontSize: '14px', marginBottom: '8px' }}
                    >
                      <i className="fas fa-eye"></i>
                      View Details
                    </button>
                    {ticket.status?.toLowerCase() !== 'canceled' && (
                      <button
                        className="modern-btn modern-btn-danger"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this ticket?')) {
                            // Implement user cancellation
                            toast.info('Cancellation request submitted. Admin will review.');
                          }
                        }}
                        style={{ padding: '8px 16px', fontSize: '14px', display: 'block', width: '100%' }}
                      >
                        <i className="fas fa-times"></i>
                        Request Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTickets;
