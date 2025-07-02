import React, { useEffect, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { toast } from "react-toastify";

function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users.");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    filterUsers(value, selectedRole);
  };

  const handleRoleFilter = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    filterUsers(search, role);
  };

  const filterUsers = (searchTerm, role) => {
    let filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTerm))
    );

    if (role !== "all") {
      filtered = filtered.filter(
        (user) => user.role?.toLowerCase() === role.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await ApiService.deleteUser(id);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user.");
      console.error("Error deleting user:", error);
    }
  };

  const isProtectedUser = (user) => {
    return user.username === "admin" && 
           user.email === "admin@gmail.com" && 
           user.phoneNumber === "123456789";
  };

  const getUserRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'fas fa-crown';
      case 'user':
        return 'fas fa-user';
      default:
        return 'fas fa-user-circle';
    }
  };

  const getUserRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#f59e0b';
      case 'user':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div className="modern-card">
        <div className="modern-card-header">
          <h2 className="modern-card-title">
            <i className="fas fa-users" style={{ marginRight: '12px', color: '#667eea' }}></i>
            User Management
          </h2>
          <button 
            className="modern-btn modern-btn-primary"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <i className="fas fa-sync-alt"></i>
            {isLoading ? 'Refreshing...' : 'Refresh'}
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
              Search Users
            </label>
            <input
              type="text"
              className="modern-input"
              placeholder="Search by username, email, or phone..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          <div className="modern-form-group">
            <label className="modern-label">
              <i className="fas fa-filter" style={{ marginRight: '8px' }}></i>
              Filter by Role
            </label>
            <select
              className="modern-select"
              value={selectedRole}
              onChange={handleRoleFilter}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>{users.length}</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Total Users</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)', 
            padding: '16px', 
            borderRadius: '12px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
              {users.filter(u => u.role?.toLowerCase() === 'admin').length}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Admins</div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', 
            padding: '16px', 
            borderRadius: '12px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
              {users.filter(u => u.role?.toLowerCase() === 'user').length}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Regular Users</div>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#667eea' }}></i>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading users...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>
                    <i className="fas fa-hashtag" style={{ marginRight: '8px' }}></i>
                    ID
                  </th>
                  <th>
                    <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
                    Username
                  </th>
                  <th>
                    <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
                    Email
                  </th>
                  <th>
                    <i className="fas fa-phone" style={{ marginRight: '8px' }}></i>
                    Phone Number
                  </th>
                  <th>
                    <i className="fas fa-user-tag" style={{ marginRight: '8px' }}></i>
                    Role
                  </th>
                  <th>
                    <i className="fas fa-cog" style={{ marginRight: '8px' }}></i>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <span style={{ 
                          background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {user.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fas fa-user-circle" style={{ color: '#667eea', fontSize: '20px' }}></i>
                          <strong>{user.username}</strong>
                          {isProtectedUser(user) && (
                            <i className="fas fa-shield-alt" style={{ color: '#10b981', marginLeft: '4px' }} title="Protected Admin Account"></i>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fas fa-envelope" style={{ color: '#6b7280', fontSize: '14px' }}></i>
                          {user.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fas fa-phone" style={{ color: '#6b7280', fontSize: '14px' }}></i>
                          {user.phoneNumber || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: `linear-gradient(135deg, ${getUserRoleColor(user.role)}20, ${getUserRoleColor(user.role)}10)`,
                          color: getUserRoleColor(user.role),
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          <i className={getUserRoleIcon(user.role)}></i>
                          {user.role || 'User'}
                        </span>
                      </td>
                      <td>
                        {!isProtectedUser(user) ? (
                          <button
                            className="modern-btn modern-btn-danger"
                            onClick={() => handleDelete(user.id)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>
                        ) : (
                          <span style={{ 
                            color: '#6b7280', 
                            fontSize: '12px',
                            fontStyle: 'italic',
                            padding: '6px 12px',
                            background: '#f1f5f9',
                            borderRadius: '8px'
                          }}>
                            <i className="fas fa-shield-alt" style={{ marginRight: '4px' }}></i>
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      <i className="fas fa-users" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
                      <br />
                      {search || selectedRole !== 'all' 
                        ? 'No users match your search criteria.' 
                        : 'No users found.'}
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

export default ViewUsers;