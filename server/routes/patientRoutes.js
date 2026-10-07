const express = require("express");
const router = express.Router();

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
    addPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
} = require("../controllers/patientController");

router.post("/", verifyToken, authorizeRoles("admin", "doctor", "staff"), addPatient);
router.get("/", verifyToken, authorizeRoles("admin", "doctor", "staff"), getAllPatients);
router.get("/:id", verifyToken, authorizeRoles("admin", "doctor", "staff"), getPatientById);
router.put("/:id", verifyToken, authorizeRoles("admin", "doctor", "staff"), updatePatient);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deletePatient);

module.exports = router;