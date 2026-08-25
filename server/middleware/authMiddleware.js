// ==========================================================
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================================

const jwt = require("jsonwebtoken");

// ==========================================================
// VERIFY JWT TOKEN
// ==========================================================

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Access denied. Authentication token is required."
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Invalid authorization format."
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        error: "Authentication token is missing."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[AUTH ERROR]: JWT_SECRET is not configured.");
      return res.status(500).json({
        error: "Server authentication configuration is missing."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        error: "Invalid authentication token."
      });
    }

    const normalizedRole = decoded.role
      ? String(decoded.role).toLowerCase().trim()
      : "";

    if (!normalizedRole) {
      return res.status(401).json({
        error: "Authentication token does not contain a valid role."
      });
    }

    req.user = {
      id: decoded.id,
      role: normalizedRole
    };

    console.log("[AUTH CHECK] User:", req.user.id, "| Role:", req.user.role);

    next();
  } catch (error) {
    console.error("[AUTH ERROR]:", error.name, "|", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Authentication token has expired. Please log in again.",
        code: "TOKEN_EXPIRED"
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid authentication token.",
        code: "INVALID_TOKEN"
      });
    }

    return res.status(401).json({
      error: "Authentication failed.",
      code: "AUTHENTICATION_FAILED"
    });
  }
};

// ==========================================================
// ROLE AUTHORIZATION
// ==========================================================

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required."
      });
    }

    // .flat() handles both array input ['admin', 'doctor'] and comma input 'admin', 'doctor'
    const normalizedAllowedRoles = allowedRoles
      .flat()
      .map((role) => String(role).toLowerCase().trim());

    console.log(
      "[ROLE CHECK]",
      "User:",
      req.user.id,
      "| Role:",
      req.user.role,
      "| Allowed:",
      normalizedAllowedRoles
    );

    if (!normalizedAllowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "You do not have permission to perform this action."
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};