# PROJECT LOG — AI-Powered Hospital Management System (Backend)

> Auto-generated from full code review. Covers every file in `server/` except `.env` (never read/committed).
> Stack: Node.js + Express 5 + PostgreSQL (Supabase) + JWT + bcryptjs.

---

## Folder Structure (server/)

```
server/
├── index.js                          # Main entry point
├── package.json                      # Dependencies & scripts
├── .env                              # (SKIPPED - secrets)
├── config/
│   └── db.js                         # PostgreSQL connection pool
├── middleware/
│   └── authMiddleware.js             # JWT verification guard
├── controllers/
│   ├── authController.js             # Register + login
│   ├── patientController.js          # Patient CRUD
│   ├── doctorController.js           # Doctor CRUD
│   ├── appointmentController.js      # Appointment CRUD
│   ├── bedController.js              # Bed CRUD + assign/release
│   └── dashboardController.js        # Stats + today/upcoming appointments
└── routes/
    ├── authRoutes.js
    ├── patientRoutes.js
    ├── doctorRoutes.js
    ├── appointmentRoutes.js
    ├── bedRoutes.js
    └── dashboardRoutes.js
```

---

## File-by-File Details

### index.js — Main Server Entry Point
- Initializes Express app, port 5000.
- Global middleware: `cors()`, `express.json()`.
- Mounts all route groups:
  - `/api/auth`, `/api/patients`, `/api/doctors`, `/api/appointments`, `/api/dashboard`, `/api/beds`.
- Loads `config/db` (starts DB connection on boot).
- Public test route `GET /api/test` -> `{ success: true }`.
- Protected demo route `GET /api/protected` guarded by `verifyToken` middleware.

### package.json
- `commonjs`, main `index.js`.
- Scripts: `start` (`node index.js`), `dev` (`nodemon index.js`).
- Deps: `express`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `pg`.
- DevDeps: `nodemon`.

### config/db.js — Database Connection
- Creates `pg` Pool from `process.env.DATABASE_URL`.
- SSL with `rejectUnauthorized: false` (cloud cert).
- Connectivity probe on boot logs success/failure.
- Exports `query(text, params)` helper used by all controllers.

### middleware/authMiddleware.js — JWT Guard
- Reads `Authorization: Bearer <token>` header.
- Missing header -> 401 `Access Denied`.
- `jwt.verify(token, JWT_SECRET)`; invalid/expired -> 401.
- On success attaches `req.user` (decoded id + role), calls `next()`.

### controllers/authController.js
- `registerUser`: validates required fields, checks duplicate email (409), hashes password + mpin (bcrypt, salt 10), inserts into `users`, returns returning id/name/email/role (201).
- `loginUser`: validates email/password, finds user, rejects inactive (403), bcrypt compares password, issues JWT (24h, payload id+role), returns token + user info.

### controllers/patientController.js
- `addPatient`: INSERT patients with 12 fields (name, age, gender, blood_group, phone, address, emergency_contact, doctor, ward, bed_number, diagnosis, admission_date).
- `getAllPatients`: SELECT all ordered by created_at DESC.
- `getPatientById`: SELECT by id, 404 if missing.
- `updatePatient`: UPDATE all fields by id.
- `deletePatient`: DELETE by id, returns deleted row.

### controllers/doctorController.js
- `addDoctor`: INSERT (doctor_name, specialization, phone, email, department, experience).
- `getAllDoctors`: SELECT all ordered by created_at DESC.
- `getDoctorById`: SELECT by id, 404 if missing.
- `updateDoctor`: UPDATE by id.
- `deleteDoctor`: DELETE by id.

### controllers/appointmentController.js
- `addAppointment`: INSERT (patient_id, doctor_id, appointment_date, appointment_time, reason).
- `getAllAppointments`: INNER JOIN patients + doctors, sorted by date/time; returns patient_name, doctor_name, specialization.
- `getAppointmentById`: same JOIN, richer patient/doctor detail.
- `updateAppointment`: UPDATE (patient/doctor/date/time/reason/status).
- `deleteAppointment`: DELETE by id.

### controllers/bedController.js
- `addBed`: INSERT (bed_number, ward, bed_type, status); validates bed_number + ward; defaults status "Available"; catches unique violation `23505` -> 400 "Bed number already exists".
- `getAllBeds`: LEFT JOIN patients to expose patient_name, ordered by id.
- `getBedById`: single bed with patient_name.
- `updateBed`: UPDATE fields, handles duplicate `23505`.
- `deleteBed`: DELETE by id.
- `assignBed`: validates patientId + patient exists + bed exists; only if status "Available" -> set patient_id + "Occupied".
- `releaseBed`: only if status "Occupied" -> set patient_id NULL + "Available".

