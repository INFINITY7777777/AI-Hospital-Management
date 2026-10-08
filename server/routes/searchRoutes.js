const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controllers/searchController");
const { verifyToken } = require("../middleware/authMiddleware");

// Mount global search endpoint
router.get("/", verifyToken, globalSearch);

module.exports = router;