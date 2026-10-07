
// client/src/services/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT token to every API request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API responses and authentication errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.error("Authentication failed: token missing, expired, or invalid.");
    } else if (status === 403) {
      console.error("Access denied: insufficient permissions.");
    } else if (!error.response) {
      console.error(
        "Cannot connect to the backend. Check that the server is running on port 5000."
      );
    }

    return Promise.reject(error);
  }
);

export default api;

