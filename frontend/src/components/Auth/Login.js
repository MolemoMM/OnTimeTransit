import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/AuthService";
import "../../pages/LandingPage.css";

function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();

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
        if (role === "ADMIN") {
          console.log("Navigating to admin dashboard...");
          navigate("/admin");
        } else if (role === "USER") {
          console.log("Navigating to user dashboard...");
          navigate("/user");
        } else {
          toast.error("Unexpected role received from the server.");
        }
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
        <h2 className="landing-title" style={{ fontSize: "2rem" }}>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#b0bec5" }}>Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#f8fafc",
                border: "1px solid #00e6ff",
                borderRadius: "10px"
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#b0bec5" }}>Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#f8fafc",
                border: "1px solid #00e6ff",
                borderRadius: "10px"
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;