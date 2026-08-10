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

router.post(

    "/",

    verifyToken,

    authorizeRoles("admin"),

    addBed

);


// ==========================================================
// GET ALL BEDS
// GET /api/beds
// ==========================================================

router.get(

    "/",

    verifyToken,

    authorizeRoles(

        "admin",

        "doctor",

        "staff"

    ),

    getAllBeds

);


// ==========================================================
// GET BED BY ID
// GET /api/beds/:id
// ==========================================================

router.get(

    "/:id",

    verifyToken,

    authorizeRoles(

        "admin",

        "doctor",

        "staff"

    ),

    getBedById

);


// ==========================================================
// UPDATE BED
// PUT /api/beds/:id
// ==========================================================

router.put(

    "/:id",

    verifyToken,

    authorizeRoles("admin"),

    updateBed

);


// ==========================================================
// DELETE BED
// DELETE /api/beds/:id
// ==========================================================

router.delete(

    "/:id",

    verifyToken,

    authorizeRoles("admin"),

    deleteBed

);


// ==========================================================
// ASSIGN BED
// ==========================================================

router.put(

    "/:id/assign",

    verifyToken,

    authorizeRoles(

        "admin",

        "doctor",

        "staff"

    ),

    assignBed

);


// ==========================================================
// RELEASE BED
// ==========================================================

router.put(

    "/:id/release",

    verifyToken,

    authorizeRoles(

        "admin",

        "doctor",

        "staff"

    ),

    releaseBed

);


module.exports = router;