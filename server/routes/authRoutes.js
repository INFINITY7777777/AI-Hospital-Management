const express = require("express");

const router = express.Router();

// Import both functions from authController
const {
    registerUser,
    loginUser
} = require("../controllers/authController");

// Registration Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

module.exports = router;