### controllers/dashboardController.js
- `getDashboardStats`: COUNT patients/doctors/appointments, today's appointments (CURRENT_DATE), upcoming (date >= today, status not Completed/Cancelled), plus 5 recent patients.
- `getTodayAppointments`: appointments where date = CURRENT_DATE, JOIN patients+doctors.
- `getUpcomingAppointments`: appointments where date > today, JOIN.

### routes/ (thin: map URL -> controller)
- `authRoutes.js`: POST `/register`, POST `/login`.
- `patientRoutes.js`: POST `/`, GET `/`, GET `/:id`, PUT `/:id`, DELETE `/:id`.
- `doctorRoutes.js`: POST `/`, GET `/`, GET `/:id`, PUT `/:id`, DELETE `/:id`.
- `appointmentRoutes.js`: POST `/`, GET `/`, GET `/:id`, PUT `/:id`, DELETE `/:id`.
- `bedRoutes.js`: POST `/`, GET `/`, GET `/:id`, PUT `/:id`, DELETE `/:id`, PUT `/:id/assign`, PUT `/:id/release`.
- `dashboardRoutes.js`: GET `/stats`, GET `/today-appointments`, GET `/upcoming-appointments`.

---

## API Endpoint Summary

| Method | Endpoint                      | Auth | Purpose            |
|--------|-------------------------------|------|--------------------|
| POST   | /api/auth/register            | No   | Create user        |
| POST   | /api/auth/login               | No   | Login, get JWT     |
| GET    | /api/test                     | No   | Health check       |
| GET    | /api/protected                | Yes  | Demo guard         |
| POST   | /api/patients                 | No   | Add patient        |
| GET    | /api/patients                 | No   | List patients      |
| GET    | /api/patients/:id             | No   | Get patient        |
| PUT    | /api/patients/:id             | No   | Update patient     |
| DELETE | /api/patients/:id             | No   | Delete patient     |
| POST   | /api/doctors                  | No   | Add doctor         |
| GET    | /api/doctors                  | No   | List doctors       |
| GET    | /api/doctors/:id              | No   | Get doctor         |
| PUT    | /api/doctors/:id              | No   | Update doctor      |
| DELETE | /api/doctors/:id              | No   | Delete doctor      |
| POST   | /api/appointments             | No   | Add appointment    |
| GET    | /api/appointments             | No   | List appointments  |
| GET    | /api/appointments/:id         | No   | Get appointment    |
| PUT    | /api/appointments/:id         | No   | Update appointment |
| DELETE | /api/appointments/:id         | No   | Delete appointment |
| POST   | /api/beds                     | No   | Add bed            |
| GET    | /api/beds                     | No   | List beds          |
| GET    | /api/beds/:id                 | No   | Get bed            |
| PUT    | /api/beds/:id                 | No   | Update bed         |
| DELETE | /api/beds/:id                 | No   | Delete bed         |
| PUT    | /api/beds/:id/assign          | No   | Assign patient     |
| PUT    | /api/beds/:id/release         | No   | Release bed        |
| GET    | /api/dashboard/stats          | No   | Dashboard stats    |
| GET    | /api/dashboard/today-appointments | No | Today's appts    |
| GET    | /api/dashboard/upcoming-appointments | No | Upcoming appts |

> Note: only `/api/protected` currently enforces JWT (`verifyToken`). Other endpoints are unprotected.

---

## Progress So Far (from git history)

| Module          | Status             |
|-----------------|--------------------|
| Auth backend     | Done (register/login/JWT/protected) |
| Patient CRUD     | Done               |
| Doctor CRUD      | Done               |
| Appointment CRUD | Done               |
| Dashboard stats  | Done               |
| Bed CRUD + assign/release | Done (uncommitted) |

Git log (newest first):
- `6b30c3b` Add dashboard appointment overview
- `5a3d628` Completed appointment functionality
- `0901d08` Complete Patient Module CRUD functionality
- `b12b301` Complete patient CRUD create read and update
- `3e2e800` Complete patient list and automatic refresh
- `7c893d0` Complete patient creation workflow
- `1a54644` Initial commit - Hospital Management System setup

Uncommitted / work-in-progress (git status):
- `server/controllers/bedController.js` (new)
- `server/routes/bedRoutes.js` (new)
- `server/index.js` (modified - bed routes mounted)
- Client WIP: `AddBedForm.jsx`, `BedDetails.jsx`, `BedList.jsx`, `EditBed.jsx`, `App.jsx`, `Sidebar.jsx`

---

## Observations / Notable Points
- Bed module fully built backend-side but not yet committed.
- JWT middleware exists but is only applied to `/api/protected`; most business routes are unauthenticated (TODO for production).
- `.env` holds `DATABASE_URL` + `JWT_SECRET` — excluded from this log, gitignored.