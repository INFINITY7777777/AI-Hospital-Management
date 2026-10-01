const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { getPrompts, updatePrompt } = require("../controllers/promptController");

router.get("/", verifyToken, authorizeRoles("admin"), getPrompts);
router.put("/:key", verifyToken, authorizeRoles("admin"), updatePrompt);

module.exports = router;