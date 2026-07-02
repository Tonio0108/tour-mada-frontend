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

export const reviewService = {
  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/avis`, {
      method: "POST",
      headers: {
        ...withToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getByTour: async (tourId) => {
    const response = await fetch(`${API_BASE_URL}/avis/tour/${tourId}`);
    return handleResponse(response);
  },

  getTopReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/avis/top`);
    return handleResponse(response);
  },

  getPublishedReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/avis/published`);
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/avis`, {
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },

  updateStatus: async (id, publie) => {
    const response = await fetch(`${API_BASE_URL}/avis/${id}/publier`, {
      method: "PATCH",
      headers: {
        ...withToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publie }),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/avis/${id}`, {
      method: "DELETE",
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },
};
