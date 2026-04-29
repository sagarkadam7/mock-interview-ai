import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AUTH_SESSION_EXPIRED } from "../utils/authSession";
import api, { logoutUser } from "../utils/api";

const AuthContext = createContext(null);

// Dedupe /auth/me so dev StrictMode or fast reloads can't spam the backend.
const ME_TTL_MS = 10_000;
let inFlightMe = null;
let lastMeAt = 0;

async function fetchMe() {
  const now = Date.now();
  if (!inFlightMe && now - lastMeAt > ME_TTL_MS) {
    lastMeAt = now;
    inFlightMe = api.get("/auth/me").finally(() => {
      inFlightMe = null;
    });
  }
  return inFlightMe || api.get("/auth/me");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      /* ignore */
    }
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const { token, ...rest } = parsed || {};
        setUser(rest);
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch {
        localStorage.removeItem("user");
      }
    }

    (async () => {
      try {
        const res = await fetchMe();
        setUser(res.data);
      } catch {
        /* not logged in */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onSessionExpired = () => logout();
    window.addEventListener(AUTH_SESSION_EXPIRED, onSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED, onSessionExpired);
  }, [logout]);

  const login = useCallback((userData) => {
    const { token, ...rest } = userData || {};
    localStorage.setItem("user", JSON.stringify(rest));
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    setUser(rest);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
