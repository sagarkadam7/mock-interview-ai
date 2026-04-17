import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AUTH_SESSION_EXPIRED } from "../utils/authSession";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const onSessionExpired = () => logout();
    window.addEventListener(AUTH_SESSION_EXPIRED, onSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED, onSessionExpired);
  }, [logout]);

  const login = useCallback((userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    setUser(userData);
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

