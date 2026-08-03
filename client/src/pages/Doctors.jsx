// ==========================================================
// DOCTORS PAGE
// Manages doctor registration and doctor list
// ==========================================================

import { useState } from "react";

import AddDoctorForm from "../components/AddDoctorFrom.jsx";
import DoctorList from "../components/DoctorList.jsx";


function Doctors() {

    // ==========================================================
    // REFRESH STATE
    // Changing this value tells DoctorList to fetch doctors again
    // ==========================================================

    const [refreshDoctors, setRefreshDoctors] = useState(0);


    // ==========================================================
    // REFRESH DOCTOR LIST
    // This function is passed to AddDoctorForm
    // ==========================================================

    const handleDoctorAdded = () => {

        setRefreshDoctors((previousValue) => previousValue + 1);

    };


    return (

        <div>

            {/* ==========================================================
                PAGE TITLE
            ========================================================== */}

            <h1 className="text-3xl font-bold">
                Doctor Management
            </h1>


            {/* ==========================================================
                ADD DOCTOR FORM
            ========================================================== */}

            <AddDoctorForm
                refreshDoctors={handleDoctorAdded}
            />


            {/* ==========================================================
                DOCTOR LIST
            ========================================================== */}

            <DoctorList
                refreshDoctors={refreshDoctors}
            />

        </div>

    );

}


export default Doctors;