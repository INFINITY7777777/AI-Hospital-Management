# Hospital Management System — Unified Interconnectivity Master Plan

**Project reviewed:** `HOSPITAL-MANAGEMENT` ZIP supplied on 4 October 2026  
**Purpose:** Make the existing modules behave like one connected hospital system, so a change made in one module is reflected everywhere that depends on it.  
**Scope:** Audit and plan first. This document does not modify application code or the database.

---

## 1. Executive summary

The project already has separate frontend modules, Express API routes/controllers, and a shared PostgreSQL connection. The key issue is not simply that pages look separate: the app has multiple places where related facts can be stored or fetched independently, and pages do not necessarily reload their data after another module changes it.

The most important integration areas are:

1. **Beds ↔ Admissions ↔ Patients ↔ Patient Stay History**
2. **Patients ↔ Appointments ↔ Doctors**
3. **Admissions/Beds/Appointments/Patients ↔ Dashboard**
4. **Patient Details ↔ Clinical Notes / Medical History / Stay History / AI views**
5. **Shared API/authentication and consistent refresh behaviour across frontend pages**

### Main design principle

> Store each fact in one authoritative place, derive related information from that source, and make every dependent screen refresh or invalidate its cached data after a successful change.

Do not try to solve every inconsistency with frontend-only refreshes. First establish the correct data ownership and backend rules, then ensure all pages use the same APIs and refresh strategy.

---

## 2. What was inspected

The ZIP contains the following relevant architecture:

- `client/src/pages/` — route-level pages such as Patients, Beds, Admissions, Appointments, Doctors, Patient Details and Dashboard.
- `client/src/components/` — reusable forms, lists, patient history, charts, search and navigation.
- `client/src/services/api.js` — shared Axios instance with `http://localhost:5000/api` as its base URL and a request interceptor that attaches the JWT.
- `server/index.js` — Express entry point mounting the `/api/patients`, `/api/doctors`, `/api/appointments`, `/api/dashboard`, `/api/beds`, `/api/admissions`, `/api/clinical-notes`, `/api/patient-history`, `/api/pharmacy`, `/api/notifications`, and other routes.
- `server/controllers/` — database operations and business rules for those modules.
- `server/config/db.js` — shared database connection.
- `docs/API.md`, `docs/DATABASE.md`, `PROJECT_ARCHITECTURE.md`, `README.md` — supporting project documentation.

The ZIP also includes `.git` history and dependency folders. Those are not part of the interconnectivity design and should not be included in future source-only review ZIPs.

---

## 3. High-priority findings from the supplied code

These are findings from the files inspected in the ZIP; they should be verified against the running database before implementation.

### Finding A — Patient and bed data can be represented twice

`server/controllers/patientController.js` accepts and inserts patient fields including `ward`, `bed_number`, `diagnosis`, and `admission_date` into the `patients` table.

Separately, `server/controllers/admissionController.js` creates an admission in `admissions`, updates `beds.status` and `beds.patient_id`, and creates a `patient_stay_history` record.

That creates a risk of conflicting representations. For example, a bed assignment can be updated through the admissions workflow while the older `patients.ward` or `patients.bed_number` fields remain unchanged. A Patients page reading `patients.*` may then show stale or conflicting ward/bed data even though the Beds module is correct.

**Plan:** Treat `admissions` + `beds` as the authoritative current-admission/current-bed relationship. Derive a patient's current ward and bed from the active admission and its linked bed. Do not maintain a second independent current-bed value in `patients` unless the project intentionally chooses and consistently enforces a denormalized projection.

### Finding B — Admission creation already has cross-module side effects

`server/controllers/admissionController.js` checks that the patient exists, rejects a second active admission, locks and checks a selected bed, inserts an admission, updates the bed to `Occupied` with `patient_id`, and inserts an active stay-history record. These operations are wrapped in a database transaction.

This is a good starting point. However, every other operation that changes a bed or admission must preserve the same invariants. A create flow alone is not enough.

**Plan:** Centralize and enforce the complete bed/admission lifecycle for admission creation, bed reassignment, admission editing, discharge, and deletion. Each lifecycle operation should update all related records in one transaction.

### Finding C — Frontend data access is inconsistent

`client/src/services/api.js` already provides a shared Axios instance, central base URL, and automatic JWT attachment.

However, the inspected `client/src/pages/Admissions.jsx` imports raw `axios` and manually calls `http://localhost:5000/api/admissions` with a token header. `client/src/pages/Dashboard.jsx` also uses raw Axios and hard-coded full API URLs. Other pages, such as `PatientDetails.jsx`, use the shared `api` instance.

