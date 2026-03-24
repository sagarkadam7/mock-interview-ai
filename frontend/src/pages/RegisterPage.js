import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../utils/api";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data); navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420 }} className="animate-fade-up">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#22d3ee)", boxShadow: "0 0 12px rgba(99,102,241,0.8)" }} />
              InterviewAI
            </div>
          </Link>
          <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 8 }}>Create your free account</p>
        </div>

        <div className="card-glow">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label>Full name</label>
              <input className="input" name="name" placeholder="Jane Smith" value={form.name} onChange={handle} required />
            </div>
            <div>
              <label>Email address</label>
              <input className="input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
            <div>
              <label>Password</label>
              <input className="input" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handle} required />
            </div>

            <button className="btn btn-grad btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" /> Creating account…</> : "Create account →"}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--indigo2)", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}