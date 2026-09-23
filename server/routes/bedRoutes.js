const express = require("express");
const router = express.Router();

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    addBed,
    getAllBeds,
    getBedById,
    updateBed,
    deleteBed,
    assignBed,
    releaseBed
} = require("../controllers/bedController");

// ==========================================================
// BED CRUD
// ==========================================================

// Create new bed (Admin only)
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    addBed
);

// Get all beds (Admin, Doctor, Staff)
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    getAllBeds
);

// Get single bed by ID (Admin, Doctor, Staff)
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    getBedById
);

// Update bed details (Admin only)
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    updateBed
);

// Delete bed (Admin only)
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deleteBed
);

// ==========================================================
// BED ASSIGNMENT & RELEASE (Admin & Staff Only)
// ==========================================================

// Assign patient to bed
router.put(
    "/:id/assign",
    verifyToken,
    authorizeRoles("admin", "staff"),
    assignBed
);

// Release bed
router.put(
    "/:id/release",
    verifyToken,
    authorizeRoles("admin", "staff"),
    releaseBed
);

module.exports = router;