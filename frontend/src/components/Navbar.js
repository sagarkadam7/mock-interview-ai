import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="navbar" style={{
      boxShadow: scrolled ? "0 1px 40px rgba(0,0,0,0.6)" : "none",
      transition: "box-shadow 0.3s",
    }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <div className="navbar-brand">
          <div className="dot" />
          InterviewAI
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {user ? (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              marginRight: 4,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#22d3ee)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
              }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>
                {user.name.split(" ")[0]}
              </span>
            </div>
            <Link to="/dashboard">
              <button className="btn btn-outline" style={{ padding: "7px 16px", fontSize: 13 }}>
                Dashboard
              </button>
            </Link>
            <Link to="/interview/new">
              <button className="btn btn-primary" style={{ padding: "7px 16px", fontSize: 13 }}>
                + New Interview
              </button>
            </Link>
            <button className="btn btn-outline" style={{ padding: "7px 14px", fontSize: 13 }} onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="btn btn-outline" style={{ padding: "7px 18px", fontSize: 13 }}>Sign in</button>
            </Link>
            <Link to="/register">
              <button className="btn btn-grad" style={{ padding: "7px 18px", fontSize: 13 }}>Get started</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}