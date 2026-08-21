// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const db = require("../config/db");


// ==========================================================
// ADD APPOINTMENT
// Saves a new appointment into the database
// ==========================================================

const addAppointment = async (req, res) => {

    try {

        // ==========================================================
        // GET DATA FROM REQUEST BODY
        // ==========================================================

        const {

            patientId,
            doctorId,
            appointmentDate,
            appointmentTime,
            reason

        } = req.body;


        // ==========================================================
        // DISPLAY RECEIVED DATA
        // ==========================================================

        console.log(req.body);


        // ==========================================================
        // INSERT APPOINTMENT INTO DATABASE
        // ==========================================================

        const result = await db.query(
            `
            INSERT INTO appointments (
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time,
                reason
            )
            VALUES (
                $1, $2, $3, $4, $5
            )
            RETURNING *;
            `,
            [
                patientId,
                doctorId,
                appointmentDate,
                appointmentTime,
                reason
            ]
        );


        // ==========================================================
        // SEND SUCCESS RESPONSE
        // ==========================================================

        res.status(201).json({

            message: "Appointment created successfully",

            appointment: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Appointment Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to create appointment"

        });

    }

};

// ==========================================================
// GET ALL APPOINTMENTS
// Fetches all appointments with patient and doctor details
// ==========================================================

const getAllAppointments = async (req, res) => {

    try {

        // ==========================================================
        // FETCH APPOINTMENTS
        // JOIN PATIENTS AND DOCTORS TABLES
        // ==========================================================

        const result = await db.query(
            `
            SELECT
                appointments.id,
                appointments.appointment_date,
                appointments.appointment_time,
                appointments.reason,
                appointments.status,
                appointments.created_at,

                patients.id AS patient_id,
                patients.patient_name,

                doctors.id AS doctor_id,
                doctors.doctor_name,
                doctors.specialization

            FROM appointments

            INNER JOIN patients
                ON appointments.patient_id = patients.id

            INNER JOIN doctors
                ON appointments.doctor_id = doctors.id

            ORDER BY
                appointments.appointment_date ASC,
                appointments.appointment_time ASC;
            `
        );


        // ==========================================================
        // SEND APPOINTMENTS TO FRONTEND
        // ==========================================================

        res.status(200).json({

            appointments: result.rows

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Appointment Fetch Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to fetch appointments"

        });

    }

};

// ==========================================================
// GET APPOINTMENT BY ID
// Fetches one specific appointment
// Includes patient and doctor details
// ==========================================================

const getAppointmentById = async (req, res) => {

    try {

        // ==========================================================
        // GET APPOINTMENT ID FROM URL
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // FETCH APPOINTMENT
        // JOIN PATIENTS AND DOCTORS
        // ==========================================================

        const result = await db.query(
            `
            SELECT
                appointments.id,
                appointments.appointment_date,
                appointments.appointment_time,
                appointments.reason,
                appointments.status,
                appointments.created_at,

                patients.id AS patient_id,
                patients.patient_name,
                patients.age,
                patients.gender,
                patients.phone,

                doctors.id AS doctor_id,
                doctors.doctor_name,
                doctors.specialization,
                doctors.phone AS doctor_phone,
                doctors.department

            FROM appointments

            INNER JOIN patients
                ON appointments.patient_id = patients.id

            INNER JOIN doctors
                ON appointments.doctor_id = doctors.id

            WHERE appointments.id = $1;
            `,
            [id]
        );


        // ==========================================================
        // CHECK IF APPOINTMENT EXISTS
        // ==========================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Appointment not found"

            });

        }


        // ==========================================================
        // SEND APPOINTMENT DATA
        // ==========================================================

        res.status(200).json({

            appointment: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Appointment Details Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to fetch appointment"

        });

    }

};


// ==========================================================
// UPDATE APPOINTMENT
// Updates an existing appointment safely using COALESCE
// ==========================================================

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      status,
    } = req.body;

    // COALESCE checks if the incoming variable is NULL/undefined; 
    // if it is, it retains the existing database column value.
    const result = await db.query(
      `
      UPDATE appointments
      SET
          patient_id = COALESCE($1, patient_id),
          doctor_id = COALESCE($2, doctor_id),
          appointment_date = COALESCE($3, appointment_date),
          appointment_time = COALESCE($4, appointment_time),
          reason = COALESCE($5, reason),
          status = COALESCE($6, status)
      WHERE id = $7
      RETURNING *;
      `,
      [
        patientId || null,
        doctorId || null,
        appointmentDate || null,
        appointmentTime || null,
        reason || null,
        status || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Appointment not found",
      });
    }

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment: result.rows[0],
    });
  } catch (error) {
    console.error("[Appointment Update Error]:", error);

    res.status(500).json({
      error: "Failed to update appointment",
    });
  }
};

// ==========================================================
// DELETE APPOINTMENT
// Deletes an existing appointment
// ==========================================================

const deleteAppointment = async (req, res) => {

    try {

        // ==========================================================
        // GET APPOINTMENT ID FROM URL
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // DELETE APPOINTMENT
        // ==========================================================

        const result = await db.query(
            `
            DELETE FROM appointments
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );


        // ==========================================================
        // CHECK IF APPOINTMENT EXISTS
        // ==========================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Appointment not found"

            });

        }


        // ==========================================================
        // SEND SUCCESS RESPONSE
        // ==========================================================

        res.status(200).json({

            message: "Appointment deleted successfully",

            appointment: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Appointment Delete Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to delete appointment"

        });

    }

};


// ==========================================================
// EXPORT CONTROLLER
// ==========================================================

module.exports = {

    addAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    

};