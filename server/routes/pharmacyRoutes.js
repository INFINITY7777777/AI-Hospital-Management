const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { getMedicines, addMedicine, updateMedicine, deleteMedicine } = require("../controllers/pharmacyController");

const allowedRoles = ["admin", "doctor", "staff"];

router.get("/", verifyToken, authorizeRoles(...allowedRoles), getMedicines);
router.post("/", verifyToken, authorizeRoles(...allowedRoles), addMedicine);
router.put("/:id", verifyToken, authorizeRoles(...allowedRoles), updateMedicine);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteMedicine);

module.exports = router;