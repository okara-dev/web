// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../lib/api';
import { authStorage } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Beim App-Start: Session wiederherstellen
  useEffect(() => {
    (async () => {
      try {
        const { token, user: savedUser } = await authStorage.getSession();
        
        if (token && savedUser) {
          // Optional: Token bei Backend verifizieren
          try {
            const { data } = await authApi.verify();
            setUser(data.user);
          } catch (e) {
            // Token ungültig → Session löschen
            await authStorage.clearSession();
            setUser(null);
          }
        }
      } catch (e) {
        console.error('AuthContext init error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    
    if (data.token) {
      await authStorage.saveSession({
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user,
      });
    }
    
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await authApi.register({ username, email, password });
    
    if (data.token) {
      await authStorage.saveSession({
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      setUser(data.user);
    }
    
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Egal ob Backend antwortet – lokale Session löschen
    }
    await authStorage.clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}