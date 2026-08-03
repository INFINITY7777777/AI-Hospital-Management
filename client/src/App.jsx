// ==========================================================
// MAIN APP COMPONENT
// This is the root component of our Hospital Management System.
// Every page will eventually be displayed from here.
// ==========================================================
import './App.css'

// ==========================================================
// REACT ROUTER IMPORTS
// BrowserRouter enables page navigation.
// Routes contains all routes.
// Route defines individual pages.
// ==========================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";

// ==========================================================
// PAGE IMPORTS
// Import all pages that will be used.
// ==========================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import EditPatient from "./pages/EditPatient";

import Doctors from "./pages/Doctors"
import DoctorDetails from "./pages/DoctorDetails";
import EditDoctor from "./pages/EditDoctor";

import Appointments from "./pages/Appointments"
import AppointmentDetails from "./pages/AppointmentDetails";


function App() {
  return (
    <div className = "min-h-screen bg-slate-100 flex items-center justify-center">

      <div className = "bg-white p-10 rounded-x1 shadow-x1"> </div>

      
    <BrowserRouter>

        <Routes>

            {/* Login Page */}
            <Route path="/" element={<Login />} />

            {/* Register Page */}
            <Route path="/register" element={<Register />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Patients */}
            <Route path="/Patients" element={<Patients />} />

            <Route path="/patients/:id" element={<PatientDetails />} />

            <Route path="/patients/:id/edit" element={<EditPatient />} />

            {/* Doctors */}
            <Route path="/Doctors"element={<Doctors />} />

            <Route path="/doctors/:id" element={<DoctorDetails />} />

            <Route path="/doctors/:id/edit" element={<EditDoctor />} />

            {/* Appointments */}
            <Route path="/appointments" element={<Appointments />} />    

            <Route path="/appointments/:id" element={<AppointmentDetails />} />     
        
        </Routes>

    </BrowserRouter>

    </div>

    
  );
}

export default App