This inconsistency makes authentication, base URL changes, error handling, and future request-level refresh behaviour harder to manage. It can also cause bugs when a page forgets the authorization header or uses a different response shape.

**Plan:** Migrate API calls to `client/src/services/api.js` across the frontend. Use relative paths such as `api.get("/admissions")`. Do not make a second API client per page.

### Finding D — A successful update does not automatically update other mounted pages

Many pages fetch their data in `useEffect` when they mount. That is normal, but a mutation in one module does not automatically notify a different mounted module that its data is stale. Navigating away and back may appear to fix the problem because the page fetches again.

**Plan:** Introduce a consistent query invalidation/refetch strategy. For the existing app, a lightweight shared data context or a query library such as TanStack Query can work. Choose one approach and use it consistently; do not add isolated `window.location.reload()` calls as the main solution.

### Finding E — The Dashboard is an aggregate view and can drift from module pages

`client/src/pages/Dashboard.jsx` fetches dashboard statistics, today's appointments, and bed summary from three dashboard endpoints. Its numbers and summaries depend on `server/controllers/dashboardController.js` reflecting the same business rules used by the Patients, Beds, Admissions, and Appointments modules.

**Plan:** Calculate dashboard values from authoritative tables/joins and shared status definitions. After mutations, invalidate the dashboard data as well as the affected module data.

### Finding F — Appointment relationships need consistent validation and joining

`server/controllers/appointmentController.js` stores `patient_id` and `doctor_id`, and its list query joins `patients` and `doctors` to display patient and doctor names. This is the right relational direction. The create/update operations should also validate that both referenced records exist and enforce the desired appointment status/date rules before saving.

**Plan:** Keep IDs as the relationship keys. Display names should be joined from the linked patient/doctor records rather than copied as independent appointment text fields.

---

## 4. Authoritative data ownership

Use the following ownership model as the target. Confirm actual column names and constraints in the live schema before writing migrations.

| Information | Authoritative source | Other modules should display it by |
|---|---|---|
| Patient identity/contact/demographics | `patients` | Patient ID and patient queries |
| Doctor profile/specialty | `doctors` (with `users` only where the existing account relationship requires it) | Doctor ID and doctor queries |
| Appointment date/time/status/reason | `appointments` | Patient/doctor joins |
| Bed number, ward/type, availability/status | `beds` | Bed queries and active admission joins |
| Current admission/status/diagnosis/admission date | `admissions` | Active admission join by patient ID |
| Current bed assignment | Active `admissions.bed_id`, cross-checked with `beds` | Patient's current admission/bed query |
| Historical ward/bed stays | `patient_stay_history` | Patient Stay History view |
| Clinical notes | Existing clinical-notes table/API | Patient ID, with permissions |
| Medical history | Existing patient-history table/API | Patient ID |
| Dashboard totals | Derived query over authoritative tables | Dashboard endpoints; do not maintain duplicate manual totals |
| Notifications | Existing notifications API/table | Notification list/bell |

**Important:** Do not infer that a table has every field listed above. The table is the proposed ownership model; confirm the actual schema in `docs/DATABASE.md`, database migrations/schema, and the connected database before implementation.

---

## 5. Interconnectivity map

```text
PATIENTS ───────────────┐
   │                    │
   ├── APPOINTMENTS ────┼── DOCTORS
   │                    │
   ├── ADMISSIONS ──────┼── BEDS
   │       │            │
   │       └── PATIENT_STAY_HISTORY
   │
   ├── CLINICAL NOTES
   ├── MEDICAL HISTORY
   └── PATIENT AI / SUMMARY VIEWS

All authoritative modules
          │
          ▼
DASHBOARD AGGREGATES + GLOBAL SEARCH + NOTIFICATIONS
```

The frontend should never need to guess relationships from display names. IDs and backend joins should define the relationships.

---

## 6. File-by-file responsibility map

### Frontend: shared infrastructure

| File | Responsibility | Planned work |
|---|---|---|
| `client/src/services/api.js` | Shared Axios instance, API base URL, JWT interceptor | Make this the single API client used by every page/component. Add consistent error handling only if it does not hide errors needed by pages. |
| `client/src/App.jsx` | Route/page composition | Verify route coverage and ensure detail/edit pages use stable record IDs. Avoid duplicating business logic here. |
| `client/src/main.jsx` | React application bootstrap | If using a query cache/context, install its provider here. |
| `client/src/components/Navbar.jsx` | Global navigation | Keep navigation concerns here; avoid storing authoritative module data in the navbar. |
| `client/src/components/Sidebar.jsx` | Module navigation | Navigation only; not a source of business data. |

### Frontend: beds and admissions

