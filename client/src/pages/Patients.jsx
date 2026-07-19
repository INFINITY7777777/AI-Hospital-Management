// ==========================================================
// PATIENTS PAGE
// Displays the list of all patients
// ==========================================================

import AddPatientForm from "../components/AddPatientForm"
function Patients() {

    return (

        <div>

            <h1 className="text-3xl font-bold">
                Patient Management
            </h1>

            <AddPatientForm />

        </div>

    );

}

export default Patients;