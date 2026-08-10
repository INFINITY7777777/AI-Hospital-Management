import { useState } from "react";

import AppointmentList from "../components/AppointmentList";
import AddAppointmentForm from "../components/AddAppointmentForm";

function Appointments() {

    const [refreshAppointments, setRefreshAppointments] = useState(0);


    const handleAppointmentCreated = () => {

        setRefreshAppointments(
            (previousValue) => previousValue + 1
        );

    };


    return (

        <div>

            <h1 className="text-3xl font-bold">
                Appointment Management
            </h1>


            <AddAppointmentForm
                refreshAppointments={
                    handleAppointmentCreated
                }
            />


            <AppointmentList
                refreshAppointments={
                    refreshAppointments
                }
            />

        </div>

    );

}

export default Appointments;