import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthService from "../../services/AuthService";

function Register() {
  const [user, setUser] = useState({
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    console.log("User object being sent to the backend:", user);

    AuthService.register(user)
      .then(() => {
        toast.success("Registration successful! Please log in.");
        navigate("/login");
      })
      .catch((error) => {
        toast.error("Registration failed. Please try again.");
        console.error("Error registering user:", error);
      });
  };

  return (
    <div className="login-centered-container">
      <video
        className="landing-bg-video"
        src="/register.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="landing-bg-overlay"></div>
      <div className="login-hero-content">
        <h2 className="landing-title" style={{ fontSize: "2rem" }}>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#b0bec5" }}>Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={user.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#b0bec5" }}>Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={user.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#b0bec5" }}>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={user.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: "#b0bec5" }}>Phone Number</label>
            <input
              type="text"
              className="form-control"
              name="phoneNumber"
              value={user.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;