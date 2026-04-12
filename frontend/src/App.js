import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import AppToaster from "./components/AppToaster";
import Navbar from "./components/Navbar";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NewInterviewPage from "./pages/NewInterviewPage";
import InterviewPage from "./pages/InterviewPage";
import ReportPage from "./pages/ReportPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="spinner h-9 w-9 border-t-aura-violet" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppShell() {
  const location = useLocation();
  return (
    <div className="relative z-10 flex min-h-screen w-full min-w-0 flex-col aura-frame">
      <Navbar />
      <div key={location.pathname} className="animate-page-in min-w-0 w-full flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/interview/new"
            element={
              <PrivateRoute>
                <NewInterviewPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/interview/:id"
            element={
              <PrivateRoute>
                <InterviewPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/interview/:id/report"
            element={
              <PrivateRoute>
                <ReportPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          <AppShell />
          <AppToaster />
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
