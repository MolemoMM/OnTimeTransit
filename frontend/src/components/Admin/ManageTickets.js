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
    <div className="tw-card space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Tickets</h2>
        <button 
          className="tw-btn-primary tw-btn-gradient-blue flex items-center gap-2"
          onClick={exportTickets}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Tickets
        </button>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          className="tw-input w-full"
          placeholder="Search tickets by name, route, or status..."
          value={search}
          onChange={handleSearch}
        />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Passenger Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Route Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Travel Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Seat Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map((ticket, idx) => (
                <tr
                  key={ticket.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    ticket.status === "Canceled" 
                      ? "bg-red-50 dark:bg-red-900/20" 
                      : idx % 2 === 0 
                      ? "bg-cyan-50/30 dark:bg-cyan-900/10" 
                      : "bg-white dark:bg-gray-800"
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-[120px] truncate" title={ticket.passengerName}>
                    {ticket.passengerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-[140px] truncate" title={ticket.email}>
                    {ticket.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-[100px] truncate" title={ticket.phoneNumber}>
                    {ticket.phoneNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-[140px] truncate" title={ticket.routeName}>
                    {ticket.routeName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-[120px] truncate">
                    {new Date(ticket.travelDateTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {ticket.seatNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ticket.status === "Canceled" 
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : ticket.status === "Confirmed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {ticket.status !== "Canceled" ? (
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors duration-200"
                        onClick={() => cancelTicket(ticket.id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors duration-200"
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
      </div>
      
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H4" />
            </svg>
            <p className="text-lg font-medium">No tickets found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTickets;
