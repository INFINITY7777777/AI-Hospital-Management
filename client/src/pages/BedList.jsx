// ==========================================================
// BED LIST
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// REACT ROUTER
// ==========================================================

import { useNavigate } from "react-router-dom";

// ==========================================================
// AXIOS API CLIENT
// IMPORTANT:
// This uses your api.js Axios instance so that the JWT
// interceptor automatically attaches the token.
// ==========================================================

import api from "../services/api";

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
    // BEDS
    // ==========================================================

    const [beds, setBeds] = useState([]);


    // ==========================================================
    // PATIENTS
    // ==========================================================

    const [patients, setPatients] = useState([]);


    // ==========================================================
    // LOADING
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // ERROR
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // SELECTED BED
    // ==========================================================

    const [selectedBed, setSelectedBed] = useState(null);


    // ==========================================================
    // MODAL TYPE
    //
    // null
    // assign
    // release
    // ==========================================================

    const [modalType, setModalType] = useState(null);


    // ==========================================================
    // SELECTED PATIENT
    // ==========================================================

    const [selectedPatientId, setSelectedPatientId] = useState("");


    // ==========================================================
    // ACTION LOADING
    // ==========================================================

    const [actionLoading, setActionLoading] = useState(false);


    // ==========================================================
    // FETCH BEDS
    // ==========================================================

    const fetchBeds = async () => {

        try {

            setError("");

            const response = await api.get("/beds");

            setBeds(
                response.data?.beds || []
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

            const response = await api.get("/patients");

            setPatients(
                response.data?.patients || []
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

                setLoading(true);

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

    }, []);


    // ==========================================================
    // BED STATISTICS
    // ==========================================================

    const totalBeds = beds.length;


    const availableBeds = beds.filter(
        (bed) => bed.status === "Available"
    ).length;


    const occupiedBeds = beds.filter(
        (bed) => bed.status === "Occupied"
    ).length;


    const maintenanceBeds = beds.filter(
        (bed) => bed.status === "Maintenance"
    ).length;


    // ==========================================================
    // OVERALL OCCUPANCY
    // ==========================================================

    const occupancyPercentage =
        totalBeds > 0
            ? Math.round(
                (occupiedBeds / totalBeds) * 100
            )
            : 0;


    // ==========================================================
    // GROUP BEDS BY WARD
    // ==========================================================

    const bedsByWard = beds.reduce(
        (groups, bed) => {

            const wardName =
                bed.ward || "Unassigned Ward";


            if (!groups[wardName]) {

                groups[wardName] = [];

            }


            groups[wardName].push(bed);


            return groups;

        },
        {}
    );


    // ==========================================================
    // OPEN ASSIGN MODAL
    // ==========================================================

    const handleAssignClick = (bed) => {

        setSelectedBed(bed);

        setSelectedPatientId("");

        setModalType("assign");

    };


    // ==========================================================
    // OPEN RELEASE MODAL
    // ==========================================================

    const handleReleaseClick = (bed) => {

        setSelectedBed(bed);

        setModalType("release");

    };


    // ==========================================================
    // CLOSE MODAL
    // ==========================================================

    const closeModal = () => {

        if (actionLoading) {

            return;

        }


        setSelectedBed(null);

        setSelectedPatientId("");

        setModalType(null);

    };


    // ==========================================================
    // ASSIGN PATIENT
    // ==========================================================

    const handleAssignPatient = async () => {

        if (!selectedBed) {

            return;

        }


        if (!selectedPatientId) {

            alert("Please select a patient.");

            return;

        }


        try {

            setActionLoading(true);


            await api.put(
                `/beds/${selectedBed.id}/assign`,
                {
                    patientId:
                        Number(selectedPatientId)
                }
            );


            alert(
                "Patient assigned to bed successfully."
            );


            await fetchBeds();


            setSelectedBed(null);

            setSelectedPatientId("");

            setModalType(null);

        }

        catch (error) {

            console.error(
                "Error assigning patient:",
                error
            );


            alert(
                error.response?.data?.error ||
                "Failed to assign patient."
            );

        }

        finally {

            setActionLoading(false);

        }

    };


    // ==========================================================
    // RELEASE BED
    // ==========================================================

    const handleReleaseBed = async () => {

        if (!selectedBed) {

            return;

        }


        try {

            setActionLoading(true);


            await api.put(
                `/beds/${selectedBed.id}/release`
            );


            alert(
                "Bed released successfully."
            );


            await fetchBeds();


            setSelectedBed(null);

            setSelectedPatientId("");

            setModalType(null);

        }

        catch (error) {

            console.error(
                "Error releasing bed:",
                error
            );


            alert(
                error.response?.data?.error ||
                "Failed to release bed."
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

        if (bed.status === "Occupied") {

            alert(
                "Occupied beds cannot be deleted. Release the bed first."
            );

            return;

        }


        const confirmed = window.confirm(
            `Are you sure you want to delete bed ${bed.bed_number}?`
        );


        if (!confirmed) {

            return;

        }


        try {

            setActionLoading(true);


            await api.delete(
                `/beds/${bed.id}`
            );


            alert(
                "Bed deleted successfully."
            );


            await fetchBeds();

        }

        catch (error) {

            console.error(
                "Error deleting bed:",
                error
            );


            alert(
                error.response?.data?.error ||
                "Failed to delete bed."
            );

        }

        finally {

            setActionLoading(false);

        }

    };


    // ==========================================================
    // STATUS STYLES
    // ==========================================================

    const getStatusStyles = (status) => {

        switch (status) {

            case "Available":

                return {

                    card:
                        "border-green-200 bg-green-50",

                    dot:
                        "bg-green-500",

                    badge:
                        "bg-green-100 text-green-700",

                    statusText:
                        "text-green-700"

                };


            case "Occupied":

                return {

                    card:
                        "border-red-200 bg-red-50",

                    dot:
                        "bg-red-500",

                    badge:
                        "bg-red-100 text-red-700",

                    statusText:
                        "text-red-700"

                };


            case "Maintenance":

                return {

                    card:
                        "border-yellow-200 bg-yellow-50",

                    dot:
                        "bg-yellow-500",

                    badge:
                        "bg-yellow-100 text-yellow-700",

                    statusText:
                        "text-yellow-700"

                };


            default:

                return {

                    card:
                        "border-gray-200 bg-gray-50",

                    dot:
                        "bg-gray-500",

                    badge:
                        "bg-gray-100 text-gray-700",

                    statusText:
                        "text-gray-700"

                };

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

                    <main className="flex-1 min-w-0 p-6 lg:p-8">

                        <div className="bg-white rounded-xl shadow-sm p-8">

                            <div className="animate-pulse space-y-4">

                                <div className="h-8 bg-gray-200 rounded w-1/3"></div>

                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

                                    <div className="h-28 bg-gray-200 rounded-xl"></div>

                                    <div className="h-28 bg-gray-200 rounded-xl"></div>

                                    <div className="h-28 bg-gray-200 rounded-xl"></div>

                                    <div className="h-28 bg-gray-200 rounded-xl"></div>

                                </div>

                            </div>

                        </div>

                    </main>

                </div>

            </div>

        );

    }


    // ==========================================================
    // MAIN UI
    // ==========================================================

    return (

        <div className="min-h-screen bg-gray-100">

            {/* ======================================================
                NAVBAR
            ====================================================== */}

            <Navbar />


            <div className="flex">

                {/* ==================================================
                    SIDEBAR
                ================================================== */}

                <Sidebar />


                {/* ==================================================
                    MAIN CONTENT
                ================================================== */}

                <main className="flex-1 min-w-0 p-5 sm:p-6 lg:p-8">

                    {/* ==================================================
                        PAGE HEADER
                    ================================================== */}

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

                        <div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">

                                Bed Management

                            </h1>


                            <p className="text-gray-500 mt-1">

                                Monitor bed availability and manage patient assignments.

                            </p>

                        </div>


                        <button

                            onClick={() =>
                                navigate("/beds/add")
                            }

                            className="self-start lg:self-auto inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"

                        >

                            <span className="text-lg mr-1">

                                +

                            </span>

                            Add Bed

                        </button>

                    </div>


                    {/* ==================================================
                        ERROR MESSAGE
                    ================================================== */}

                    {error && (

                        <div className="mb-6 flex items-center justify-between gap-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">

                            <p className="text-sm">

                                {error}

                            </p>


                            <button

                                onClick={() => {
                                    setError("");
                                    fetchBeds();
                                    fetchPatients();
                                }}

                                className="text-sm font-medium underline hover:no-underline"

                            >

                                Retry

                            </button>

                        </div>

                    )}


                    {/* ==================================================
                        SUMMARY CARDS
                    ================================================== */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">


                        {/* TOTAL */}

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">

                            <p className="text-sm font-medium text-gray-500">

                                Total Beds

                            </p>


                            <p className="text-3xl font-bold text-gray-800 mt-2">

                                {totalBeds}

                            </p>


                            <p className="text-sm text-gray-400 mt-1">

                                Hospital capacity

                            </p>

                        </div>


                        {/* AVAILABLE */}

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">

                            <p className="text-sm font-medium text-gray-500">

                                Available

                            </p>


                            <p className="text-3xl font-bold text-green-600 mt-2">

                                {availableBeds}

                            </p>


                            <p className="text-sm text-gray-400 mt-1">

                                Ready for assignment

                            </p>

                        </div>


                        {/* OCCUPIED */}

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">

                            <p className="text-sm font-medium text-gray-500">

                                Occupied

                            </p>


                            <p className="text-3xl font-bold text-red-600 mt-2">

                                {occupiedBeds}

                            </p>


                            <p className="text-sm text-gray-400 mt-1">

                                {occupancyPercentage}% occupancy

                            </p>

                        </div>


                        {/* MAINTENANCE */}

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">

                            <p className="text-sm font-medium text-gray-500">

                                Maintenance

                            </p>


                            <p className="text-3xl font-bold text-yellow-600 mt-2">

                                {maintenanceBeds}

                            </p>


                            <p className="text-sm text-gray-400 mt-1">

                                Currently unavailable

                            </p>

                        </div>

                    </div>


                    {/* ==================================================
                        EMPTY STATE
                    ================================================== */}

                    {beds.length === 0 ? (

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">

                            <div className="text-4xl mb-3">

                                🛏️

                            </div>


                            <h2 className="text-xl font-semibold text-gray-700">

                                No beds found

                            </h2>


                            <p className="text-gray-500 mt-2 mb-5">

                                Add your first hospital bed to begin managing capacity.

                            </p>


                            <button

                                onClick={() =>
                                    navigate("/beds/add")
                                }

                                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"

                            >

                                + Add Bed

                            </button>

                        </div>

                    ) : (

                        /* ==================================================
                           WARD SECTIONS
                        ================================================== */

                        <div className="space-y-6">

                            {Object.entries(bedsByWard).map(

                                ([wardName, wardBeds]) => {

                                    // ==========================================
                                    // WARD STATISTICS
                                    // ==========================================

                                    const wardOccupied =
                                        wardBeds.filter(
                                            (bed) =>
                                                bed.status === "Occupied"
                                        ).length;


                                    const wardAvailable =
                                        wardBeds.filter(
                                            (bed) =>
                                                bed.status === "Available"
                                        ).length;


                                    const wardMaintenance =
                                        wardBeds.filter(
                                            (bed) =>
                                                bed.status === "Maintenance"
                                        ).length;


                                    const wardOccupancy =
                                        wardBeds.length > 0
                                            ? Math.round(
                                                (wardOccupied /
                                                    wardBeds.length) *
                                                100
                                            )
                                            : 0;


                                    return (

                                        <section

                                            key={wardName}

                                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"

                                        >

                                            {/* ==========================================
                                                WARD HEADER
                                            ========================================== */}

                                            <div className="px-5 sm:px-6 py-4 border-b border-gray-200">

                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">


                                                    {/* WARD INFO */}

                                                    <div>

                                                        <h2 className="text-xl font-bold text-gray-800">

                                                            {wardName}

                                                        </h2>


                                                        <p className="text-sm text-gray-500 mt-1">

                                                            {wardBeds.length}{" "}
                                                            {wardBeds.length === 1
                                                                ? "bed"
                                                                : "beds"}

                                                            {" • "}

                                                            {wardAvailable} available

                                                            {" • "}

                                                            {wardOccupied} occupied

                                                            {wardMaintenance > 0 && (

                                                                <>
                                                                    {" • "}
                                                                    {wardMaintenance} maintenance
                                                                </>

                                                            )}

                                                        </p>

                                                    </div>


                                                    {/* OCCUPANCY */}

                                                    <div className="w-full md:w-56">

                                                        <div className="flex items-center justify-between mb-1.5">

                                                            <span className="text-sm text-gray-500">

                                                                Occupancy

                                                            </span>


                                                            <span className="text-sm font-bold text-gray-700">

                                                                {wardOccupancy}%

                                                            </span>

                                                        </div>


                                                        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">

                                                            <div

                                                                className="h-full bg-blue-600 rounded-full transition-all duration-300"

                                                                style={{

                                                                    width:
                                                                        `${wardOccupancy}%`

                                                                }}

                                                            />

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* ==========================================
                                                BED GRID
                                            ========================================== */}

                                            <div className="p-5 sm:p-6">

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                                                    {wardBeds.map(

                                                        (bed) => {

                                                            const styles =
                                                                getStatusStyles(
                                                                    bed.status
                                                                );


                                                            return (

                                                                <div

                                                                    key={bed.id}

                                                                    className={`border rounded-xl p-4 ${styles.card} transition duration-200 hover:shadow-md`}

                                                                >

                                                                    {/* ==========================================
                                                                        BED HEADER
                                                                    ========================================== */}

                                                                    <div className="flex items-start justify-between gap-3 mb-4">

                                                                        <button

                                                                            onClick={() =>
                                                                                navigate(
                                                                                    `/beds/${bed.id}`
                                                                                )
                                                                            }

                                                                            className="text-lg font-bold text-blue-600 hover:text-blue-800 hover:underline truncate"

                                                                        >

                                                                            {bed.bed_number}

                                                                        </button>


                                                                        <span

                                                                            className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${styles.badge}`}

                                                                        >

                                                                            <span

                                                                                className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}

                                                                            />

                                                                            {bed.status}

                                                                        </span>

                                                                    </div>


                                                                    {/* ==========================================
                                                                        BED TYPE
                                                                    ========================================== */}

                                                                    <div className="mb-3">

                                                                        <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">

                                                                            Bed Type

                                                                        </p>


                                                                        <p className="text-sm font-semibold text-gray-700 mt-0.5">

                                                                            {bed.bed_type || "—"}

                                                                        </p>

                                                                    </div>


                                                                    {/* ==========================================
                                                                        PATIENT
                                                                    ========================================== */}

                                                                    <div className="bg-white/60 rounded-lg p-3 mb-4">

                                                                        <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">

                                                                            Patient

                                                                        </p>


                                                                        {bed.patient_name ? (

                                                                            <p className="text-sm font-semibold text-gray-800 mt-1 truncate">

                                                                                {bed.patient_name}

                                                                            </p>

                                                                        ) : (

                                                                            <p className="text-sm text-gray-400 mt-1">

                                                                                No patient assigned

                                                                            </p>

                                                                        )}

                                                                    </div>


                                                                    {/* ==========================================
                                                                        ACTIONS
                                                                    ========================================== */}

                                                                    <div className="flex flex-wrap gap-2">


                                                                        {/* VIEW */}

                                                                        <button

                                                                            onClick={() =>
                                                                                navigate(
                                                                                    `/beds/${bed.id}`
                                                                                )
                                                                            }

                                                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition"

                                                                        >

                                                                            View

                                                                        </button>


                                                                        {/* EDIT */}

                                                                        <button

                                                                            onClick={() =>
                                                                                navigate(
                                                                                    `/beds/edit/${bed.id}`
                                                                                )
                                                                            }

                                                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-500 text-white hover:bg-yellow-600 transition"

                                                                        >

                                                                            Edit

                                                                        </button>


                                                                        {/* AVAILABLE */}

                                                                        {bed.status === "Available" && (

                                                                            <>

                                                                                <button

                                                                                    onClick={() =>
                                                                                        handleAssignClick(
                                                                                            bed
                                                                                        )
                                                                                    }

                                                                                    disabled={actionLoading}

                                                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"

                                                                                >

                                                                                    Assign

                                                                                </button>


                                                                                <button

                                                                                    onClick={() =>
                                                                                        handleDeleteBed(
                                                                                            bed
                                                                                        )
                                                                                    }

                                                                                    disabled={actionLoading}

                                                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"

                                                                                >

                                                                                    Delete

                                                                                </button>

                                                                            </>

                                                                        )}


                                                                        {/* OCCUPIED */}

                                                                        {bed.status === "Occupied" && (

                                                                            <button

                                                                                onClick={() =>
                                                                                    handleReleaseClick(
                                                                                        bed
                                                                                    )
                                                                                }

                                                                                disabled={actionLoading}

                                                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"

                                                                            >

                                                                                Release

                                                                            </button>

                                                                        )}


                                                                        {/* MAINTENANCE */}

                                                                        {bed.status === "Maintenance" && (

                                                                            <>

                                                                                <span className="inline-flex items-center px-2 py-1.5 text-xs text-gray-500">

                                                                                    Not available

                                                                                </span>


                                                                                <button

                                                                                    onClick={() =>
                                                                                        handleDeleteBed(
                                                                                            bed
                                                                                        )
                                                                                    }

                                                                                    disabled={actionLoading}

                                                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"

                                                                                >

                                                                                    Delete

                                                                                </button>

                                                                            </>

                                                                        )}

                                                                    </div>

                                                                </div>

                                                            );

                                                        }

                                                    )}

                                                </div>

                                            </div>

                                        </section>

                                    );

                                }

                            )}

                        </div>

                    )}

                </main>

            </div>


            {/* ==============================================================
                ASSIGN PATIENT MODAL
            ============================================================== */}

            {modalType === "assign" && selectedBed && (

                <div

                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"

                    onMouseDown={(event) => {

                        if (
                            event.target === event.currentTarget &&
                            !actionLoading
                        ) {

                            closeModal();

                        }

                    }}

                >

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">


                        {/* MODAL HEADER */}

                        <div className="px-6 py-5 border-b border-gray-200">

                            <h2 className="text-xl font-bold text-gray-800">

                                Assign Patient

                            </h2>


                            <p className="text-sm text-gray-500 mt-1">

                                Assign a patient to{" "}

                                <span className="font-semibold">

                                    {selectedBed.bed_number}

                                </span>

                                .

                            </p>

                        </div>


                        {/* MODAL BODY */}

                        <div className="p-6 space-y-5">


                            {/* BED INFORMATION */}

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">

                                <div>

                                    <p className="text-xs uppercase tracking-wide text-gray-500">

                                        Bed

                                    </p>


                                    <p className="font-semibold text-gray-800 mt-1">

                                        {selectedBed.bed_number}

                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs uppercase tracking-wide text-gray-500">

                                        Ward

                                    </p>


                                    <p className="font-semibold text-gray-800 mt-1">

                                        {selectedBed.ward || "—"}

                                    </p>

                                </div>

                            </div>


                            {/* PATIENT SELECT */}

                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">

                                    Patient

                                </label>


                                <select

                                    value={selectedPatientId}

                                    onChange={(event) =>
                                        setSelectedPatientId(
                                            event.target.value
                                        )
                                    }

                                    disabled={actionLoading}

                                    className="w-full border border-gray-300 rounded-lg px-3 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"

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


                                {patients.length === 0 && (

                                    <p className="text-xs text-red-500 mt-2">

                                        No patients available for assignment.

                                    </p>

                                )}

                            </div>

                        </div>


                        {/* MODAL FOOTER */}

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">

                            <button

                                onClick={closeModal}

                                disabled={actionLoading}

                                className="px-4 py-2.5 rounded-lg bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition disabled:opacity-50"

                            >

                                Cancel

                            </button>


                            <button

                                onClick={handleAssignPatient}

                                disabled={
                                    actionLoading ||
                                    !selectedPatientId
                                }

                                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"

                            >

                                {actionLoading
                                    ? "Assigning..."
                                    : "Assign Patient"}

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==============================================================
                RELEASE BED MODAL
            ============================================================== */}

            {modalType === "release" && selectedBed && (

                <div

                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"

                    onMouseDown={(event) => {

                        if (
                            event.target === event.currentTarget &&
                            !actionLoading
                        ) {

                            closeModal();

                        }

                    }}

                >

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">


                        {/* MODAL BODY */}

                        <div className="p-6">

                            <div className="flex items-center gap-3 mb-4">

                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">

                                    <span className="text-red-600 text-lg">

                                        !

                                    </span>

                                </div>


                                <div>

                                    <h2 className="text-xl font-bold text-gray-800">

                                        Release Bed

                                    </h2>


                                    <p className="text-sm text-gray-500">

                                        Confirm bed release

                                    </p>

                                </div>

                            </div>


                            <p className="text-gray-600">

                                Are you sure you want to release bed{" "}

                                <strong className="text-gray-800">

                                    {selectedBed.bed_number}

                                </strong>

                                ?

                            </p>


                            {selectedBed.patient_name && (

                                <div className="bg-gray-50 rounded-xl p-4 mt-4">

                                    <p className="text-xs uppercase tracking-wide text-gray-500">

                                        Current Patient

                                    </p>


                                    <p className="font-semibold text-gray-800 mt-1">

                                        {selectedBed.patient_name}

                                    </p>

                                </div>

                            )}

                        </div>


                        {/* MODAL FOOTER */}

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">

                            <button

                                onClick={closeModal}

                                disabled={actionLoading}

                                className="px-4 py-2.5 rounded-lg bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition disabled:opacity-50"

                            >

                                Cancel

                            </button>


                            <button

                                onClick={handleReleaseBed}

                                disabled={actionLoading}

                                className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"

                            >

                                {actionLoading
                                    ? "Releasing..."
                                    : "Release Bed"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default BedList;