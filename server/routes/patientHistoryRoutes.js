const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/patientHistoryController");

if (typeof auth.verifyToken !== "function") {
    throw new Error(
        "patientHistoryRoutes: verifyToken is not exported by authMiddleware.js"
    );
}

if (typeof auth.authorizeRoles !== "function") {
    throw new Error(
        "patientHistoryRoutes: authorizeRoles is not exported by authMiddleware.js"
    );
}

if (typeof controller.getPatientMedicalHistory !== "function") {
    throw new Error(
        "patientHistoryRoutes: getPatientMedicalHistory is not exported by patientHistoryController.js"
    );
}

if (typeof controller.getPatientStayHistory !== "function") {
    throw new Error(
        "patientHistoryRoutes: getPatientStayHistory is not exported by patientHistoryController.js"
    );
}

router.get(
    "/patient/:patientId",
    auth.verifyToken,
    auth.authorizeRoles("admin", "doctor", "staff"),
    controller.getPatientMedicalHistory
);

router.get(
    "/patient/:patientId/stays",
    auth.verifyToken,
    auth.authorizeRoles("admin", "doctor", "staff"),
    controller.getPatientStayHistory
);

module.exports = router;