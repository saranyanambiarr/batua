// ProtectedRoute (in App.jsx) + AuthContext gives React state sync, clean routing and no prop drilling
import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../api/config";

const AuthContext = createContext()

async function checkSession() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/status`, {
      credentials: "include",
    });
    if (!res.ok) return { authenticated: false, user: null };
    const data = await res.json();
    return { authenticated: data.authenticated === true };
  } catch {
    // Network error (offline, server down) — treat as unauthenticated
    return { authenticated: false, user: null };
  }
}

async function fetchMe() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Silently check if an active session cookie exists.
    // A 401 here is expected when the user is not logged in — it is not an error.
    checkSession()
      .then(async ({ authenticated }) => {
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const me = await fetchMe();
          setUser(me);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async () => {
    setIsAuthenticated(true);
    const me = await fetchMe();
    setUser(me);
  };

  const logout = async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
