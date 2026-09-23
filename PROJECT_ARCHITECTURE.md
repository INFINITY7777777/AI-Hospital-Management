# PROJECT_ARCHITECTURE

## Table of Contents

- [Database Schema Reference](#database-schema-reference)
- [Dashboard](#dashboard)
- [Patients](#patients)
- [Doctors](#doctors)
- [Appointments](#appointments)
- [Admissions](#admissions)
- [Beds](#beds)
- [Doctor Details](#doctor-details)
- [Bed Details](#bed-details)
- [Notifications](#notifications)
- [Pharmacy](#pharmacy)
- [Settings](#settings)
- [User Management (Admin)](#user-management-admin)

---

## Database Schema Reference

| Table | Primary Key | Key Foreign/Related Columns | Role & Notes |
|---|---|---|---|
| `users` | `id` (`int8`) | — | User accounts (`admin`, `doctor`, `staff`) with auth & MPIN fields. |
| `patients` | `id` (`int8`) | `doctor` (`varchar`), `ward`, `bed_number` | Stores patient records and assigned doctor name string. |
| `doctors` | `id` (`int4`) | `email` (`varchar`), `doctor_name` (`varchar`) | Doctor profiles and specialization records. |
| `appointments` | `id` (`int4`) | `patient_id` (`int4`), `doctor_id` (`int4`) | Appointment scheduling table. |
| `beds` | `id` (`int4`) | `patient_id` (`int4`) | Hospital beds management. |
| `admissions` | `id` (`int4`) | `patient_id` (`int4`), `bed_id` (`int4`) | Active and past patient admission records. |
| `clinical_notes` | `id` (`int8`) | `patient_id` (`int8`), `author_id` (`int8`) | Clinical notes entered by clinical staff. |
| `patient_stay_history` | `id` (`int4`) | `patient_id` (`int8`), `admission_id` (`int4`), `bed_id` (`int4`) | Historical record of patient bed assignments. |
| `notifications` | `id` (`int8`) | `user_id` (`int8`), `patient_id` (`int8`), `sender_id` (`int8`) | In-app notification tracking. |
| `medicines` | `id` (`int4`) | — | Pharmacy inventory management. |
| `user_settings` | `id` (`int4`) | `user_id` (`int4`) | System and user preferences. |

---

## Dashboard

**Page Component:** `client/src/pages/Dashboard.jsx`

**UI Components:** Navbar, Sidebar, DashboardCard, PatientTrendChart

**Routes & Endpoints:**
- `GET /api/dashboard/stats` - dashboard statistics
- `GET /api/dashboard/today-appointments` - today's appointments
- `GET /api/dashboard/upcoming-appointments` - upcoming appointments
- `GET /api/dashboard/patient-trends` - weekly patient traffic trends

**Backend Controllers & Routes:**
- `dashboardRoutes.js`: `/api/dashboard/stats`, `/api/dashboard/today-appointments`, `/api/dashboard/upcoming-appointments`, `/api/dashboard/patient-trends`
- `dashboardController.js`: `getDashboardStats`, `getTodayAppointments`, `getUpcomingAppointments`, `getPatientTrends`
- **Database Tables Used:** `patients`, `doctors`, `appointments`, `admissions`, `beds`

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
- **Database Tables Used:** `patients`

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
- **Database Tables Used:** `doctors`, `users`

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
- **Database Tables Used:** `appointments`, `patients`, `doctors`

---

## Admissions

**Page Component:** `client/src/pages/Admissions.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/admissions` - list all admissions (Role-filtered by `patients.doctor` for doctors)
- `POST /api/admissions` - add new admission
- `GET /api/admissions/:id` - get admission by ID
- `PUT /api/admissions/:id` - update admission
- `PUT /api/admissions/:id/discharge` - discharge patient
- `DELETE /api/admissions/:id` - delete admission (discharged only)

**Backend Controllers & Routes:**
- `admissionRoutes.js`: `/`, `/`, `/:id`, `/:id`, `/:id/discharge`, `/:id`
- `admissionController.js`: `addAdmission`, `getAdmissions`, `getAdmissionById`, `updateAdmission`, `dischargePatient`, `deleteAdmission`
- **Database Tables Used:** `admissions`, `patients`, `beds`, `patient_stay_history`

---

## Beds

**Page Component:** `client/src/pages/BedList.jsx`

**UI Components:** Navbar, Sidebar, PatientSearch

**Routes & Endpoints:**
- `GET /api/beds` - list all beds (Role-filtered by `patients.doctor` for doctors)
- `POST /api/beds` - add new bed
- `GET /api/beds/:id` - get bed by ID
- `PUT /api/beds/:id` - update bed
- `DELETE /api/beds/:id` - delete bed
- `PUT /api/beds/:id/assign` - assign patient to bed
- `PUT /api/beds/:id/release` - release bed

**Backend Controllers & Routes:**
- `bedRoutes.js`: `/`, `/`, `/:id`, `/:id`, `/:id`, `/:id/assign`, `/:id/release`
- `bedController.js`: `addBed`, `getAllBeds`, `getBedById`, `updateBed`, `deleteBed`, `assignBed`, `releaseBed`
- **Database Tables Used:** `beds`, `patients`

---

## Doctor Details

**Page Component:** `client/src/pages/DoctorDetails.jsx`

**Routes & Endpoints:**
- `GET /api/doctors/:id` - get doctor by ID
- `DELETE /api/doctors/:id` - delete doctor

---

## Bed Details

**Page Component:** `client/src/pages/BedDetails.jsx`

**Routes & Endpoints:**
- `GET /api/beds/:id` - get bed by ID
- `PUT /api/beds/:id/release` - release bed

---

## Notifications

**Page Component / UI Component:** `client/src/components/NotificationBell.jsx`

**Routes & Endpoints:**
- `GET /api/notifications` - list notifications
- `POST /api/notifications` - broadcast alert
- `GET /api/notifications/unread-count` - get unread count
- `PUT /api/notifications/read-all` - mark all read
- `PUT /api/notifications/:id/read` - mark single notification read
- `DELETE /api/notifications/:id` - delete notification

**Backend Controllers & Routes:**
- `notificationRoutes.js`: `/`, `/`, `/unread-count`, `/read-all`, `/:id/read`, `/:id`
- `notificationController.js`: `getNotifications`, `createNotification`, `getUnreadNotificationCount`, `markAllNotificationsAsRead`, `markNotificationAsRead`, `deleteNotification`
- **Database Tables Used:** `notifications`

---

## Pharmacy

**Page Component:** `client/src/pages/Pharmacy.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/pharmacy` - list medicine inventory
- `POST /api/pharmacy` - add medicine item
- `PUT /api/pharmacy/:id` - update medicine details/stock
- `DELETE /api/pharmacy/:id` - delete medicine item (admin only)

**Backend Controllers & Routes:**
- `pharmacyRoutes.js`: `/`, `/`, `/:id`, `/:id`
- `pharmacyController.js`: `getMedicines`, `addMedicine`, `updateMedicine`, `deleteMedicine`
- **Database Tables Used:** `medicines`

---

## Settings

**Page Component:** `client/src/pages/Settings.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/settings` - fetch settings
- `PUT /api/settings` - update profile settings

**Backend Controllers & Routes:**
- `settingsRoutes.js`: `/`, `/`
- `settingsController.js`: `getSettings`, `updateProfile`
- **Database Tables Used:** `users`, `user_settings`

---

## User Management (Admin)

**Page Component:** `client/src/pages/UserManagement.jsx`

**UI Components:** Navbar, Sidebar

**Routes & Endpoints:**
- `GET /api/admin/users` - fetch active system members (admin only)
- `PATCH /api/admin/users/:userId/role` - reassign user role (admin only)
- `DELETE /api/admin/users/:userId` - deactivate user account (admin only)

**Backend Controllers & Routes:**
- `adminRoutes.js`: `/users`, `/users/:userId/role`, `/users/:userId`
- `adminController.js`: `getAllUsers`, `updateUserRole`, `deleteUser`
- **Database Tables Used:** `users`