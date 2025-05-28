import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";
import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

function Navbar() {
  const role = AuthService.getRole(); // Get the role from localStorage
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Example: get admin name from localStorage or AuthService
  const adminName = localStorage.getItem("adminName") || "Admin";

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    navigate("/admin/profile");
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate("/admin/settings");
  };

  const handleLogout = () => {
    handleMenuClose();
    AuthService.logout();
  };

  // Helper to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#232946",
        boxShadow: "0 2px 12px #23294622",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: "#0066ff", fontWeight: 800 }}>
          Bus Management System
        </Typography>
        {role === "ADMIN" && (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/admin"
              sx={{
                color: isActive("/admin") ? "#0066ff" : "#fff",
                background: isActive("/admin") ? "#f4f6fb" : "transparent",
                fontWeight: isActive("/admin") ? 700 : 500,
                borderRadius: "18px",
                mx: 1,
                "&:hover": {
                  background: "#0066ff",
                  color: "#fff",
                },
              }}
            >
              Dashboard
            </Button>
            {/* Admin Avatar/Profile Dropdown */}
            <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
              <Avatar sx={{ bgcolor: "#0066ff", width: 32, height: 32 }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem disabled>
                <Typography variant="subtitle1">{adminName}</Typography>
              </MenuItem>
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleSettings}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
        {role !== "ADMIN" && (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/user"
              sx={{
                color: isActive("/user") ? "#0066ff" : "#fff",
                background: isActive("/user") ? "#f4f6fb" : "transparent",
                fontWeight: isActive("/user") ? 700 : 500,
                borderRadius: "18px",
                mx: 1,
                "&:hover": {
                  background: "#0066ff",
                  color: "#fff",
                },
              }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/user/routes"
              sx={{
                color: isActive("/user/routes") ? "#0066ff" : "#fff",
                background: isActive("/user/routes") ? "#f4f6fb" : "transparent",
                fontWeight: isActive("/user/routes") ? 700 : 500,
                borderRadius: "18px",
                mx: 1,
                "&:hover": {
                  background: "#0066ff",
                  color: "#fff",
                },
              }}
            >
              View Routes
            </Button>
            <Button
              color="inherit"
              onClick={AuthService.logout}
              sx={{
                color: "#fff",
                borderRadius: "18px",
                mx: 1,
                "&:hover": {
                  background: "#0066ff",
                  color: "#fff",
                },
              }}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;