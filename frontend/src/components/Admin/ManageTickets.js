import React, { useEffect, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";

function ManageTickets({ onAnalyticsUpdate }) {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, [onAnalyticsUpdate]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getTickets();
      setTickets(data);
      setFilteredTickets(data);
      if (onAnalyticsUpdate) {
        onAnalyticsUpdate(data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to fetch tickets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    filterTickets(value, selectedStatus);
  };

  const handleStatusFilter = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    filterTickets(search, status);
  };

  const filterTickets = (searchTerm, status) => {
    let filtered = tickets.filter(
      (ticket) =>
        ticket.passengerName.toLowerCase().includes(searchTerm) ||
        ticket.routeName.toLowerCase().includes(searchTerm) ||
        ticket.status.toLowerCase().includes(searchTerm) ||
        ticket.email.toLowerCase().includes(searchTerm)
    );

    if (status !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.status.toLowerCase() === status.toLowerCase()
      );
    }

    setFilteredTickets(filtered);
  };

  const cancelTicket = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this ticket?")) {
      return;
    }

    try {
      await ApiService.cancelTicket(id);
      toast.success("Ticket canceled successfully!");
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === id ? { ...ticket, status: "Canceled" } : ticket
        )
      );
      setFilteredTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === id ? { ...ticket, status: "Canceled" } : ticket
        )
      );
    } catch (error) {
      toast.error("Failed to cancel ticket.");
      console.error("Error canceling ticket:", error);
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return;
    }

    try {
      await ApiService.deleteTicket(id);
      toast.success("Ticket deleted successfully!");
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      setFilteredTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    } catch (error) {
      toast.error("Failed to delete ticket.");
      console.error("Error deleting ticket:", error);
    }
  };

  const exportTickets = () => {
    const csvContent = [
      [
        "Passenger Name",
        "Email",
        "Phone Number",
        "Route Name",
        "Travel Date",
        "Seat Number",
        "Status",
      ].join(","),
      ...filteredTickets.map((ticket) =>
        [
          ticket.passengerName,
          ticket.email,
          ticket.phoneNumber,
          ticket.routeName,
          new Date(ticket.travelDateTime).toLocaleString(),
          ticket.seatNumber,
          ticket.status,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Tickets exported successfully!");
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

  return (
    <div style={{ padding: '24px' }}>
      <div className="modern-card">
        <div className="modern-card-header">
          <h2 className="modern-card-title">
            <i className="fas fa-ticket-alt" style={{ marginRight: '12px', color: '#667eea' }}></i>
            Manage Tickets
          </h2>
          <button 
            className="modern-btn modern-btn-success"
            onClick={exportTickets}
            disabled={isLoading || filteredTickets.length === 0}
          >
            <i className="fas fa-download"></i>
            Export CSV ({filteredTickets.length})
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          padding: '20px',
          borderRadius: '12px'
        }}>
          <div className="modern-form-group">
            <label className="modern-label">
              <i className="fas fa-search" style={{ marginRight: '8px' }}></i>
              Search Tickets
            </label>
            <input
              type="text"
              className="modern-input"
              placeholder="Search by name, route, email, or status..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          <div className="modern-form-group">
            <label className="modern-label">
              <i className="fas fa-filter" style={{ marginRight: '8px' }}></i>
              Filter by Status
            </label>
            <select
              className="modern-select"
              value={selectedStatus}
              onChange={handleStatusFilter}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>{tickets.length}</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Total Tickets</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', 
            padding: '16px', 
            borderRadius: '12px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
              {tickets.filter(t => t.status?.toLowerCase() === 'confirmed').length}
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
              {tickets.filter(t => t.status?.toLowerCase() === 'pending').length}
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
              {tickets.filter(t => t.status?.toLowerCase() === 'canceled').length}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Canceled</div>
          </div>
        </div>

        {/* Tickets Table */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#667eea' }}></i>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading tickets...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>
                    <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
                    Passenger
                  </th>
                  <th>
                    <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
                    Contact
                  </th>
                  <th>
                    <i className="fas fa-route" style={{ marginRight: '8px' }}></i>
                    Route
                  </th>
                  <th>
                    <i className="fas fa-calendar" style={{ marginRight: '8px' }}></i>
                    Travel Date
                  </th>
                  <th>
                    <i className="fas fa-chair" style={{ marginRight: '8px' }}></i>
                    Seat
                  </th>
                  <th>
                    <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                    Status
                  </th>
                  <th>
                    <i className="fas fa-cog" style={{ marginRight: '8px' }}></i>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong>{ticket.passengerName}</strong>
                          <small style={{ color: '#6b7280' }}>{ticket.email}</small>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{ticket.phoneNumber}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {ticket.routeName}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{new Date(ticket.travelDateTime).toLocaleDateString()}</span>
                          <small style={{ color: '#6b7280' }}>
                            {new Date(ticket.travelDateTime).toLocaleTimeString()}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {ticket.seatNumber}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: getStatusColor(ticket.status),
                          fontWeight: '600'
                        }}>
                          <i className={getStatusIcon(ticket.status)}></i>
                          {ticket.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {ticket.status?.toLowerCase() !== "canceled" ? (
                            <button
                              className="modern-btn modern-btn-warning"
                              onClick={() => cancelTicket(ticket.id)}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              <i className="fas fa-ban"></i>
                              Cancel
                            </button>
                          ) : (
                            <button
                              className="modern-btn modern-btn-danger"
                              onClick={() => deleteTicket(ticket.id)}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              <i className="fas fa-trash"></i>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      <i className="fas fa-ticket-alt" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
                      <br />
                      {search || selectedStatus !== 'all' 
                        ? 'No tickets match your search criteria.' 
                        : 'No tickets found.'}
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

export default ManageTickets;
