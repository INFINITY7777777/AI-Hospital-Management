// ==========================================================
// MAIN APP COMPONENT
// ==========================================================

import "./App.css";

// ==========================================================
// REACT ROUTER
// ==========================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ==========================================================
// AUTH & ADMIN PAGES
// ==========================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserManagement from "./pages/UserManagement";

// ==========================================================
// DASHBOARD
// ==========================================================

import Dashboard from "./pages/Dashboard";

// ==========================================================
// PATIENT PAGES
// ==========================================================

import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import EditPatient from "./pages/EditPatient";

// ==========================================================
// DOCTOR PAGES
// ==========================================================

import Doctors from "./pages/Doctors";
import DoctorDetails from "./pages/DoctorDetails";
import EditDoctor from "./pages/EditDoctor";

// ==========================================================
// APPOINTMENT PAGES
// ==========================================================

import Appointments from "./pages/Appointments";
import AppointmentDetails from "./pages/AppointmentDetails";
import EditAppointment from "./pages/EditAppointment";

// ==========================================================
// BED PAGES
// ==========================================================

import BedList from "./pages/BedList";
import AddBedForm from "./pages/AddBedForm";
import EditBed from "./pages/EditBed";
import BedDetails from "./pages/BedDetails";

// ==========================================================
// ADMISSION PAGES
// ==========================================================

import Admissions from "./pages/Admissions";
import AddAdmissionForm from "./pages/AddAdmissionForm";
import AdmissionDetails from "./pages/AdmissionDetails";
import EditAdmission from "./pages/EditAdmission";

// ==========================================================
// PHARMACY & OTHER PAGES
// ==========================================================

import Pharmacy from "./pages/Pharmacy";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

// ==========================================================
// ROUTE GUARDS
// ==========================================================

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.role === "admin" ? children : <Navigate to="/dashboard" replace />;
};

// ==========================================================
// APP COMPONENT
// ==========================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Only Route */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Patients */}
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetails />} />
        <Route path="/patients/:id/edit" element={<EditPatient />} />

        {/* Doctors */}
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/doctors/:id/edit" element={<EditDoctor />} />

        {/* Appointments */}
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/:id" element={<AppointmentDetails />} />
        <Route path="/appointments/:id/edit" element={<EditAppointment />} />

        {/* Beds */}
        <Route path="/beds" element={<BedList />} />
        <Route path="/beds/add" element={<AddBedForm />} />
        <Route path="/beds/edit/:id" element={<EditBed />} />
        <Route path="/beds/:id" element={<BedDetails />} />

        {/* Admissions */}
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/admissions/add" element={<AddAdmissionForm />} />
        <Route path="/admissions/:id" element={<AdmissionDetails />} />
        <Route path="/admissions/:id/edit" element={<EditAdmission />} />

        {/* Utility Pages */}
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;