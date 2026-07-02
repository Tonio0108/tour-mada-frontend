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

export const paymentService = {
  getClientPaiements: async (clientId) => {
    const response = await fetch(
      `${API_BASE_URL}/paiements/client/${clientId}`,
      { headers: { ...withToken(), "Content-Type": "application/json" } }
    );
    return handleResponse(response);
  },

  addPaiement: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/paiements/upload`, {
      method: "POST",
      headers: { ...withToken() },
      body: formData,
    });
    return handleResponse(response);
  },

  updatePaiementStatus: async (paiementId, data) => {
    const response = await fetch(`${API_BASE_URL}/paiements/${paiementId}`, {
      method: "PUT",
      headers: {
        ...withToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getAllPaiement: async () => {
    const response = await fetch(`${API_BASE_URL}/paiements/`, {
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },
};
