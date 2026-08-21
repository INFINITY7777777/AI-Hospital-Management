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
    const patientsResult = await db.query(
      `SELECT COUNT(*) AS total_patients FROM patients;`
    );

    const doctorsResult = await db.query(
      `SELECT COUNT(*) AS total_doctors FROM doctors;`
    );

    const appointmentsResult = await db.query(
      `SELECT COUNT(*) AS total_appointments FROM appointments;`
    );

    // Counts ALL appointments scheduled for today
    const todayAppointmentsResult = await db.query(
      `SELECT COUNT(*) AS today_appointments 
       FROM appointments 
       WHERE appointment_date = CURRENT_DATE;`
    );

    // Counts upcoming appointments excluding Completed and Cancelled
    const upcomingAppointmentsResult = await db.query(
      `SELECT COUNT(*) AS upcoming_appointments 
       FROM appointments 
       WHERE appointment_date > CURRENT_DATE 
       AND status NOT IN ('Completed', 'Cancelled');`
    );

    const admissionsResult = await db.query(
      `SELECT COUNT(*) AS total_admissions FROM admissions;`
    );

    const activeAdmissionsResult = await db.query(
      `SELECT COUNT(*) AS active_admissions 
       FROM admissions 
       WHERE status = 'Admitted';`
    );

    const occupiedBedsResult = await db.query(
      `SELECT COUNT(*) AS occupied_beds 
       FROM beds 
       WHERE status = 'Occupied';`
    );

    const availableBedsResult = await db.query(
      `SELECT COUNT(*) AS available_beds 
       FROM beds 
       WHERE status = 'Available';`
    );

    const recentPatientsResult = await db.query(
      `SELECT id, patient_name, age, gender, created_at 
       FROM patients 
       ORDER BY created_at DESC 
       LIMIT 5;`
    );

    res.status(200).json({
      statistics: {
        totalPatients: Number(patientsResult.rows[0].total_patients),
        totalDoctors: Number(doctorsResult.rows[0].total_doctors),
        totalAppointments: Number(appointmentsResult.rows[0].total_appointments),
        todayAppointments: Number(todayAppointmentsResult.rows[0].today_appointments),
        upcomingAppointments: Number(upcomingAppointmentsResult.rows[0].upcoming_appointments),
        totalAdmissions: Number(admissionsResult.rows[0].total_admissions),
        activeAdmissions: Number(activeAdmissionsResult.rows[0].active_admissions),
        occupiedBeds: Number(occupiedBedsResult.rows[0].occupied_beds),
        availableBeds: Number(availableBedsResult.rows[0].available_beds)
      },
      recentPatients: recentPatientsResult.rows
    });
  } catch (error) {
    console.error("[Dashboard Error]:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

// ==========================================================
// GET TODAY'S APPOINTMENTS
// Returns ALL appointments scheduled for today (Scheduled, Completed, Cancelled)
// ==========================================================
const getTodayAppointments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
          appointments.id,
          appointments.appointment_date,
          appointments.appointment_time,
          appointments.reason,
          appointments.status,
          patients.patient_name,
          doctors.doctor_name,
          doctors.specialization
       FROM appointments
       LEFT JOIN patients ON appointments.patient_id = patients.id
       LEFT JOIN doctors ON appointments.doctor_id = doctors.id
       WHERE appointments.appointment_date = CURRENT_DATE
       ORDER BY appointments.appointment_time ASC;`
    );

    res.status(200).json({ appointments: result.rows });
  } catch (error) {
    console.error("[Today's Appointments Error]:", error);
    res.status(500).json({ error: "Failed to fetch today's appointments" });
  }
};

// ==========================================================
// GET UPCOMING APPOINTMENTS
// Returns pending upcoming appointments scheduled after today
// ==========================================================
const getUpcomingAppointments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
          appointments.id,
          appointments.appointment_date,
          appointments.appointment_time,
          appointments.reason,
          appointments.status,
          patients.patient_name,
          doctors.doctor_name,
          doctors.specialization
       FROM appointments
       LEFT JOIN patients ON appointments.patient_id = patients.id
       LEFT JOIN doctors ON appointments.doctor_id = doctors.id
       WHERE appointments.appointment_date > CURRENT_DATE
       AND appointments.status NOT IN ('Completed', 'Cancelled')
       ORDER BY appointments.appointment_date ASC, appointments.appointment_time ASC;`
    );

    res.status(200).json({ appointments: result.rows });
  } catch (error) {
    console.error("[Upcoming Appointments Error]:", error);
    res.status(500).json({ error: "Failed to fetch upcoming appointments" });
  }
};

// ==========================================================
// GET BED OCCUPANCY SUMMARY
// Aggregates total, occupied, and available beds
// ==========================================================
const getBedOccupancySummary = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
          COALESCE(bed_type, 'General Ward') AS ward_name,
          COUNT(*) AS total_beds,
          COUNT(CASE WHEN status = 'Occupied' THEN 1 END) AS occupied_beds,
          COUNT(CASE WHEN status = 'Available' THEN 1 END) AS available_beds
       FROM beds
       GROUP BY COALESCE(bed_type, 'General Ward')
       ORDER BY ward_name ASC;`
    );

    res.status(200).json({ wardSummary: result.rows });
  } catch (error) {
    console.error("[Bed Occupancy Summary Error]:", error);
    res.status(500).json({ error: "Failed to fetch bed occupancy summary" });
  }
};

// ==========================================================
// GET PATIENT TRAFFIC TRENDS
// Aggregates weekly appointments grouped by day
// ==========================================================
const getPatientTrends = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(appointment_date, 'Dy') AS day,
        COUNT(id) AS count
      FROM appointments
      WHERE DATE_TRUNC('week', appointment_date) = DATE_TRUNC('week', NOW())
      GROUP BY TO_CHAR(appointment_date, 'Dy'), EXTRACT(ISODOW FROM appointment_date)
      ORDER BY EXTRACT(ISODOW FROM appointment_date) ASC;
    `;

    const result = await db.query(query);

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const formattedData = daysOfWeek.map((day) => {
      const found = result.rows.find(
        (r) => r.day && r.day.trim().toLowerCase() === day.toLowerCase()
      );
      return {
        day,
        count: found ? parseInt(found.count, 10) : 0,
      };
    });

    res.status(200).json({ trends: formattedData });
  } catch (error) {
    console.error("[Patient Trends Error]:", error);
    res.status(500).json({ error: "Failed to fetch patient trend data" });
  }
};

// ==========================================================
// EXPORT CONTROLLER
// ==========================================================
module.exports = {
  getDashboardStats,
  getTodayAppointments,
  getUpcomingAppointments,
  getBedOccupancySummary,
  getPatientTrends,
  
};