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

export const reservationService = {
  getClientReservations: async (clientId) => {
    const response = await fetch(
      `${API_BASE_URL}/reservation/client/${clientId}`,
      {
        headers: { ...withToken(), "Content-Type": "application/json" },
      }
    );
    return handleResponse(response);
  },

  getAllReservations: async () => {
    const response = await fetch(`${API_BASE_URL}/reservation`, {
      headers: { ...withToken(), "Content-Type": "application/json" },
    });
    return handleResponse(response);
  },

  createReservation: async (reservationData) => {
    const response = await fetch(`${API_BASE_URL}/reservation`, {
      method: "POST",
      headers: {
        ...withToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    });
    return handleResponse(response);
  },

  updateReservation: async (reservationId, newStatus) => {
    const response = await fetch(
      `${API_BASE_URL}/reservation/updateStatus/${reservationId}`,
      {
        method: "PUT",
        headers: {
          ...withToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStatus),
      }
    );
    return handleResponse(response);
  },

  cancelReservation: async (reservationId) => {
    const response = await fetch(
      `${API_BASE_URL}/reservation/cancel/${reservationId}`,
      {
        method: "PUT",
        headers: { ...withToken(), "Content-Type": "application/json" },
      }
    );
    return handleResponse(response);
  },
};
