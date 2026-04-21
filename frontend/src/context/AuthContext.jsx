// this file handles clean routing -> stateless auth
// Login → save token → navigate → route re-checks auth
// so everytime route renders, token is checked
// no react state needed, auth derived from token, centralized protection logic

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "../api/config";
import { registerUnauthorizedHandler } from "../api/fetch";

const AuthContext = createContext();

const REFRESH_INTERVAL_MS  = 12 * 60 * 1000; // refresh access token every 12 min (expires at 15)
const INACTIVITY_LIMIT_MS  = 30 * 60 * 1000; // autologout after 30 min of no activity
const ACTIVITY_EVENTS      = ["mousedown", "mousemove", "keydown", "touchstart", "scroll"];

async function checkSession() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/status`, { credentials: "include" });
    if (!res.ok) return { authenticated: false, user: null };
    const data = await res.json();
    return { authenticated: data.authenticated === true };
  } catch {
    return { authenticated: false, user: null };
  }
}

async function fetchMe() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, { credentials: "include" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function callRefresh() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser]                       = useState(null);
  const [loading, setLoading]                 = useState(true);

  const inactivityTimer = useRef(null);
  const refreshTimer    = useRef(null);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (silent = false) => {
    clearTimeout(inactivityTimer.current);
    clearInterval(refreshTimer.current);

    if (!silent) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    }
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // ── Inactivity timer ──────────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT_MS);
  }, [logout]);

  const startActivityTracking = useCallback(() => {
    ACTIVITY_EVENTS.forEach(evt =>
      window.addEventListener(evt, resetInactivityTimer, { passive: true })
    );
    resetInactivityTimer(); // start the clock immediately
  }, [resetInactivityTimer]);

  const stopActivityTracking = useCallback(() => {
    ACTIVITY_EVENTS.forEach(evt =>
      window.removeEventListener(evt, resetInactivityTimer)
    );
    clearTimeout(inactivityTimer.current);
  }, [resetInactivityTimer]);

  // ── Proactive token refresh ────────────────────────────────────────────────
  const startRefreshCycle = useCallback(() => {
    clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(async () => {
      const ok = await callRefresh();
      if (!ok) logout(true); // refresh token also expired → force logout
    }, REFRESH_INTERVAL_MS);
  }, [logout]);

  // ── Session init ──────────────────────────────────────────────────────────
  useEffect(() => {
    checkSession().then(async ({ authenticated }) => {
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const me = await fetchMe();
        setUser(me);
        startActivityTracking();
        startRefreshCycle();
      }
    }).finally(() => setLoading(false));

    return () => {
      stopActivityTracking();
      clearInterval(refreshTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register the 401 handler so apiFetch can trigger logout
  useEffect(() => {
    registerUnauthorizedHandler(() => logout(true));
  }, [logout]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async () => {
    setIsAuthenticated(true);
    const me = await fetchMe();
    setUser(me);
    startActivityTracking();
    startRefreshCycle();
  }, [startActivityTracking, startRefreshCycle]);

  // ── Explicit logout (stops tracking) ─────────────────────────────────────
  const logoutAndStop = useCallback(async () => {
    stopActivityTracking();
    await logout();
  }, [stopActivityTracking, logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout: logoutAndStop, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
