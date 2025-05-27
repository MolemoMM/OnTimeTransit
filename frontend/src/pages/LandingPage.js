import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landing-root">
      <header className="landing-hero">
        <video
          className="landing-bg-video"
          src="/home.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="landing-bg-overlay"></div>
        <div className="landing-hero-content">
          <h1 className="landing-title">Welcome to OnTimeTransit</h1>
          <p className="landing-subtitle">
            Seamless bus route, schedule, and ticket management for everyone.
          </p>
          <div className="landing-cta-buttons">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Register
            </Link>
          </div>
        </div>
        <motion.div
          className="landing-scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          title="Scroll Down"
        >
          <span className="scroll-arrow">&#8595;</span>
        </motion.div>
      </header>

      <section className="landing-features">
        <h2 className="section-title">
          What <span className="highlight">You Can Do</span>
        </h2>
        <p className="section-desc">
          Take charge of your travel with OnTimeTransit’s easy-to-use features.
        </p>
        <div className="features-grid">
          <div className="feature-card" style={{ background: "rgba(10, 10, 35, 0.82)", boxShadow: "0 4px 18px #00e6ff33" }}>
            <h3>Find Your Route</h3>
            <p>
              Discover and compare bus routes to choose the journey that fits you best.
            </p>
          </div>
          <div className="feature-card" style={{ background: "rgba(10, 10, 35, 0.82)", boxShadow: "0 4px 18px #00e6ff33" }}>
            <h3>Check Schedules</h3>
            <p>
              Instantly view the latest bus times and plan your trips with confidence.
            </p>
          </div>
          <div className="feature-card" style={{ background: "rgba(10, 10, 35, 0.82)", boxShadow: "0 4px 18px #00e6ff33" }}>
            <h3>Book Instantly</h3>
            <p>
              Secure your seat in just a few clicks—fast, safe, and hassle-free.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;