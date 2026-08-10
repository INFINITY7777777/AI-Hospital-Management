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


        if (!authHeader) {

            return res.status(401).json({

                error: "Access denied. Authentication token is required."

            });

        }


        // ======================================================
        // CHECK BEARER FORMAT
        // ======================================================

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({

                error: "Invalid authorization format."

            });

        }


        // ======================================================
        // EXTRACT TOKEN
        // ======================================================

        const token = authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({

                error: "Authentication token is missing."

            });

        }


        // ======================================================
        // VERIFY TOKEN
        // ======================================================

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );


        // ======================================================
        // NORMALIZE ROLE
        // ======================================================

        const normalizedRole = decoded.role
            ? decoded.role.toLowerCase().trim()
            : "";


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

    catch (error) {

        console.error(

            "[AUTH ERROR]:",

            error.message

        );


        return res.status(401).json({

            error: "Invalid or expired authentication token."

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

                error: "Authentication required."

            });

        }


        // ======================================================
        // NORMALIZE ALLOWED ROLES
        // ======================================================

        const normalizedAllowedRoles = allowedRoles.map(

            (role) => role.toLowerCase().trim()

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

        if (!normalizedAllowedRoles.includes(req.user.role)) {

            return res.status(403).json({

                error: "You do not have permission to perform this action."

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