import { useState, useEffect } from "react";
import { getAuthToken, removeAuthToken, API_BASE_URL } from "../../lib/api";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userProfile = await response.json();
        setUser(userProfile);
        setIsAuthenticated(true);
        setIsAdmin(userProfile.type_utilisateur === "ADMIN");
        return userProfile;
      } else {
        throw new Error("Token invalide");
      }
    } catch (error) {
      console.error("Erreur de récupération du profil:", error);
      removeAuthToken();
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      throw error;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAuthToken();

      if (token) {
        try {
          await fetchUserProfile(token);
        } catch (error) {
          console.error("Authentification échouée:", error);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (token) => {
    try {
      const userProfile = await fetchUserProfile(token);
      return userProfile;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isAdmin,
    user,
    loading,
    login,
    logout,
    refreshUser: () => {
      const token = getAuthToken();
      if (token) {
        return fetchUserProfile(token);
      }
      return Promise.resolve(null);
    },
  };
};
