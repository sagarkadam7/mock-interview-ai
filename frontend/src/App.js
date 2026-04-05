import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

// Pages
import LandingPage      from "./pages/LandingPage";
import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import DashboardPage    from "./pages/DashboardPage";
import NewInterviewPage from "./pages/NewInterviewPage";
import InterviewPage    from "./pages/InterviewPage";
import ReportPage       from "./pages/ReportPage";

// ── Protected route wrapper ────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// ── Public route (redirect if already logged in) ───────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

// ── App shell ──────────────────────────────────────────────────
function AppShell() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <div key={location.pathname} className="page-transition">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/interview/new" element={<PrivateRoute><NewInterviewPage /></PrivateRoute>} />
          <Route path="/interview/:id" element={<PrivateRoute><InterviewPage /></PrivateRoute>} />
          <Route path="/interview/:id/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