| File | Responsibility | Planned work |
|---|---|---|
| `client/src/pages/BedList.jsx` | Bed list/status display | Refetch/invalidate bed data after bed create/edit, admission, reassignment, and discharge. Show status from the backend. |
| `client/src/pages/AddBedForm.jsx` | Bed creation form/page | After successful create, refresh bed list and any bed summaries. |
| `client/src/pages/EditBed.jsx` | Bed editing | Refresh bed list, bed details, patient current-bed view, admissions selectors, and dashboard summary where relevant. |
| `client/src/pages/BedDetails.jsx` | Single bed details | Read current assignment from the authoritative bed/admission relationship; avoid relying on stale copied fields. |
| `client/src/pages/Admissions.jsx` | Admission list and actions | Use shared `api`; refresh after edit/discharge/delete; keep status labels consistent with backend. |
| `client/src/pages/AddAdmissionForm.jsx` | Admission creation | Load available beds from the server; after success, invalidate/refetch admissions, beds, patient current-admission data, stay history, and dashboard. |
| `client/src/pages/AdmissionDetails.jsx` | Admission detail/actions | Refresh linked bed and patient information after changes; use shared `api`. |
| `client/src/pages/EditAdmission.jsx` | Admission editing | Treat patient/bed assignment changes as a lifecycle operation; refresh all affected modules. |
| `client/src/components/PatientStayHistory.jsx` | Patient's stay history | Read history from the history API/table; it is historical data, not a substitute for current assignment. |

### Frontend: patients and clinical data

| File | Responsibility | Planned work |
|---|---|---|
| `client/src/pages/Patients.jsx` | Patient list | Use a patient list response that includes current admission/current bed data, or fetch that data consistently. Do not assume `patients.ward` and `patients.bed_number` are always current. |
| `client/src/components/PatientList.jsx` | Patient table/list rendering | Render canonical API fields; keep current ward/bed labels consistent with Patient Details and Admissions. |
| `client/src/components/AddPatientForm.jsx` | Patient creation | Create patient demographics only unless the product explicitly supports a complete admission workflow here. Avoid silently creating a second, disconnected bed assignment. |
| `client/src/pages/PatientDetails.jsx` | Patient profile and tabs | Load patient profile and its related clinical data by patient ID; refetch relevant sections after edits or linked changes. |
| `client/src/pages/EditPatient.jsx` | Patient edits | Refresh patient list/details, appointment display names if relevant, and global search after save. |
| `client/src/components/DigitalPatientCard.jsx` | Patient summary card | Render the same canonical patient/current-admission fields as Patient Details. |
| `client/src/components/ClinicalNotes.jsx` | Patient clinical notes | Use patient ID, shared API, and a refresh/invalidation strategy after note create/update/delete. |
| `client/src/components/PatientMedicalHistory.jsx` | Medical history | Keep history separate from current admission and current bed data. |
| `client/src/components/PatientAIChat.jsx` | Patient-scoped AI chat | Ensure it receives the correct patient ID and only the authorized, current context. |
| `client/src/components/PatientAISummary.jsx` | AI summary | Recompute/refresh only when its source clinical data changes; clearly distinguish generated summaries from canonical records. |

### Frontend: appointments, doctors, and dashboard

| File | Responsibility | Planned work |
|---|---|---|
| `client/src/pages/Appointments.jsx` | Appointment list | Use patient/doctor IDs and joined display data; refresh after appointment mutation or patient/doctor changes that affect visible fields. |
| `client/src/components/AppointmentList.jsx` | Appointment list rendering/actions | Keep status/date formatting consistent and refresh after mutations. |
| `client/src/components/AddAppointmentForm.jsx` | Appointment creation | Load patients/doctors from authoritative APIs; validate IDs and refresh appointments/dashboard after save. |
| `client/src/pages/AppointmentDetails.jsx` | Appointment detail | Join/display current linked patient/doctor names; refresh after edits. |
| `client/src/pages/EditAppointment.jsx` | Appointment editing | Invalidate appointment list, details, and dashboard summaries after save. |
| `client/src/pages/Doctors.jsx` | Doctor list and create flow | Refresh list and appointment selectors after create/edit. |
| `client/src/components/DoctorList.jsx` | Doctor table | Render canonical doctor data. |
| `client/src/components/AddDoctorForm.jsx` | Doctor creation | On success, refresh doctor list and relevant appointment selectors. |
| `client/src/pages/EditDoctor.jsx` | Doctor edit | Refresh doctor list, doctor detail, appointment joins, and search. |
| `client/src/pages/DoctorDetails.jsx` | Doctor profile | Use stable doctor ID and shared API. |
| `client/src/pages/Dashboard.jsx` | Aggregate dashboard | Replace raw Axios/hard-coded full URLs with shared API; refresh/invalidate after relevant mutations. |
| `client/src/components/PatientTrendChart.jsx` | Trend data | Use shared API; ensure chart definition and time range match its label and backend query. |
| `client/src/components/GlobalSearchModal.jsx` | Global search | Search authoritative APIs or a server-side unified search endpoint; refresh results after relevant record changes. |

