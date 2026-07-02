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

export const mailService = {
  sendContactEmail: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/send-contact-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  notifyReservation: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/notify-reservation`, {
      method: "POST",
      headers: withToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  notifyCustomTour: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/notify-custom-tour`, {
      method: "POST",
      headers: withToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  notifyCancellation: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/notify-cancellation`, {
      method: "POST",
      headers: withToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  confirmReservation: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/confirm-reservation`, {
      method: "POST",
      headers: withToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  refuseReservation: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/refuse-reservation`, {
      method: "POST",
      headers: withToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  confirmCustomTour: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/confirm-custom-tour`, {
      method: "POST",
      headers: withToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  refuseCustomTour: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/refuse-custom-tour`, {
      method: "POST",
      headers: withToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  confirmPayment: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/confirm-payment`, {
      method: "POST",
      headers: withToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  refusePayment: async (data) => {
    const response = await fetch(`${API_BASE_URL}/mail/refuse-payment`, {
      method: "POST",
      headers: withToken({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
