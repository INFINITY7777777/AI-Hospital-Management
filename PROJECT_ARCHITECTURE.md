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
- [Pharmacy](#pharmacy)
- [Settings](#settings)
- [User Management (Admin)](#user-management-admin)

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
- Models: `patients`, `doctors`, `appointments`, `admissions`, `beds` tables

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

---

## Beds

**Page Component:** `client/src/pages/BedList.jsx`

**UI Components:** Navbar, Sidebar, PatientSearch

**Routes & Endpoints:**
- `GET /api/beds` - list all beds
- `POST /api/beds` - add new bed
- `GET /api/beds/:id` - get bed by ID
- `PUT /api/beds/:id` - update bed
- `DELETE /api/beds/:id` - delete bed
- `PUT /api/beds/:id/assign` - assign patient to bed
- `PUT /api/beds/:id/release` - release bed

**Backend Controllers & Routes:**
- `bedRoutes.js`: `/`, `/`, `/:id`, `/:id`, `/:id`, `/:id/assign`, `/:id/release`
- `bedController.js`: `addBed`, `getAllBeds`, `getBedById`, `updateBed`, `deleteBed`, `assignBed`, `releaseBed`
- Models: `beds` table

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
- Models: `notifications` table

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
- Models: `medicines` table

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
- Models: `users` table

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
- Models: `users` table

**Dependency Map:**