### Backend: API routing and business rules

| File | Responsibility | Planned work |
|---|---|---|
| `server/index.js` | Registers API routes | Keep route mounts explicit; add no duplicate business rules here. |
| `server/config/db.js` | Database connection | Shared connection/pool for controllers and transactions. |
| `server/routes/bedRoutes.js` | Bed API endpoints | Ensure create/read/update/status transitions are clearly mapped to controller methods and protected by intended auth middleware. |
| `server/controllers/bedController.js` | Bed CRUD/status logic | Enforce valid transitions; do not allow a bed with an active assignment to become Available without a discharge/reassignment workflow. |
| `server/routes/admissionRoutes.js` | Admission endpoints | Ensure create/edit/discharge/delete operations are clearly separated and protected. |
| `server/controllers/admissionController.js` | Admission lifecycle | Centralize transactional changes to admissions, beds, and stay history. |
| `server/routes/patientRoutes.js` | Patient API endpoints | Ensure list/detail/update responses expose consistent patient data contracts. |
| `server/controllers/patientController.js` | Patient CRUD and list/detail queries | Stop treating copied `ward`/`bed_number` fields as authoritative current assignment; join active admission and bed for current values. |
| `server/routes/appointmentRoutes.js` | Appointment endpoints | Ensure every mutation endpoint has consistent validation/authentication. |
| `server/controllers/appointmentController.js` | Appointment CRUD and joins | Validate referenced patient/doctor IDs; use joins for display values and consistent status rules. |
| `server/controllers/doctorController.js` | Doctor CRUD | Keep doctor IDs stable and relationships compatible with appointment records. |
| `server/controllers/dashboardController.js` | Aggregated statistics/summary | Compute counts and bed occupancy from the same canonical statuses/relationships used by module endpoints. |
| `server/controllers/patientHistoryController.js` | Patient history endpoints | Maintain historical data separately from current-state tables. |
| `server/controllers/clinicalNoteController.js` | Clinical note endpoints | Keep notes patient-scoped and consistent after mutation. |
| `server/controllers/notificationController.js` | Notifications | If event notifications are desired, emit them after successful committed actions; do not emit before transaction commit. |
| `server/middleware/authMiddleware.js` | JWT authorization context | Keep protected data requests consistent across modules. |

---

## 7. Required lifecycle rules

### 7.1 Bed and admission rules

These should be enforced on the server, not just in form dropdowns:

1. A bed may be assigned only if it exists and is Available.
2. A patient may not have more than one active admission if that is the intended product rule.
3. Creating an admission with a bed must atomically:
   - insert the admission;
   - mark the bed Occupied and set its patient assignment;
   - create the active stay-history record.
4. Discharging an admission must atomically:
   - change admission status to Discharged and set discharge details;
   - close the active stay-history record;
   - release the bed and clear its patient assignment;
   - make the bed available only if no other active assignment exists.
5. Reassigning a patient to a different bed must atomically release the old bed, assign the new bed, close the previous stay segment, and create a new stay segment.
6. Editing bed number/ward/type should update the canonical bed record. Patient and admission screens should show those details by joining the bed record, not by copying values.
7. Deleting an active bed or active admission should be blocked unless a deliberate, safe workflow is defined.
8. Transactions must roll back all related changes if any step fails.
9. Use row locks or equivalent concurrency-safe checks when two users may attempt to allocate the same bed at once.
10. Use a single, documented status vocabulary (for example `Available`, `Occupied`, and any explicitly supported maintenance status) and normalize status comparisons.

### 7.2 Patient rules

1. Patient identity and demographic details belong to `patients`.
2. Current admission and current bed should be derived from the active admission and linked bed.
3. Stay history is historical; it should not be overwritten when a patient changes beds.
4. Patient creation should not imply admission unless the user intentionally completes the admission workflow.
5. If legacy `patients.ward`, `patients.bed_number`, `patients.admission_date`, or `patients.diagnosis` columns are retained, define whether they are historical/legacy or derived display fields. Avoid two independent writable sources for the same current fact.

### 7.3 Appointment rules

