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
        // Update the ticket status in the local state instead of removing it
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
    // Add this method to ApiService.js
    // This is a placeholder - you'll need to implement the actual API call
    ApiService.deleteTicket(id)
      .then(() => {
        toast.success("Ticket deleted successfully!");
        // Remove the ticket from the local state
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
    <div className="container mt-5">
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
      <table className="table table-striped">
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
          {filteredTickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.passengerName}</td>
              <td>{ticket.email}</td>
              <td>{ticket.phoneNumber}</td>
              <td>{ticket.routeName}</td>
              <td>{new Date(ticket.travelDateTime).toLocaleString()}</td>
              <td>{ticket.seatNumber}</td>
              <td>{ticket.status}</td>
              <td>
                {ticket.status !== "Canceled" ? (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => cancelTicket(ticket.id)}
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    className="btn btn-dark btn-sm"
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
  );
}

export default ManageTickets;
