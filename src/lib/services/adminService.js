import { API_BASE_URL, withToken, getAuthToken } from "@lib/api";

async function handleResponse(response) {
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const message = typeof error.message === "string" ? error.message : JSON.stringify(error);
    throw new Error(message || "Une erreur est survenue");
  }
  return response.json();
}

export const userService = {
  getUserProfile: async () => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(response);
  },
};

export const adminUserService = {
  getAllAdminUser: async () => {
    const response = await fetch(`${API_BASE_URL}/user/admins`, {
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/user/admin/${id}`, {
      method: "DELETE",
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },

  editingUser: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/user/admin/${id}`, {
      method: "PUT",
      headers: {
        ...withToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  createUser: async (data) => {
    const response = await fetch(`${API_BASE_URL}/user/create-admin`, {
      method: "POST",
      headers: {
        ...withToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};
