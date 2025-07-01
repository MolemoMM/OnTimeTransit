import React, { useEffect, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";

function ManageTickets({ onAnalyticsUpdate }) {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);

  useEffect(() => {
    ApiService.getTickets()
      .then((data) => {
        setTickets(data);
        setFilteredTickets(data);
        if (onAnalyticsUpdate) {
          onAnalyticsUpdate(data);
        }
      })
      .catch((error) => console.error("Error fetching tickets:", error));
  }, [onAnalyticsUpdate]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredTickets(
      tickets.filter(
        (ticket) =>
          ticket.passengerName.toLowerCase().includes(value) ||
          ticket.routeName.toLowerCase().includes(value) ||
          ticket.status.toLowerCase().includes(value)
      )
    );
  };

  const cancelTicket = (id) => {
    ApiService.cancelTicket(id)
      .then(() => {
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
      })
      .catch((error) => {
        toast.error("Failed to cancel ticket.");
        console.error("Error canceling ticket:", error);
      });
  };

  const deleteTicket = (id) => {
    ApiService.deleteTicket(id)
      .then(() => {
        toast.success("Ticket deleted successfully!");
        setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
        setFilteredTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      })
      .catch((error) => {
        toast.error("Failed to delete ticket.");
        console.error("Error deleting ticket:", error);
      });
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
      ...tickets.map((ticket) =>
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
    link.download = "tickets.csv";
    link.click();
  };

  return (
    <div className="admin-table-responsive">
      <h2>Manage Tickets</h2>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search tickets by name, route, or status..."
          value={search}
          onChange={handleSearch}
        />
      </div>
      <button className="btn btn-success mb-3" onClick={exportTickets}>
        Export Tickets
      </button>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Passenger Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Route Name</th>
              <th>Travel Date</th>
              <th>Seat Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, idx) => (
              <tr
                key={ticket.id}
                style={{
                  backgroundColor:
                    ticket.status === "Canceled"
                      ? "#f8d7da"
                      : idx % 2 === 0
                      ? "rgba(0,230,255,0.04)"
                      : "inherit",
                }}
              >
                <td
                  title={ticket.passengerName}
                  style={{
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ticket.passengerName}
                </td>
                <td
                  title={ticket.email}
                  style={{
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ticket.email}
                </td>
                <td
                  title={ticket.phoneNumber}
                  style={{
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ticket.phoneNumber}
                </td>
                <td
                  title={ticket.routeName}
                  style={{
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ticket.routeName}
                </td>
                <td
                  style={{
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(ticket.travelDateTime).toLocaleString()}
                </td>
                <td>{ticket.seatNumber}</td>
                <td>{ticket.status}</td>
                <td>
                  {ticket.status !== "Canceled" ? (
                    <button
                      className="btn btn-danger btn-sm"
                      style={{
                        marginRight: 4,
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: "0.85rem",
                      }}
                      onClick={() => cancelTicket(ticket.id)}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className="btn btn-dark btn-sm"
                      style={{
                        marginRight: 4,
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: "0.85rem",
                      }}
                      onClick={() => deleteTicket(ticket.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ...pagination and dialogs... */}
    </div>
  );
}

export default ManageTickets;
