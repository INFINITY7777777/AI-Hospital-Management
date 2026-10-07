const express = require("express");
const router = express.Router();

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    addDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController");

// ==========================================================
// CREATE DOCTOR (Admin and Doctor can add new doctors)
// ==========================================================
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin", "doctor"),
    addDoctor
);

// ==========================================================
// GET ALL DOCTORS (Admin, Doctor, Staff)
// ==========================================================
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    getAllDoctors
);

// ==========================================================
// GET DOCTOR BY ID (Admin, Doctor, Staff)
// ==========================================================
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    getDoctorById
);

// ==========================================================
// UPDATE DOCTOR (Admin can update all; Doctor can update self)
// ==========================================================
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "doctor"),
    updateDoctor
);

// ==========================================================
// DELETE DOCTOR (Only Admin)
// ==========================================================
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deleteDoctor
);

module.exports = router;