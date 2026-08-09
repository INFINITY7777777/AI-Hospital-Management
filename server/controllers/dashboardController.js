// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const db = require("../config/db");


// ==========================================================
// GET DASHBOARD STATISTICS
// Returns important hospital statistics
// ==========================================================

const getDashboardStats = async (req, res) => {

    try {

        // ==========================================================
        // GET TOTAL PATIENTS
        // ==========================================================

        const patientsResult = await db.query(
            `
            SELECT COUNT(*) AS total_patients
            FROM patients;
            `
        );


        // ==========================================================
        // GET TOTAL DOCTORS
        // ==========================================================

        const doctorsResult = await db.query(
            `
            SELECT COUNT(*) AS total_doctors
            FROM doctors;
            `
        );


        // ==========================================================
        // GET TOTAL APPOINTMENTS
        // ==========================================================

        const appointmentsResult = await db.query(
            `
            SELECT COUNT(*) AS total_appointments
            FROM appointments;
            `
        );


        // ==========================================================
        // GET TODAY'S APPOINTMENTS
        // ==========================================================

        const todayAppointmentsResult = await db.query(
            `
            SELECT COUNT(*) AS today_appointments
            FROM appointments
            WHERE appointment_date = CURRENT_DATE;
            `
        );


        // ==========================================================
        // GET UPCOMING APPOINTMENTS
        // ==========================================================

        const upcomingAppointmentsResult = await db.query(
            `
            SELECT COUNT(*) AS upcoming_appointments
            FROM appointments
            WHERE appointment_date >= CURRENT_DATE
            AND status NOT IN ('Completed', 'Cancelled');
            `
        );


        // ==========================================================
        // GET TOTAL ADMISSIONS
        // ==========================================================

        const admissionsResult = await db.query(
            `
            SELECT COUNT(*) AS total_admissions
            FROM admissions;
            `
        );


        // ==========================================================
        // GET ACTIVE ADMISSIONS
        // Only currently admitted patients
        // ==========================================================

        const activeAdmissionsResult = await db.query(
            `
            SELECT COUNT(*) AS active_admissions
            FROM admissions
            WHERE status = 'Admitted';
            `
        );


        // ==========================================================
        // GET OCCUPIED BEDS
        // ==========================================================

        const occupiedBedsResult = await db.query(
            `
            SELECT COUNT(*) AS occupied_beds
            FROM beds
            WHERE status = 'Occupied';
            `
        );


        // ==========================================================
        // GET AVAILABLE BEDS
        // ==========================================================

        const availableBedsResult = await db.query(
            `
            SELECT COUNT(*) AS available_beds
            FROM beds
            WHERE status = 'Available';
            `
        );


        // ==========================================================
        // GET RECENT PATIENTS
        // Latest 5 patients
        // ==========================================================

        const recentPatientsResult = await db.query(
            `
            SELECT *
            FROM patients
            ORDER BY created_at DESC
            LIMIT 5;
            `
        );


        // ==========================================================
        // SEND DASHBOARD DATA
        // ==========================================================

        res.status(200).json({

            statistics: {

                // ==================================================
                // PATIENT STATISTICS
                // ==================================================

                totalPatients:
                    Number(
                        patientsResult.rows[0].total_patients
                    ),


                // ==================================================
                // DOCTOR STATISTICS
                // ==================================================

                totalDoctors:
                    Number(
                        doctorsResult.rows[0].total_doctors
                    ),


                // ==================================================
                // APPOINTMENT STATISTICS
                // ==================================================

                totalAppointments:
                    Number(
                        appointmentsResult.rows[0].total_appointments
                    ),


                todayAppointments:
                    Number(
                        todayAppointmentsResult.rows[0].today_appointments
                    ),


                upcomingAppointments:
                    Number(
                        upcomingAppointmentsResult.rows[0].upcoming_appointments
                    ),


                // ==================================================
                // ADMISSION STATISTICS
                // ==================================================

                totalAdmissions:
                    Number(
                        admissionsResult.rows[0].total_admissions
                    ),


                activeAdmissions:
                    Number(
                        activeAdmissionsResult.rows[0].active_admissions
                    ),


                // ==================================================
                // BED STATISTICS
                // ==================================================

                occupiedBeds:
                    Number(
                        occupiedBedsResult.rows[0].occupied_beds
                    ),


                availableBeds:
                    Number(
                        availableBedsResult.rows[0].available_beds
                    )

            },


            // ======================================================
            // RECENT PATIENTS
            // ======================================================

            recentPatients:
                recentPatientsResult.rows

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

   catch (error) {

        console.error(
            "[Dashboard Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to fetch dashboard statistics"

        });

    }

};

// ==========================================================
// GET TODAY'S APPOINTMENTS
// Returns all appointments scheduled for today
// ==========================================================

const getTodayAppointments = async (req, res) => {

    try {

        // ==========================================================
        // GET TODAY'S APPOINTMENTS
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

                patients.patient_name,

                doctors.doctor_name,
                doctors.specialization

            FROM appointments

            LEFT JOIN patients
                ON appointments.patient_id = patients.id

            LEFT JOIN doctors
                ON appointments.doctor_id = doctors.id

            WHERE appointments.appointment_date = CURRENT_DATE

            ORDER BY appointments.appointment_time ASC;
            `
        );


        // ==========================================================
        // SEND RESPONSE
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
            "[Today's Appointments Error]:",
            error
        );


        res.status(500).json({

            error: "Failed to fetch today's appointments"

        });

    }

};

// ==========================================================
// GET UPCOMING APPOINTMENTS
// Returns appointments scheduled after today
// ==========================================================

const getUpcomingAppointments = async (req, res) => {

    try {

        // ==========================================================
        // GET UPCOMING APPOINTMENTS
        // ==========================================================

        const result = await db.query(
            `
            SELECT
                appointments.id,
                appointments.appointment_date,
                appointments.appointment_time,
                appointments.reason,
                appointments.status,

                patients.patient_name,

                doctors.doctor_name,
                doctors.specialization

            FROM appointments

            LEFT JOIN patients
                ON appointments.patient_id = patients.id

            LEFT JOIN doctors
                ON appointments.doctor_id = doctors.id

            WHERE appointments.appointment_date > CURRENT_DATE

            ORDER BY
                appointments.appointment_date ASC,
                appointments.appointment_time ASC;
            `
        );


        // ==========================================================
        // SEND RESPONSE
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
            "[Upcoming Appointments Error]:",
            error
        );


        res.status(500).json({

            error: "Failed to fetch upcoming appointments"

        });

    }

};

// ==========================================================
// EXPORT CONTROLLER
// ==========================================================

module.exports = {

    getDashboardStats,

    getTodayAppointments,

    getUpcomingAppointments,
    


};