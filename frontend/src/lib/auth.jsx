import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("vt_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("vt_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      localStorage.setItem("vt_user", JSON.stringify(data));
    } catch (e) {
      setUser(null);
      localStorage.removeItem("vt_token");
      localStorage.removeItem("vt_user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setSession = (token, u) => {
    localStorage.setItem("vt_token", token);
    localStorage.setItem("vt_user", JSON.stringify(u));
    setUser(u);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setSession(data.token, data.user);
    return data.user;
  };
  const signup = async (email, password, name) => {
    const { data } = await api.post("/auth/signup", { email, password, name });
    setSession(data.token, data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("vt_token");
    localStorage.removeItem("vt_user");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, signup, logout, refresh, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
