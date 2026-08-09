// ==========================================================
// MAIN APP COMPONENT
// ==========================================================

import "./App.css";


// ==========================================================
// REACT ROUTER
// ==========================================================

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


// ==========================================================
// AUTH PAGES
// ==========================================================

import Login from "./pages/Login";
import Register from "./pages/Register";


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


// ==========================================================
// APP COMPONENT
// ==========================================================

function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* ==========================================================
                    LOGIN
                ========================================================== */}

                <Route
                    path="/"
                    element={<Login />}
                />


                {/* ==========================================================
                    REGISTER
                ========================================================== */}

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==========================================================
                    DASHBOARD
                ========================================================== */}

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />


                {/* ==========================================================
                    PATIENTS
                ========================================================== */}

                <Route
                    path="/patients"
                    element={<Patients />}
                />


                <Route
                    path="/patients/:id"
                    element={<PatientDetails />}
                />


                <Route
                    path="/patients/:id/edit"
                    element={<EditPatient />}
                />


                {/* ==========================================================
                    DOCTORS
                ========================================================== */}

                <Route
                    path="/doctors"
                    element={<Doctors />}
                />


                <Route
                    path="/doctors/:id"
                    element={<DoctorDetails />}
                />


                <Route
                    path="/doctors/:id/edit"
                    element={<EditDoctor />}
                />


                {/* ==========================================================
                    APPOINTMENTS
                ========================================================== */}

                <Route
                    path="/appointments"
                    element={<Appointments />}
                />


                <Route
                    path="/appointments/:id"
                    element={<AppointmentDetails />}
                />


                <Route
                    path="/appointments/:id/edit"
                    element={<EditAppointment />}
                />


                {/* ==========================================================
                    BEDS
                ========================================================== */}

                <Route
                    path="/beds"
                    element={<BedList />}
                />


                <Route
                    path="/beds/add"
                    element={<AddBedForm />}
                />


                <Route
                    path="/beds/edit/:id"
                    element={<EditBed />}
                />


                <Route
                    path="/beds/:id"
                    element={<BedDetails />}
                />


                {/* ==========================================================
                    ADMISSIONS
                ========================================================== */}
                <Route
                    path="/admissions"
                    element={<Admissions />}
                />

                <Route
                    path="/admissions/add"
                    element={<AddAdmissionForm />}
                />

                <Route
                    path="/admissions/:id"
                    element={<AdmissionDetails />}
                />


            </Routes>

        </BrowserRouter>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default App;