import { API_BASE_URL, withToken } from "@lib/api";

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

export const notificationService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },

  markAsRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "POST",
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },
};
