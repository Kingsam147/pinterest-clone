import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setUser({ token: savedToken }); // Simulated user restoration
    }
  }, []);

  const login = async ({ email, password }) => {
    // Simulate login
    if (email === 'john@example.com' && password === 'password123') {
      const fakeToken = 'abc123';
      localStorage.setItem('token', fakeToken);
      setUser({ email, token: fakeToken });
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
