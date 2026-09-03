import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { login as loginApi } from '../api/authApi';
import {
  getToken,
  setToken,
  clearToken,
  getStoredEmployee,
  setStoredEmployee,
  clearStoredEmployee,
} from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Restore session on app launch — this only affects what auth-gated
  // actions are allowed, never which screen loads first (Blog Feed always
  // loads first regardless of this).
  useEffect(() => {
    (async () => {
      const token = await getToken();
      const storedEmployee = await getStoredEmployee();
      if (token) {
        setIsAuthenticated(true);
        setEmployee(storedEmployee);
      }
      setInitializing(false);
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, employee: emp } = await loginApi(email, password);
    await setToken(token);
    if (emp) await setStoredEmployee(emp);
    setIsAuthenticated(true);
    setEmployee(emp || null);
    return emp;
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    await clearStoredEmployee();
    setIsAuthenticated(false);
    setEmployee(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, employee, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
