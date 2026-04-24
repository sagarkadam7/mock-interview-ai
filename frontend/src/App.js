import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import AppToaster from "./components/AppToaster";
import Navbar from "./components/Navbar";
import AnnouncementBar from "./components/AnnouncementBar";
import ErrorBoundary from "./components/ErrorBoundary";
import SkipLink from "./components/SkipLink";
import CookieConsent from "./components/CookieConsent";
import ScrollProgress from "./components/ScrollProgress";
import BackToTop from "./components/BackToTop";
import MobileStickyCTA from "./components/MobileStickyCTA";
import OfflineBanner from "./components/OfflineBanner";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import NewInterviewPage from "./pages/NewInterviewPage";
import InterviewPage from "./pages/InterviewPage";
import ReportPage from "./pages/ReportPage";
import SharedReportPage from "./pages/SharedReportPage";
import PricingPage from "./pages/PricingPage";
import FAQPage from "./pages/FAQPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const reduceMotion = useReducedMotion();

  if (loading) {
    return (
      <motion.div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-aura-page"
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Loading workspace"
      >
        <span className="spinner h-9 w-9" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading your workspace…</p>
      </motion.div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" aria-busy="true" aria-label="Loading">
        <span className="spinner h-8 w-8" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppShell() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const enterY = reduceMotion ? 0 : 10;
  const enterDur = reduceMotion ? 0.01 : 0.32;

  return (
    <div className="relative z-10 flex min-h-screen w-full min-w-0 flex-col aura-frame">
      <SkipLink />
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-w-0 w-full flex-1 outline-none focus:outline-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: reduceMotion ? 1 : 0, y: enterY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -8 }}
            transition={{ duration: enterDur, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-0 min-w-0"
          >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/share/:token" element={<SharedReportPage />} />
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
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ConfirmProvider>
            <AppShell />
            <AppToaster />
            <CookieConsent />
            <BackToTop />
            <MobileStickyCTA />
            <OfflineBanner />
          </ConfirmProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
