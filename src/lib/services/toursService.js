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

export const toursService = {
  getTourStandardsById: async (tourId) => {
    const response = await fetch(`${API_BASE_URL}/tours-standards/${tourId}`);
    return handleResponse(response);
  },

  createTourStandard: async (data) => {
    const response = await fetch(
      `${API_BASE_URL}/tours-standards/create-with-media`,
      {
        method: "POST",
        headers: {
          ...withToken(),
        },
        body: data,
      }
    );
    return handleResponse(response);
  },

  getAllTourStandards: async () => {
    const response = await fetch(`${API_BASE_URL}/tours-standards`);
    return handleResponse(response);
  },

  getAllTourPersonnalise: async () => {
    const response = await fetch(`${API_BASE_URL}/tours-personnalises`, {
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },

  createTourPersonnalise: async (data) => {
    const response = await fetch(`${API_BASE_URL}/tours-personnalises`, {
      method: "POST",
      headers: {
        ...withToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteTourStandards: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tours-standards/${id}`, {
      method: "DELETE",
      headers: { ...withToken() },
    });
    return handleResponse(response);
  },
};
