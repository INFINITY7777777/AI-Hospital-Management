# PROJECT_ARCHITECTURE

## Table of Contents

- [Dashboard](#dashboard)
- [Patients](#patients)
- [Doctors](#doctors)
- [Appointments](#appointments)
- [Admissions](#admissions)
- [Beds](#beds)
- [Doctor Details](#doctor-details)
- [Bed Details](#bed-details)
- [Notifications](#notifications)

---

## Dashboard

**Page Component:** `client/src/pages/Dashboard.jsx`

**UI Components:** Navbar, Sidebar, DashboardCard

**Routes & Endpoints:**
- `GET /api/dashboard/stats` - dashboard statistics
- `GET /api/dashboard/today-appointments` - today's appointments
- `GET /api/dashboard/upcoming-appointments` - upcoming appointments

**Backend Controllers & Routes:**
- `dashboardRoutes.js`: `/api/dashboard/stats`, `/api/dashboard/today-appointments`, `/api/dashboard/upcoming-appointments`
- `dashboardController.js`: `getDashboardStats`, `getTodayAppointments`, `getUpcomingAppointments`
- Models: `patients`, `doctors`, `appointments`, `admissions`, `beds` tables

**Dependency Map:**

```
Dashboard.jsx
  → axios.get("http://localhost:5000/api/dashboard/stats")
  → dashboardController.getDashboardStats
  → db.query("SELECT COUNT(*) FROM patients")
  → db.query("SELECT COUNT(*) FROM doctors")
  → db.query("SELECT COUNT(*) FROM appointments")
  → db.query("SELECT COUNT(*) FROM admissions")
  → db.query("SELECT COUNT(*) FROM beds WHERE status='Occupied'")
  → db.query("SELECT COUNT(*) FROM beds WHERE status='Available'")
```

### Under ## Dashboard section in PROJECT_ARCHITECTURE.md

**Routes & Endpoints:**
- `GET /api/dashboard/stats` - dashboard statistics
- `GET /api/dashboard/today-appointments` - today's appointments
- `GET /api/dashboard/upcoming-appointments` - upcoming appointments
- `GET /api/dashboard/patient-trends` - weekly patient traffic trends (NEW)

**Backend Controllers & Routes:**
- `dashboardRoutes.js`: `/api/dashboard/stats`, `/api/dashboard/today-appointments`, `/api/dashboard/upcoming-appointments`, `/api/dashboard/patient-trends`
- `dashboardController.js`: `getDashboardStats`, `getTodayAppointments`, `getUpcomingAppointments`, `getPatientTrends`
- Models: `patients`, `doctors`, `appointments`, `admissions`, `beds` tables

**Dependency Map (Updated):**
Dashboard.jsx
  → PatientTrendChart.jsx
    → axios.get("http://localhost:5000/api/dashboard/patient-trends")
    → dashboardController.getPatientTrends
    → db.query("SELECT TO_CHAR(appointment_date, 'Dy')... GROUP BY DATE_TRUNC('week')")

    
---

## Patients

**Page Component:** `client/src/pages/Patients.jsx`

**UI Components:** AddPatientForm, PatientSearch, PatientList

**Routes & Endpoints:**
- `GET /api/patients` - list all patients
- `POST /api/patients` - add new patient
- `GET /api/patients/:id` - get patient by ID
- `PUT /api/patients/:id` - update patient
- `DELETE /api/patients/:id` - delete patient

**Backend Controllers & Routes:**
- `patientRoutes.js`: `/`, `/`, `/:id`, `/:id`, `/:id`
- `patientController.js`: `addPatient`, `getAllPatients`, `getPatientById`, `updatePatient`, `deletePatient`
- Models: `patients` table

**Dependency Map:**

```
Patients.jsx
  → PatientList
    → api.get("/patients")
    → patientController.getAllPatients
    → db.query("SELECT * FROM patients ORDER BY created_at DESC")
  → AddPatientForm
    → api.post("/patients", patientData)
    → patientController.addPatient
    → db.query("INSERT INTO patients ...")
```

---

## Doctors

**Page Component:** `client/src/pages/Doctors.jsx`

**UI Components:** AddDoctorForm, DoctorList

**Routes & Endpoints:**
- `GET /api/doctors` - list all doctors
- `POST /api/doctors` - add new doctor
- `GET /api/doctors/:id` - get doctor by ID
- `PUT /api/doctors/:id` - update doctor
- `DELETE /api/doctors/:id` - delete doctor

**Backend Controllers & Routes:**
- `doctorRoutes.js`: `/`, `/`, `/:id`, `/:id`, `/:id`
- `doctorController.js`: `addDoctor`, `getAllDoctors`, `getDoctorById`, `updateDoctor`, `deleteDoctor`
- Models: `doctors` table

**Dependency Map:**

```
Doctors.jsx
  → DoctorList
    → api.get("/doctors")
    → doctorController.getAllDoctors
    → db.query("SELECT * FROM doctors ORDER BY created_at DESC")
  → AddDoctorForm
    → axios.post("http://localhost:5000/api/doctors", doctorData, {headers: {...}})
    → doctorController.addDoctor
    → db.query("INSERT INTO doctors ...")
```

---

## Appointments

**Page Component:** `client/src/pages/Appointments.jsx`

**UI Components:** AddAppointmentForm, AppointmentList

**Routes & Endpoints:**
- `GET /api/appointments` - list all appointments
- `POST /api/appointments` - add new appointment
- `GET /api/appointments/:id` - get appointment by ID
- `PUT /api/appointments/:id` - update appointment
- `DELETE /api/appointments/:id` - delete appointment

**Backend Controllers & Routes:**
- `appointmentRoutes.js`: `/`, `/`, `/:id`, `/:id`, `/:id`
- `appointmentController.js`: `addAppointment`, `getAllAppointments`, `getAppointmentById`, `updateAppointment`, `deleteAppointment`
- Models: `appointments` table

**Dependency Map:**

```
Appointments.jsx
  → AppointmentList
    → axios.get("http://localhost:5000/api/appointments", {headers: {...}})
    → appointmentController.getAllAppointments
    → db.query("SELECT ... FROM appointments INNER JOIN patients ... INNER JOIN doctors ...")
  → AddAppointmentForm
    → axios.post("http://localhost:5000/api/appointments", {...}, {headers: {...}})
    → appointmentController.addAppointment
    → db.query("INSERT INTO appointments ...")
```

---

## Admissions

**Page Component:** `client/src/pages/Admissions.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/admissions` - list all admissions
- `POST /api/admissions` - add new admission
- `GET /api/admissions/:id` - get admission by ID
- `PUT /api/admissions/:id` - update admission
- `PUT /api/admissions/:id/discharge` - discharge patient
- `DELETE /api/admissions/:id` - delete admission (discharged only)

**Backend Controllers & Routes:**
- `admissionRoutes.js`: `/`, `/`, `/:id`, `/:id`, `/:id/discharge`, `/:id`
- `admissioncontroller.js`: `addAdmission`, `getAdmissions`, `getAdmissionById`, `updateAdmission`, `dischargePatient`, `deleteAdmission`
- Models: `admissions`, `beds`, `patient_stay_history` tables

**Dependency Map:**

```
Admissions.jsx
  → api.get("/api/admissions")
  → admissionController.getAdmissions
  → pool.query("SELECT ... FROM admissions INNER JOIN patients LEFT JOIN beds ...")
  → api.delete(`http://localhost:5000/api/admissions/${admission.id}`)
  → admissionController.deleteAdmission
  → pool.query("DELETE FROM admissions WHERE id = $1 RETURNING *")
```

---
## Pharmacy

**Page Component:** `client/src/pages/Pharmacy.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/pharmacy` - list all medicine inventory
- `POST /api/pharmacy` - add new medicine item
- `PUT /api/pharmacy/:id` - update medicine details/stock
- `DELETE /api/pharmacy/:id` - remove medicine item (admin only)

**Backend Controllers & Routes:**
- `pharmacyRoutes.js`: `/`, `/`, `/:id`, `/:id`
- `pharmacyController.js`: `getMedicines`, `addMedicine`, `updateMedicine`, `deleteMedicine`
- Models: `medicines` table

---

## Settings

**Page Component:** `client/src/pages/Settings.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/settings` - get current user system settings
- `PUT /api/settings` - update system settings

**Backend Controllers & Routes:**
- `settingsRoutes.js`: `/`, `/`
- `settingsController.js`: `getSettings`, `updateSettings`
- Models: `user_settings` table



## Beds

**Page Component:** `client/src/pages/BedList.jsx`

**UI Components:** Navbar, Sidebar, PatientSearch (implicit), various status badge components

**Routes & Endpoints:**
- `GET /api/beds` - list all beds
- `POST /api/beds` - add new bed
- `GET /api/beds/:id` - get bed by ID
- `PUT /api/beds/:id` - update bed
- `DELETE /api/beds/:id` - delete bed (available only)
- `PUT /api/beds/:id/assign` - assign patient to bed
- `PUT /api/beds/:id/release` - release bed

**Backend Controllers & Routes:**
- `bedRoutes.js`: `/`, `/`, `/:id`, `/:id`, `/:id`, `/:id/assign`, `/:id/release`
- `bedController.js`: `addBed`, `getAllBeds`, `getBedById`, `updateBed`, `deleteBed`, `assignBed`, `releaseBed`
- Models: `beds` table

**Dependency Map:**

```
BedList.jsx
  → api.get("/beds")
  → bedController.getAllBeds
  → db.query("SELECT ... FROM beds LEFT JOIN patients ... ORDER BY beds.id ASC")
  → api.put(`/beds/${selectedBed.id}/assign`, {patientId: Number(selectedPatientId)})
  → bedController.assignBed
  → db.query("UPDATE beds SET patient_id=$1, status='Occupied' WHERE id=$2 RETURNING *")
  → api.put(`/beds/${selectedBed.id}/release`)
  → bedController.releaseBed
  → db.query("UPDATE beds SET patient_id=NULL, status='Available' WHERE id=$1 RETURNING *")
```

---

## Doctor Details

**Page Component:** `client/src/pages/DoctorDetails.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/doctors/:id` - get doctor by ID
- `DELETE /api/doctors/:id` - delete doctor

**Backend Controllers & Routes:**
- `doctorRoutes.js`: `/:id`, `/:id`
- `doctorController.js`: `getDoctorById`, `deleteDoctor`
- Models: `doctors` table

**Dependency Map:**

```
DoctorDetails.jsx
  → api.get(`/doctors/${id}`)
  → doctorController.getDoctorById
  → db.query("SELECT * FROM doctors WHERE id = $1", [id])
  → api.delete(`/doctors/${id}`)
  → doctorController.deleteDoctor
  → db.query("DELETE FROM doctors WHERE id = $1 RETURNING *", [id])
```

---

## Bed Details

**Page Component:** `client/src/pages/BedDetails.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/beds/:id` - get bed by ID
- `PUT /api/beds/:id/release` - release bed

**Backend Controllers & Routes:**
- `bedRoutes.js`: `/:id`, `/:id/release`
- `bedController.js`: `getBedById`, `releaseBed`
- Models: `beds`, `admissions` tables

**Dependency Map:**

```
BedDetails.jsx
  → api.get(`http://localhost:5000/api/beds/${id}`)
  → bedController.getBedById
  → db.query("SELECT ... FROM beds LEFT JOIN patients WHERE beds.id = $1", [id])
  → api.put(`http://localhost:5000/api/beds/${id}/release`)
  → bedController.releaseBed
  → db.query("UPDATE beds SET patient_id=NULL, status='Available' WHERE id=$1 RETURNING *", [id])
```

---

## Notifications

**Page Component:** `client/src/pages/Notifications.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/notifications` - list notifications
- `PUT /api/notifications/:id/read` - mark as read
- `PUT /api/notifications/:id/unread` - mark as unread
- `PUT /api/notifications/read-all` - mark all as read
- `DELETE /api/notifications/:id` - delete notification
- `GET /api/notifications/unread-count` - unread count

**Backend Controllers & Routes:**
- `notificationRoutes.js`: `/`, `/`, `/unread-count`, `/read-all`, `/:id/read`, `/:id/unread`, `/:id`
- `notificationController.js`: `createNotification`, `getNotifications`, `getUnreadNotificationCount`, `markNotificationAsRead`, `markNotificationAsUnread`, `markAllNotificationsAsRead`, `deleteNotification`
- Models: `notifications` table

**Dependency Map:**

```
Notifications.jsx
  → api.get("/notifications")
  → notificationController.getNotifications
  → db.query("SELECT ... FROM notifications n LEFT JOIN users sender ON sender.id=n.sender_id LEFT JOIN patients patient ON patient.id=n.patient_id WHERE n.user_id=$1 ORDER BY n.created_at DESC LIMIT 50", [userId])
  → api.put(`/notifications/${notification.id}/read`)
  → notificationController.markNotificationAsRead
  → db.query("UPDATE notifications SET is_read=TRUE, updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND user_id=$2 RETURNING *", [id, userId])
```

---