1. Store `patient_id` and `doctor_id` as foreign-key relationships.
2. Validate that both linked records exist and are eligible before create/update.
3. List and detail endpoints should join current patient/doctor display fields.
4. Patient or doctor edits should appear in appointment displays after refetch because names are joined, not copied.
5. Define appointment status values and transitions once, then use them in lists, details, filters, and dashboard calculations.

---

## 8. Frontend refresh strategy

Pick **one** strategy and apply it consistently. Recommended options:

### Option A — TanStack Query (recommended if adding a dependency is acceptable)

- Create a `QueryClient` in `client/src/main.jsx`.
- Use stable query keys, such as:
  - `["patients"]`, `["patient", patientId]`
  - `["beds"]`, `["bed", bedId]`
  - `["admissions"]`, `["admission", admissionId]`
  - `["appointments"]`, `["appointment", appointmentId]`
  - `["doctors"]`, `["doctor", doctorId]`
  - `["dashboard", "stats"]`, `["dashboard", "bed-summary"]`
  - `["patient-stay-history", patientId]`
- After an admission/discharge/bed reassignment, invalidate the affected query keys in one shared mutation helper.
- Configure sensible `staleTime` and refetch-on-window-focus behaviour; do not refetch every request unnecessarily.
- Use optimistic updates only where rollback is safe; for bed allocation, prefer waiting for the server result.

### Option B — Lightweight shared refresh context/event

If you do not want to add a dependency, implement a small, typed-by-convention refresh context or event helper. After a successful mutation, publish a domain event such as `admission:changed` or `bed:changed`; mounted pages subscribe and refetch their relevant API queries.

- Centralize event names and affected modules in one file.
- Unsubscribe listeners on unmount.
- Publish events only after the API confirms success.
- This is simpler to introduce, but can become difficult to maintain if ad hoc events proliferate.

**Do not combine multiple uncoordinated strategies** (random custom events, manual refresh counters, hard reloads, and query cache invalidation) without a clear standard.

---

## 9. Shared API and response contracts

### API client

Use `client/src/services/api.js` everywhere:

```js
import api from "../services/api";

const response = await api.get("/beds");
```

Avoid:

```js
import axios from "axios";
axios.get("http://localhost:5000/api/beds", ...);
```

The existing `api.js` already sets the base URL and attaches the token. Migrate pages/components to it before introducing more integration code.

### Consistent response shapes

Document and use predictable shapes. For example:

- `GET /patients` → `{ patients: [...] }`
- `GET /patients/:id` → `{ patient: {...} }`
- `GET /beds` → `{ beds: [...] }`
- `GET /admissions` → `{ admissions: [...] }`
- `GET /appointments` → `{ appointments: [...] }`
- `GET /doctors` → `{ doctors: [...] }`

Confirm current contracts in the route/controller code before changing any client. Avoid silently returning different shapes for list and detail endpoints.

### Error contract

Use one predictable server error structure such as `{ error: "Human-readable explanation", code?: "STABLE_CODE" }`. Preserve meaningful validation errors from the server; do not replace them with a generic “Something went wrong” message on every page.

---

## 10. Dashboard and global search

### Dashboard

`server/controllers/dashboardController.js` should be the single source for dashboard aggregate responses. It should derive:

- total patients from patient records;
- total/active admissions from admission status;
- occupied/available beds from the bed/admission invariant;
- today's/upcoming appointments from appointment dates and documented status rules;
- ward occupancy from beds joined/grouped by ward/type.

Do not calculate the same metric in multiple components with slightly different status filters. If the dashboard reports 5 available beds, the Beds module should agree under the same definition and permissions.

### Global search

`client/src/components/GlobalSearchModal.jsx` should use one consistent API path or a dedicated backend search endpoint. Search results should include stable IDs and navigate to the correct details page. After a create/edit/delete, refresh search results or invalidate the search query. Apply role permissions on the backend, not only by hiding items in the UI.

---

## 11. Implementation phases

### Phase 0 — Baseline and safety

- Create a Git branch such as `feature/unified-data-flow`.
- Back up the database before schema/data changes.
- Confirm the database schema, foreign keys, indexes, status values, and existing test data.
- Record the current expected behaviour for create/edit/discharge flows.
- Do not include `.env` secrets in source control or review ZIPs.

**Exit check:** There is a known-good rollback point and a reproducible baseline.

### Phase 1 — Audit and standardize API calls

- Inventory every `axios` import and hard-coded `http://localhost:5000/api` URL under `client/src`.
- Migrate requests to `client/src/services/api.js`.
- Verify all list/detail response shapes and authentication requirements.
- Fix errors caused by inconsistent response envelopes.

**Exit check:** Every frontend API request goes through one client and every page can load with the same auth behaviour.

### Phase 2 — Make beds/admissions authoritative

