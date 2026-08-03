import { useState } from "react";

import AppointmentList from "../components/AppointmentList";
import AddAppointmentForm from "../components/AddAppointmentFrom";

function Appointments() {

        // ==========================================================
        // REFRESH STATE
        // Changes whenever a new appointment is created
        // ==========================================================

        const [refreshAppointments, setRefreshAppointments] = useState(0);


        // ==========================================================
        // REFRESH APPOINTMENT LIST
        // ==========================================================

        const handleAppointmentCreated = () => {

            setRefreshAppointments(
                (previousValue) => previousValue + 1
            );

        };
    return (

        <div>

            {/* ==========================================================
                PAGE TITLE
            ========================================================== */}

            <h1 className="text-3xl font-bold">
                Appointment Management
            </h1>

            
            {/* ==========================================================
                ADD APPOINTMENT FORM
            ========================================================== */}

            <AddAppointmentForm
                refreshAppointments={
                    handleAppointmentCreated
                }
            />

            {/* ==========================================================
                APPOINTMENT LIST
            ========================================================== */}

            <AppointmentList
                refreshAppointments={
                    refreshAppointments
                }
            />

        </div>

    );

}

export default Appointments;