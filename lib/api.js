export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const BASE_URL = 
  import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de l'inscription");
    }

    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de la connexion");
    }

    return response.json();
  },
};

export const UserApi = {
  getUserProfile: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la récupération du profile"
      );
    }

    return response.json();
  },
  
};

export const Tours = {
  getTourStandardsById: async (tourId) => {
    const response = await fetch(`${API_BASE_URL}/tours-standards/${tourId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message ||
          "Erreur lors de la récupération des details du tour standard"
      );
    }

    return response.json();
  },

  createTourStandard: async (data) => {
    const token = await getAuthToken()
    const response = await fetch(
      `${API_BASE_URL}/tours-standards/create-with-media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la création du tour personnalisé"
      );
    }

    return response.json();
  },

  getAllTourStandards: async () => {
    const response = await fetch(`${API_BASE_URL}/tours-standards`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la récupération des tours standards"
      );
    }

    return response.json();
  },

  getAllTourPersonnalise: async () => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/tours-personnalises`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la récupération des tours standards"
      );
    }

    return response.json();
  },

  createTourPersonnalise: async (data) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/tours-personnalises`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la création du tour personnalisé"
      );
    }

    return response.json();
  },

  deleteTourStandards: async (id) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/tours-standards/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la suppression du tour standards"
      );
    }

    return response.json();
  },
};

export const AdminUser = {
  getAllAdminUser: async () => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/admins/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la récupération des utilisateurs"
      );
    }

    return response.json();
  },

  deleteUser: async (id) => {
    const token = await getAuthToken()
    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la suppression de l'utilisateur"
      );
    }

    return response.json();
  },

  editingUser: async (id, data) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/admin/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la mise à jour de l'utilisateur"
      );
    }

    return response.json();
  },

  createUser: async (data) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/create-admin/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la création de l'utilisateur"
      );
    }

    return response.json();
  },
};

export const reservationAPI = {
  getClientReservations: async (clientId) => {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/reservation/client/${clientId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la récupération des réservations"
      );
    }

    return response.json();
  },

  getAllReservations: async () => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/reservation`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la récupération des réservations"
      );
    }

    return response.json();
  },

  createReservation: async (reservationData) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reservation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la création de la réservation"
      );
    }

    return response.json();
  },

  updateReservation: async (reservationId, newStatus) => {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/reservation/updateStatus/${reservationId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStatus),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la mise à jour du statut"
      );
    }

    return response.json();
  },
};

export const PaiementApi = {
  getClientPaiements: async (clientId) => {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/paiements/client/${clientId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la récupération des paiements"
      );
    }

    return response.json();
  },

  addPaiement: async (formData) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/paiements/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de l'ajout du paiement");
    }

    return response.json();
  },

  getAllPaiement: async () => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/paiements/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Erreur lors de la récupération des paiements"
      );
    }

    return response.json();
  },
};

export const setAuthToken = async (token) => {
  localStorage.setItem("token", token);
};

export const getAuthToken = async () => {
  return localStorage.getItem("token");
};

export const removeAuthToken = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("client");
  localStorage.removeItem("user");
};
