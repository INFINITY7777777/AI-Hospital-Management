// ==========================================================
// REACT HOOKS
// ==========================================================

import { useEffect, useState } from "react";


// ==========================================================
// AXIOS
// ==========================================================

import axios from "axios";


// ==========================================================
// REACT ROUTER
// ==========================================================

import { useNavigate } from "react-router-dom";


// ==========================================================
// NAVBAR
// ==========================================================

import Navbar from "../components/Navbar";


// ==========================================================
// SIDEBAR
// ==========================================================

import Sidebar from "../components/Sidebar";


// ==========================================================
// BED LIST COMPONENT
// ==========================================================

function BedList() {

    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // BEDS STATE
    // ==========================================================

    const [beds, setBeds] = useState([]);


    // ==========================================================
    // PATIENTS STATE
    // Used for assigning patients to beds
    // ==========================================================

    const [patients, setPatients] = useState([]);


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // ASSIGNING BED STATE
    // Stores the bed currently being assigned
    // ==========================================================

    const [assigningBedId, setAssigningBedId] = useState(null);


    // ==========================================================
    // SELECTED PATIENT STATE
    // ==========================================================

    const [selectedPatientId, setSelectedPatientId] = useState("");


    // ==========================================================
    // ACTION LOADING STATE
    // Used for assign / release / delete actions
    // ==========================================================

    const [actionLoading, setActionLoading] = useState(false);


    // ==========================================================
    // FETCH BEDS
    // ==========================================================

    const fetchBeds = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/beds"
            );


            setBeds(
                response.data.beds || []
            );

        }

        catch (error) {

            console.error(
                "Error fetching beds:",
                error
            );


            setError(
                error.response?.data?.error ||
                "Failed to fetch beds"
            );

        }

    };


    // ==========================================================
    // FETCH PATIENTS
    // ==========================================================

    const fetchPatients = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/patients"
            );


            setPatients(
                response.data.patients || []
            );

        }

        catch (error) {

            console.error(
                "Error fetching patients:",
                error
            );


            setError(
                error.response?.data?.error ||
                "Failed to fetch patients"
            );

        }

    };


    // ==========================================================
    // INITIAL DATA FETCH
    // ==========================================================

    useEffect(() => {

        const loadData = async () => {

            try {

                await Promise.all([

                    fetchBeds(),

                    fetchPatients()

                ]);

            }

            finally {

                setLoading(false);

            }

        };


        loadData();

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);


    // ==========================================================
    // OPEN ASSIGN PATIENT UI
    // ==========================================================

    const handleAssignClick = (bedId) => {

        setAssigningBedId(bedId);

        setSelectedPatientId("");

    };


    // ==========================================================
    // CANCEL ASSIGNMENT
    // ==========================================================

    const handleCancelAssign = () => {

        setAssigningBedId(null);

        setSelectedPatientId("");

    };


    // ==========================================================
    // ASSIGN PATIENT TO BED
    // ==========================================================

    const handleAssignPatient = async (bedId) => {

        // ==========================================================
        // CHECK PATIENT SELECTION
        // ==========================================================

        if (!selectedPatientId) {

            alert(
                "Please select a patient"
            );

            return;

        }


        try {

            setActionLoading(true);


            // ==========================================================
            // ASSIGN PATIENT API
            // ==========================================================

            await axios.put(

                `http://localhost:5000/api/beds/${bedId}/assign`,

                {

                    patientId:
                        Number(selectedPatientId)

                }

            );


            // ==========================================================
            // SUCCESS MESSAGE
            // ==========================================================

            alert(
                "Patient assigned to bed successfully"
            );


            // ==========================================================
            // REFRESH BEDS
            // ==========================================================

            await fetchBeds();


            // ==========================================================
            // RESET ASSIGNMENT UI
            // ==========================================================

            setAssigningBedId(null);

            setSelectedPatientId("");

        }

        catch (error) {

            console.error(
                "Error assigning patient:",
                error
            );


            alert(

                error.response?.data?.error ||

                "Failed to assign patient"

            );

        }

        finally {

            setActionLoading(false);

        }

    };


    // ==========================================================
    // RELEASE BED
    // ==========================================================

    const handleReleaseBed = async (bedId) => {

        // ==========================================================
        // CONFIRM RELEASE
        // ==========================================================

        const confirmRelease = window.confirm(

            "Are you sure you want to release this bed?"

        );


        if (!confirmRelease) {

            return;

        }


        try {

            setActionLoading(true);


            // ==========================================================
            // RELEASE BED API
            // ==========================================================

            await axios.put(

                `http://localhost:5000/api/beds/${bedId}/release`

            );


            // ==========================================================
            // SUCCESS MESSAGE
            // ==========================================================

            alert(
                "Bed released successfully"
            );


            // ==========================================================
            // REFRESH BED LIST
            // ==========================================================

            await fetchBeds();

        }

        catch (error) {

            console.error(
                "Error releasing bed:",
                error
            );


            alert(

                error.response?.data?.error ||

                "Failed to release bed"

            );

        }

        finally {

            setActionLoading(false);

        }

    };


    // ==========================================================
    // DELETE BED
    // ==========================================================

    const handleDeleteBed = async (bed) => {

        // ==========================================================
        // SAFETY CHECK
        // Do not allow occupied beds to be deleted
        // ==========================================================

        if (bed.status === "Occupied") {

            alert(

                "Occupied beds cannot be deleted. Release the bed first."

            );

            return;

        }


        // ==========================================================
        // CONFIRM DELETE
        // ==========================================================

        const confirmDelete = window.confirm(

            `Are you sure you want to delete bed ${bed.bed_number}?`

        );


        if (!confirmDelete) {

            return;

        }


        try {

            setActionLoading(true);


            // ==========================================================
            // DELETE BED API
            // ==========================================================

            await axios.delete(

                `http://localhost:5000/api/beds/${bed.id}`

            );


            // ==========================================================
            // SUCCESS MESSAGE
            // ==========================================================

            alert(
                "Bed deleted successfully"
            );


            // ==========================================================
            // REFRESH BED LIST
            // ==========================================================

            await fetchBeds();

        }

        catch (error) {

            console.error(
                "Error deleting bed:",
                error
            );


            alert(

                error.response?.data?.error ||

                "Failed to delete bed"

            );

        }

        finally {

            setActionLoading(false);

        }

    };


    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex">

                    <Sidebar />

                    <div className="flex-1 p-8">

                        <p className="text-gray-500">

                            Loading beds...

                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // MAIN UI
    // ==========================================================

    return (

        <div className="min-h-screen bg-gray-100">


            {/* ==========================================================
                NAVBAR
            ========================================================== */}

            <Navbar />


            <div className="flex">


                {/* ==========================================================
                    SIDEBAR
                ========================================================== */}

                <Sidebar />


                {/* ==========================================================
                    MAIN CONTENT
                ========================================================== */}

                <div className="flex-1 p-8">


                    {/* ==========================================================
                        HEADER
                    ========================================================== */}

                    <div className="flex justify-between items-center mb-6">

                        <h1 className="text-3xl font-bold">

                            Bed Management

                        </h1>


                        {/* ==========================================================
                            ADD BED BUTTON
                        ========================================================== */}

                        <button

                            onClick={() =>
                                navigate("/beds/add")
                            }

                            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"

                        >

                            + Add Bed

                        </button>

                    </div>


                    {/* ==========================================================
                        ERROR MESSAGE
                    ========================================================== */}

                    {error && (

                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">

                            {error}

                        </div>

                    )}


                    {/* ==========================================================
                        NO BEDS
                    ========================================================== */}

                    {beds.length === 0 ? (

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-gray-500">

                                No beds found.

                            </p>

                        </div>

                    ) : (

                        /* ==========================================================
                           BED TABLE
                        ========================================================== */

                        <div className="bg-white rounded-xl shadow overflow-x-auto">

                            <table className="w-full">


                                {/* ==========================================================
                                    TABLE HEADER
                                ========================================================== */}

                                <thead>

                                    <tr className="border-b bg-gray-50">

                                        <th className="text-left p-4">

                                            Bed Number

                                        </th>


                                        <th className="text-left p-4">

                                            Ward

                                        </th>


                                        <th className="text-left p-4">

                                            Bed Type

                                        </th>


                                        <th className="text-left p-4">

                                            Status

                                        </th>


                                        <th className="text-left p-4">

                                            Patient

                                        </th>


                                        <th className="text-left p-4">

                                            Actions

                                        </th>

                                    </tr>

                                </thead>


                                {/* ==========================================================
                                    TABLE BODY
                                ========================================================== */}

                                <tbody>

                                    {beds.map((bed) => (

                                        <tr

                                            key={bed.id}

                                            className="border-b hover:bg-gray-50"

                                        >


                                            {/* ==========================================================
                                                BED NUMBER
                                            ========================================================== */}

                                            <td className="p-4">

                                                <button

                                                    onClick={() =>

                                                        navigate(

                                                            `/beds/${bed.id}`

                                                        )

                                                    }

                                                    className="text-blue-600 font-semibold hover:underline"

                                                >

                                                    {bed.bed_number}

                                                </button>

                                            </td>


                                            {/* ==========================================================
                                                WARD
                                            ========================================================== */}

                                            <td className="p-4">

                                                {bed.ward}

                                            </td>


                                            {/* ==========================================================
                                                BED TYPE
                                            ========================================================== */}

                                            <td className="p-4">

                                                {bed.bed_type}

                                            </td>


                                            {/* ==========================================================
                                                STATUS
                                            ========================================================== */}

                                            <td className="p-4">

                                                {bed.status}

                                            </td>


                                            {/* ==========================================================
                                                PATIENT
                                            ========================================================== */}

                                            <td className="p-4">

                                                {bed.patient_name || "—"}

                                            </td>


                                            {/* ==========================================================
                                                ACTIONS
                                            ========================================================== */}

                                            <td className="p-4">

                                                <div className="flex flex-wrap gap-2">


                                                    {/* ==========================================================
                                                        EDIT
                                                    ========================================================== */}

                                                    <button

                                                        onClick={() =>

                                                            navigate(

                                                                `/beds/edit/${bed.id}`

                                                            )

                                                        }

                                                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"

                                                    >

                                                        Edit

                                                    </button>


                                                    {/* ==========================================================
                                                        AVAILABLE BED
                                                    ========================================================== */}

                                                    {bed.status === "Available" && (

                                                        <>

                                                            {assigningBedId === bed.id ? (

                                                                <div className="flex flex-col gap-2">


                                                                    {/* ==========================================================
                                                                        PATIENT SELECT
                                                                    ========================================================== */}

                                                                    <select

                                                                        value={
                                                                            selectedPatientId
                                                                        }

                                                                        onChange={(event) =>

                                                                            setSelectedPatientId(

                                                                                event.target.value

                                                                            )

                                                                        }

                                                                        className="border rounded-lg p-2"

                                                                    >

                                                                        <option value="">

                                                                            Select Patient

                                                                        </option>


                                                                        {patients.map(

                                                                            (patient) => (

                                                                                <option

                                                                                    key={patient.id}

                                                                                    value={patient.id}

                                                                                >

                                                                                    {patient.patient_name}

                                                                                </option>

                                                                            )

                                                                        )}

                                                                    </select>


                                                                    {/* ==========================================================
                                                                        ASSIGN / CANCEL BUTTONS
                                                                    ========================================================== */}

                                                                    <div className="flex gap-2">


                                                                        <button

                                                                            onClick={() =>

                                                                                handleAssignPatient(

                                                                                    bed.id

                                                                                )

                                                                            }

                                                                            disabled={actionLoading}

                                                                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"

                                                                        >

                                                                            {actionLoading

                                                                                ? "Assigning..."

                                                                                : "Confirm Assign"

                                                                            }

                                                                        </button>


                                                                        <button

                                                                            onClick={

                                                                                handleCancelAssign

                                                                            }

                                                                            disabled={actionLoading}

                                                                            className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"

                                                                        >

                                                                            Cancel

                                                                        </button>

                                                                    </div>

                                                                </div>

                                                            ) : (

                                                                <button

                                                                    onClick={() =>

                                                                        handleAssignClick(

                                                                            bed.id

                                                                        )

                                                                    }

                                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"

                                                                >

                                                                    Assign Patient

                                                                </button>

                                                            )}


                                                            {/* ==========================================================
                                                                DELETE AVAILABLE BED
                                                            ========================================================== */}

                                                            <button

                                                                onClick={() =>

                                                                    handleDeleteBed(

                                                                        bed

                                                                    )

                                                                }

                                                                disabled={actionLoading}

                                                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"

                                                            >

                                                                Delete

                                                            </button>

                                                        </>

                                                    )}


                                                    {/* ==========================================================
                                                        OCCUPIED BED
                                                    ========================================================== */}

                                                    {bed.status === "Occupied" && (

                                                        <button

                                                            onClick={() =>

                                                                handleReleaseBed(

                                                                    bed.id

                                                                )

                                                            }

                                                            disabled={actionLoading}

                                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"

                                                        >

                                                            {actionLoading

                                                                ? "Releasing..."

                                                                : "Release Bed"

                                                            }

                                                        </button>

                                                    )}


                                                    {/* ==========================================================
                                                        MAINTENANCE BED
                                                    ========================================================== */}

                                                    {bed.status === "Maintenance" && (

                                                        <>

                                                            <span className="text-gray-500 px-2 py-2">

                                                                Not Available

                                                            </span>


                                                            {/* ==========================================================
                                                                DELETE MAINTENANCE BED
                                                            ========================================================== */}

                                                            <button

                                                                onClick={() =>

                                                                    handleDeleteBed(

                                                                        bed

                                                                    )

                                                                }

                                                                disabled={actionLoading}

                                                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"

                                                            >

                                                                Delete

                                                            </button>

                                                        </>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default BedList;