export const API_BASE_URL =
  import.meta.env.DEV
    ? "/api"
    : (import.meta.env.VITE_API_URL || "http://localhost:3000/api");

export const BASE_URL = 
  import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export function withToken(headers = {}) {
  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

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
