import React, { useEffect, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";
import "./stylings/ManageTickets.css";

function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    ApiService.getAllUsers()
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
      })
      .catch(() => toast.error("Failed to fetch users."));
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    setFilteredUsers(
      users.filter(
        (user) =>
          user.username.toLowerCase().includes(value) ||
          user.email.toLowerCase().includes(value) ||
          (user.phoneNumber && user.phoneNumber.toLowerCase().includes(value))
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      ApiService.deleteUser(id)
        .then(() => {
          toast.success("User deleted successfully!");
          fetchUsers();
        })
        .catch(() => toast.error("Failed to delete user."));
    }
  };

  return (
    <div className="admin-table-responsive">
      <h2>User List</h2>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search users by username, email, or phone..."
          value={search}
          onChange={handleSearch}
        />
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    {/* Remove delete button for admin user */}
                    {!(
                      user.username === "admin" &&
                      user.email === "admin@gmail.com" &&
                      user.phoneNumber === "123456789"
                    ) && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} align="center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewUsers;