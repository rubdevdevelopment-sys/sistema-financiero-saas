import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../services/api.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "finanzas_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, user: null };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.token) {
      setAuthToken(auth.token);
    }
    setLoading(false);
  }, [auth?.token]);

  async function login(credentials) {
    const response = await api.post("/auth/login", credentials);
    const payload = response.data.data;

    setAuth(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuthToken(payload.token);

    return payload;
  }

  function logout() {
    setAuth({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
  }

  const value = {
    auth,
    user: auth?.user,
    token: auth?.token,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(auth?.token)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
