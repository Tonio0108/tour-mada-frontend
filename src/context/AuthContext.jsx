import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, removeAuthToken, API_BASE_URL } from '../../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userProfile = await response.json();
        setUser(userProfile);
        setIsAuthenticated(true);
        setIsAdmin(userProfile.type_utilisateur === "ADMIN");
        return userProfile;
      }
      if (response.status === 401) {
        logout();
      }
      throw new Error('Erreur de récupération du profil');
    } catch (error) {
      if (error.message === 'Erreur de récupération du profil') throw error;
      console.error("Erreur de récupération du profil:", error);
      throw error;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();
      if (token) {
        try {
          await fetchUserProfile(token);
        } catch (e) {
          console.error("checkAuth:", e);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (token) => {
    const userProfile = await fetchUserProfile(token);
    if (!userProfile) throw new Error('Impossible de récupérer le profil utilisateur');
    return userProfile;
  };

  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  const refreshUser = () => {
    const token = getAuthToken();
    if (token) {
      return fetchUserProfile(token);
    }
    return Promise.resolve(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAdmin,
      user,
      loading,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
