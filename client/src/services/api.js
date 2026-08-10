// ==========================================================
// AXIOS API CLIENT
// ==========================================================

import axios from "axios";

// ==========================================================
// API INSTANCE
// ==========================================================

const api = axios.create({

    // Backend API URL
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

        // Get JWT token
        const token = localStorage.getItem("token");

        // Attach token if available
        if (token) {

            config.headers = config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// ==========================================================
// RESPONSE INTERCEPTOR
// Handles authentication errors
// ==========================================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        // ==================================================
        // UNAUTHORIZED
        // ==================================================

        if (error.response?.status === 401) {

            console.error(
                "Authentication failed. JWT token is missing or invalid."
            );

        }


        // ==================================================
        // FORBIDDEN
        // ==================================================

        if (error.response?.status === 403) {

            console.error(
                "Authorization failed. User does not have permission."
            );

        }


        return Promise.reject(error);

    }

);


// ==========================================================
// EXPORT
// ==========================================================

export default api;