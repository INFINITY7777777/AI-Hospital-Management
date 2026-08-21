// ==========================================================
// AXIOS API CLIENT
// ==========================================================

import axios from "axios";

// ==========================================================
// API INSTANCE
// ==========================================================

const api = axios.create({
    baseURL: "http://localhost:5000/api",

    headers: {
        "Content-Type": "application/json"
    }
});

// ==========================================================
// REQUEST INTERCEPTOR
// Automatically attaches JWT token
// ==========================================================

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers = config.headers || {};

            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// ==========================================================
// RESPONSE INTERCEPTOR
// ==========================================================

api.interceptors.response.use(

    (response) => {
        return response;
    },

    (error) => {

        if (error.response?.status === 401) {

            console.error(
                "Authentication failed. JWT token is missing or invalid."
            );

            // Optional:
            // localStorage.removeItem("token");
            // window.location.href = "/login";
        }

        if (error.response?.status === 403) {

            console.error(
                "Authorization failed. User does not have permission."
            );
        }

        return Promise.reject(error);
    }
);

export default api;