- Confirm the schema for `beds`, `admissions`, `patients`, and `patient_stay_history`.
- Define the canonical active-admission status and bed status vocabulary.
- Review bed create/update/status methods and admission create/edit/discharge/delete methods together.
- Implement/verify transactional lifecycle rules, including bed reassignment.
- Add database constraints/indexes where safe and compatible with existing data.
- Create a migration/backfill plan for legacy patient ward/bed fields before changing their use.

**Exit check:** No supported action can leave an active admission pointing to an Available bed, an occupied bed with no valid active assignment, or a patient with conflicting active admissions.

### Phase 3 — Unify patient views

- Update patient list and patient detail queries to expose current admission and bed through joins.
- Ensure `PatientList`, `DigitalPatientCard`, Patient Details, Admissions, and Bed Details display the same ward/bed/active-admission information.
- Keep historical stay rows visible as history rather than as current state.
- Define whether patient creation is demographics-only or can also start a full admission.

**Exit check:** Changing a bed or discharging a patient changes the current-bed display consistently across patient and bed pages.

### Phase 4 — Unify appointments and doctors

- Validate patient/doctor IDs on appointment create/update.
- Use joined patient/doctor display values for list and detail endpoints.
- Ensure doctor edits are reflected in appointment screens after refresh.
- Standardize appointment status and date/time rules.

**Exit check:** Appointment pages show the same linked patient/doctor identities and status after edits.

### Phase 5 — Add systematic frontend invalidation/refetch

- Choose TanStack Query or the lightweight refresh context/event approach.
- Define one mutation-to-query invalidation map.
- Cover all create/update/delete/discharge/reassign actions.
- Keep loading, error, empty, and success states consistent.
- Ensure updates from a second browser/session become visible through refetch/focus or explicit refresh, rather than assuming a single in-memory UI state is globally shared.

**Exit check:** A successful change in one module refreshes all mounted dependent views without a manual browser reload.

### Phase 6 — Reconcile dashboard and global search

- Recheck dashboard SQL/queries against the canonical data model.
- Reconcile counts and status filters with module lists.
- Refresh dashboard data after related mutations.
- Make global search return stable IDs and the correct latest display values.

**Exit check:** Dashboard, search, and module pages agree on the same records and counts.

### Phase 7 — Regression testing

Run the test matrix below with realistic records and at least two user sessions where possible.

---

## 12. Required regression test matrix

| Action | Expected affected views |
|---|---|
| Create a patient | Patient list, patient details, global search, dashboard patient count |
| Edit patient name/contact | Patient list, patient details, appointment patient name, search |
| Create a doctor | Doctor list, doctor detail, appointment doctor selector, search, dashboard doctor count |
| Edit doctor name/specialty | Doctor list/detail and joined appointment display |
| Create a bed | Bed list, bed details, admission bed selector, dashboard bed summary |
| Edit bed number/ward/type | Bed list/detail, active admission details, patient current-bed display, ward summary |
| Admit a patient into an available bed | Admissions list/detail, bed list/detail, patient list/detail, stay history, dashboard occupied/available counts |
| Try to allocate the same bed twice | Second operation rejected; no partial records or inconsistent status |
| Try to admit the same patient twice | Second active admission rejected if the rule remains one active admission per patient |
| Reassign a patient to another bed | Old bed released, new bed occupied, stay history segmented, patient/admission pages consistent |
| Discharge a patient | Admission status updated, bed released, stay history closed, patient current-bed display cleared, dashboard reconciled |
| Edit an appointment | Appointment list/detail and dashboard appointment counts refresh |
| Delete a patient/doctor with linked records | Safe, documented rule enforced; no accidental orphaned relationships |
| Change records in a second browser | Other session sees changes after refetch/focus or manual refresh, without stale long-lived state |
| Trigger an API validation error | Clear error shown; no partial updates in the database |

---

## 13. Database safety and migration cautions

Before changing schema or backfilling data:

1. Inspect the actual database schema and existing data. The ZIP alone cannot prove what is currently in the live database.
2. Find patients whose `patients.ward`/`patients.bed_number` conflicts with active admissions/beds.
3. Find beds marked Occupied without a matching active admission, and active admissions whose bed is Available or assigned to a different patient.
4. Find multiple active admissions for the same patient and multiple active assignments for the same bed.
5. Resolve inconsistencies deliberately before adding strict constraints.
6. Add foreign keys/check constraints only after legacy data has been reconciled.
7. Back up first and test migrations against a copy of the database.

Do not run a blind mass update that copies bed fields from one table to another. Resolve conflicts using a documented source-of-truth rule.

---

## 14. Recommended order of work

Do the work in this order:

