import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/AuthService";
import { useAuth } from "../../context/AuthContext";
import "./login.css";

function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Credentials being sent to the backend:", credentials);

    AuthService.login(credentials)
      .then((role) => {
        console.log("User role:", role);
        // Update AuthContext
        login(role);
        toast.success("Login successful!");
      })
      .catch((error) => {
        toast.error("Login failed. Please check your credentials.");
        console.error("Error logging in:", error);
      });
  };

  return (
    <div className="login-centered-container">
      <video
        className="landing-bg-video"
        src="/login.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="landing-bg-overlay"></div>
      <div className="login-hero-content">
        <h2 className="landing-title">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;