// ==========================================================
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================================

const jwt = require("jsonwebtoken");


// ==========================================================
// VERIFY JWT TOKEN
// ==========================================================

const verifyToken = (req, res, next) => {

    try {

        // ======================================================
        // GET AUTHORIZATION HEADER
        // ======================================================

        const authHeader = req.headers.authorization;


        // ======================================================
        // CHECK TOKEN EXISTS
        // ======================================================

        if (!authHeader) {

            return res.status(401).json({

                error:
                    "Access denied. Authentication token is required."

            });

        }


        // ======================================================
        // CHECK BEARER FORMAT
        // ======================================================

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                error:
                    "Invalid authorization format."

            });

        }


        // ======================================================
        // EXTRACT TOKEN
        // ======================================================

        const token = authHeader.substring(7).trim();


        // ======================================================
        // CHECK TOKEN EXISTS
        // ======================================================

        if (!token) {

            return res.status(401).json({

                error:
                    "Authentication token is missing."

            });

        }


        // ======================================================
        // CHECK JWT SECRET
        // ======================================================

        if (!process.env.JWT_SECRET) {

            console.error(
                "[AUTH ERROR]: JWT_SECRET is not configured."
            );

            return res.status(500).json({

                error:
                    "Server authentication configuration is missing."

            });

        }


        // ======================================================
        // VERIFY JWT
        // ======================================================

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );


        // ======================================================
        // CHECK USER ID
        // ======================================================

        if (!decoded.id) {

            return res.status(401).json({

                error:
                    "Invalid authentication token."

            });

        }


        // ======================================================
        // NORMALIZE ROLE
        // ======================================================

        const normalizedRole = decoded.role

            ? String(decoded.role)
                .toLowerCase()
                .trim()

            : "";


        // ======================================================
        // CHECK ROLE
        // ======================================================

        if (!normalizedRole) {

            return res.status(401).json({

                error:
                    "Authentication token does not contain a valid role."

            });

        }


        // ======================================================
        // STORE USER INFORMATION
        // ======================================================

        req.user = {

            id: decoded.id,

            role: normalizedRole

        };


        // ======================================================
        // DEBUG
        // ======================================================

        console.log(

            "[AUTH CHECK] User:",
            req.user.id,
            "| Role:",
            req.user.role

        );


        // ======================================================
        // CONTINUE
        // ======================================================

        next();

    }


    // ==========================================================
    // JWT EXPIRED
    // ==========================================================

    catch (error) {

        console.error(

            "[AUTH ERROR]:",
            error.name,
            "|",
            error.message

        );


        // ======================================================
        // EXPIRED TOKEN
        // ======================================================

        if (error.name === "TokenExpiredError") {

            return res.status(401).json({

                error:
                    "Authentication token has expired. Please log in again.",

                code:
                    "TOKEN_EXPIRED"

            });

        }


        // ======================================================
        // INVALID TOKEN
        // ======================================================

        if (error.name === "JsonWebTokenError") {

            return res.status(401).json({

                error:
                    "Invalid authentication token.",

                code:
                    "INVALID_TOKEN"

            });

        }


        // ======================================================
        // OTHER JWT ERROR
        // ======================================================

        return res.status(401).json({

            error:
                "Authentication failed.",

            code:
                "AUTHENTICATION_FAILED"

        });

    }

};


// ==========================================================
// ROLE AUTHORIZATION
// ==========================================================

const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        // ======================================================
        // CHECK AUTHENTICATION
        // ======================================================

        if (!req.user) {

            return res.status(401).json({

                error:
                    "Authentication required."

            });

        }


        // ======================================================
        // NORMALIZE ALLOWED ROLES
        // ======================================================

        const normalizedAllowedRoles = allowedRoles.map(

            (role) =>
                String(role)
                    .toLowerCase()
                    .trim()

        );


        // ======================================================
        // DEBUG
        // ======================================================

        console.log(

            "[ROLE CHECK]",

            "User:",
            req.user.id,

            "| Role:",
            req.user.role,

            "| Allowed:",
            normalizedAllowedRoles

        );


        // ======================================================
        // CHECK ROLE
        // ======================================================

        if (
            !normalizedAllowedRoles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({

                error:
                    "You do not have permission to perform this action."

            });

        }


        // ======================================================
        // ROLE ACCEPTED
        // ======================================================

        next();

    };

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    verifyToken,

    authorizeRoles

};