1. **Beds + Admissions backend lifecycle**
2. **Patient current admission/current bed query**
3. **Bed, admission, and patient UI refetch/invalidation**
4. **Dashboard reconciliation**
5. **Appointments + Doctors relationship validation and joins**
6. **Global search and patient clinical panels**
7. **Cross-module regression tests and edge cases**

This order addresses the reported bed-to-patient issue first and establishes a repeatable pattern for the rest of the system.

---

## 15. Definition of done

The project can be considered interconnected when:

- Each business fact has one authoritative source.
- Related data is linked by IDs and database joins, not duplicated display strings.
- Multi-table workflows are transactional and concurrency-safe.
- Every frontend request uses the shared API client.
- A successful mutation invalidates/refetches every affected view.
- Dashboard counts and module lists use the same status definitions.
- Current-state data and historical records are clearly separated.
- All test cases in Section 12 pass.
- No `.env` credentials or secrets are committed.

---

## 16. Scope limits and items to verify

This plan is based on the supplied ZIP's source code and documentation. It is a source review, not a live database audit or a runtime test. Before implementation, verify:

- the actual PostgreSQL schema and constraints;
- the full bed controller and all edit/discharge routes;
- every mutation path in `EditAdmission.jsx`, `EditBed.jsx`, `EditPatient.jsx`, appointment pages, and doctor pages;
- exact status strings currently stored in the database;
- the role-specific filtering expected for admin, doctor, staff, and nurse;
- whether legacy patient ward/bed fields are used by reports, exports, AI context, or other unseen integrations.

The plan intentionally recommends changes before prescribing a full rewrite. The safest approach is to fix one connected workflow at a time, test it, then reuse the same integration pattern across the other modules.

---

## 17. Implementation update — explicit filename checklist (4 October 2026)

This section adds concrete file paths to the plan. It does not claim that every listed file has been inspected in the current working tree. Paths marked **verify path** must be checked against the actual repository before editing; controller/route naming can differ from the source ZIP or branch.

### 17.1 Phase 1 — frontend shared API client audit

**Shared client:**

- `client/src/services/api.js` — canonical Axios instance; preserve the existing base URL and JWT interceptor.

**Direct Axios / hard-coded API URL files identified in the frontend audit:**

- `client/src/components/AddAppointmentForm.jsx` — migrate patient/doctor GET requests and appointment POST.
- `client/src/components/AppointmentList.jsx` — migrate appointments GET.
- `client/src/pages/EditAppointment.jsx` — migrate appointment/patient/doctor GET requests and appointment PUT.
- `client/src/pages/AppointmentDetails.jsx` — migrate appointment GET, PUT, and DELETE.
- `client/src/components/AddDoctorForm.jsx` — migrate doctor POST.
- `client/src/components/PatientTrendChart.jsx` — migrate patient-trend GET.
- `client/src/pages/UserManagement.jsx` — migrate user GET, PATCH, and DELETE requests.
- `client/src/pages/Login.jsx` — review separately; migrate login POST only while preserving public-login behavior and existing token/user storage.

**Previously changed; revalidate before marking complete:**

- `client/src/pages/Admissions.jsx` — previously migrated to `api`; lint/build and admission list/delete behavior still require verification.
- `client/src/pages/Dashboard.jsx` — previously migrated to `api`; verify all three dashboard requests and runtime behavior.
- `client/src/components/AddAppointmentForm.jsx` — a shared-client version was supplied; run lint/build and verify response shapes and successful submission.
- `client/src/components/AppointmentList.jsx` — a shared-client version was supplied; run lint/build and verify list loading, filters, and details navigation.

**Repository-wide final audit command (PowerShell):**

```powershell
Set-Location "D:\HOSPITAL-MANAGEMENT\client"
Get-ChildItem ".\src" -Recurse -File -Include *.js,*.jsx,*.ts,*.tsx |
  Select-String -Pattern 'axios|localhost:5000/api' |
  Select-Object Path, LineNumber, Line
```

Expected exception: `client/src/services/api.js` may contain the Axios import and configured base URL. Any other results must be inspected; do not blindly replace unrelated Axios usage without understanding it.

### 17.2 Exact frontend files in the interconnectivity worklist

The files below are explicit targets to inspect and change only where the current implementation needs it. Some may not exist at the listed path; confirm names with the repository before editing.

**Shared infrastructure and routing**

- `client/src/services/api.js`
- `client/src/App.jsx`
- `client/src/main.jsx`
- `client/src/components/Navbar.jsx`
- `client/src/components/Sidebar.jsx`
- `client/src/components/GlobalSearchModal.jsx`

**Beds and admissions**

