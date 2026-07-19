// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const db = require("../config/db");

// ==========================================================
// ADD PATIENT
// Saves a new patient into the database
// ==========================================================

const addPatient = async (req, res) => {

    try {

        // ==========================================================
        // GET DATA FROM REQUEST BODY
        // ==========================================================

        const {

            patientName,
            age,
            gender,
            bloodGroup,
            phone,
            address,
            emergencyContact,
            doctor,
            ward,
            bedNumber,
            diagnosis,
            admissionDate

        } = req.body;

        console.log(req.body);

        res.status(200).json({
            message: "Patient Controller Connected Successfully!"
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error"
        });

    }

};

module.exports = {

    addPatient

};