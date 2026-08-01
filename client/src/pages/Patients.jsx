// ==========================================================
// PATIENTS PAGE
// Displays the list of all patients
// ==========================================================

import { useState } from "react";

import AddPatientForm from "../components/AddPatientForm";
import PatientList from "../components/PatientList";


function Patients() {

    // ==========================================================
    // REFRESH STATE
    // Changes whenever a new patient is successfully added
    // ==========================================================

    const [refreshPatients, setRefreshPatients] = useState(false);


    // ==========================================================
    // HANDLE PATIENT ADDED
    // Tells PatientList to fetch patients again
    // ==========================================================

    const handlePatientAdded = () => {

        setRefreshPatients(!refreshPatients);

    };


    return (

        <div>

            <h1 className="text-3xl font-bold">
                Patient Management
            </h1>


            <AddPatientForm
                onPatientAdded={handlePatientAdded}
            />


            <PatientList
                refreshPatients={refreshPatients}
            />

        </div>

    );

}

export default Patients;