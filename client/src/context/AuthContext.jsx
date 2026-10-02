import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_jwt_token') || null);
  const [adminUser, setAdminUser] = useState(() => localStorage.getItem('admin_username') || null);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    setAdminToken(data.token);
    setAdminUser(data.username);
    localStorage.setItem('admin_jwt_token', data.token);
    localStorage.setItem('admin_username', data.username);
    return data;
  };

  const logout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('admin_jwt_token');
    localStorage.removeItem('admin_username');
  };

  return (
    <AuthContext.Provider value={{ adminToken, adminUser, login, logout, isAdmin: !!adminToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