- `client/src/pages/BedList.jsx`
- `client/src/pages/AddBedForm.jsx`
- `client/src/pages/EditBed.jsx`
- `client/src/pages/BedDetails.jsx`
- `client/src/pages/Admissions.jsx`
- `client/src/pages/AddAdmissionForm.jsx`
- `client/src/pages/AdmissionDetails.jsx`
- `client/src/pages/EditAdmission.jsx`
- `client/src/components/PatientStayHistory.jsx`

**Patients and clinical data**

- `client/src/pages/Patients.jsx`
- `client/src/components/PatientList.jsx`
- `client/src/components/AddPatientForm.jsx`
- `client/src/pages/PatientDetails.jsx`
- `client/src/pages/EditPatient.jsx`
- `client/src/components/DigitalPatientCard.jsx`
- `client/src/components/ClinicalNotes.jsx`
- `client/src/components/PatientMedicalHistory.jsx`
- `client/src/components/PatientAIChat.jsx`
- `client/src/components/PatientAISummary.jsx`

**Appointments, doctors, and dashboard**

- `client/src/pages/Appointments.jsx`
- `client/src/components/AppointmentList.jsx`
- `client/src/components/AddAppointmentForm.jsx`
- `client/src/pages/AppointmentDetails.jsx`
- `client/src/pages/EditAppointment.jsx`
- `client/src/pages/Doctors.jsx`
- `client/src/components/DoctorList.jsx`
- `client/src/components/AddDoctorForm.jsx`
- `client/src/pages/EditDoctor.jsx`
- `client/src/pages/DoctorDetails.jsx`
- `client/src/pages/Dashboard.jsx`
- `client/src/components/PatientTrendChart.jsx`
- `client/src/pages/Login.jsx`
- `client/src/pages/UserManagement.jsx`

The frontend filenames above form the inspection checklist, not a claim that every one necessarily needs code changes. Confirm current usage and actual paths first.

### 17.3 Backend files to inspect (confirm route filenames before editing)

- `server/index.js` — route mounting.
- `server/config/db.js` — shared database/pool configuration.
- `server/controllers/patientController.js` — patient create/list/detail and current admission/bed joins.
- `server/controllers/doctorController.js` — doctor CRUD and linked account behavior.
- `server/controllers/appointmentController.js` — appointment CRUD, patient/doctor validation, joined names, status rules.
- `server/controllers/bedController.js` — bed CRUD and valid occupancy transitions.
- `server/controllers/admissionController.js` — transactional admission, reassignment, discharge, and deletion behavior.
- `server/controllers/dashboardController.js` — authoritative aggregate queries.
- `server/controllers/patientHistoryController.js` — patient history endpoints.
- `server/controllers/clinicalNoteController.js` — clinical note endpoints.
- `server/controllers/notificationController.js` — notification persistence and event timing.
- `server/middleware/authMiddleware.js` — authentication/authorization behavior.
- `server/routes/patientRoutes.js` — **verify path/name**.
- `server/routes/appointmentRoutes.js` — **verify path/name**.
- `server/routes/bedRoutes.js` — **verify path/name**.
- `server/routes/admissionRoutes.js` — **verify path/name**.

Also inspect `docs/API.md`, `docs/DATABASE.md`, `PROJECT_ARCHITECTURE.md`, and `README.md` when validating contracts and setup instructions. Do not modify database schema or lifecycle controllers as part of the frontend-only API migration phase.

### 17.4 Synchronization strategy files

Before implementing refresh/invalidation, inspect `client/package.json` for an existing query/cache dependency. Then choose one approach:

- **TanStack Query:** add/configure the provider in `client/src/main.jsx` and define shared query keys/mutation invalidation helpers in a dedicated service module; or
- **Lightweight event/context:** add one central helper, for example `client/src/services/dataRefresh.js`, and use its events consistently.

The proposed helper filename is a design suggestion, not an existing verified file. Do not create both strategies or scatter ad hoc reloads/events throughout the app.

### 17.5 Current progress and immediate next actions

1. Finish the `EditAppointment.jsx` shared API migration and run lint/build.
2. Review `AppointmentDetails.jsx` next, then `AddDoctorForm.jsx`, `PatientTrendChart.jsx`, `UserManagement.jsx`, and `Login.jsx`.
3. Rerun the repository-wide frontend audit and inspect remaining matches.
4. Only after Phase 1 is clean, proceed to backend bed/admission lifecycle and live-schema verification.
5. After each change, record the exact files changed, checks run, and any runtime tests still outstanding.

**Important:** A passing frontend build does not prove API contracts, database transactions, or cross-page refresh behavior. Those require runtime and regression tests against the running HMS and a safely backed-up database.
