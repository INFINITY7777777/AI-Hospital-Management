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

import {
    useNavigate,
    useParams
} from "react-router-dom";


// ==========================================================
// NAVBAR
// ==========================================================

import Navbar from "../components/Navbar";


// ==========================================================
// SIDEBAR
// ==========================================================

import Sidebar from "../components/Sidebar";


// ==========================================================
// BED DETAILS COMPONENT
// ==========================================================

function BedDetails() {


    // ==========================================================
    // GET BED ID FROM URL
    // Example:
    // /beds/2
    // ==========================================================

    const { id } = useParams();


    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // BED STATE
    // ==========================================================

    const [bed, setBed] = useState(null);


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // ACTION LOADING
    // ==========================================================

    const [releasing, setReleasing] = useState(false);


    // ==========================================================
    // FETCH BED DETAILS
    // ==========================================================

    useEffect(() => {

        const fetchBed = async () => {

            try {

                setLoading(true);

                setError("");


                // ==========================================================
                // GET BED BY ID
                // ==========================================================

                const response = await axios.get(

                    `http://localhost:5000/api/beds/${id}`

                );


                // ==========================================================
                // STORE BED DATA
                // ==========================================================

                setBed(

                    response.data.bed

                );

            }

            catch (error) {

                console.error(

                    "Error fetching bed details:",

                    error

                );


                setError(

                    error.response?.data?.error ||

                    "Failed to fetch bed details"

                );

            }

            finally {

                setLoading(false);

            }

        };


        fetchBed();

    }, [id]);


    // ==========================================================
    // RELEASE BED
    // ==========================================================

    const handleReleaseBed = async () => {


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

            setReleasing(true);


            // ==========================================================
            // RELEASE BED API
            // ==========================================================

            await axios.put(

                `http://localhost:5000/api/beds/${id}/release`

            );


            // ==========================================================
            // SUCCESS MESSAGE
            // ==========================================================

            alert(

                "Bed released successfully"

            );


            // ==========================================================
            // REFRESH BED DETAILS
            // ==========================================================

            const response = await axios.get(

                `http://localhost:5000/api/beds/${id}`

            );


            setBed(

                response.data.bed

            );

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

            setReleasing(false);

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

                            Loading bed details...

                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // ERROR SCREEN
    // ==========================================================

    if (error) {

        return (

            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex">

                    <Sidebar />

                    <div className="flex-1 p-8">

                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">

                            {error}

                        </div>


                        <button

                            onClick={() =>

                                navigate("/beds")

                            }

                            className="bg-gray-600 text-white px-5 py-3 rounded-lg hover:bg-gray-700"

                        >

                            Back to Beds

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // BED NOT FOUND
    // ==========================================================

    if (!bed) {

        return (

            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex">

                    <Sidebar />

                    <div className="flex-1 p-8">

                        <p className="text-gray-500">

                            Bed not found.

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
                        PAGE HEADER
                    ========================================================== */}

                    <div className="flex justify-between items-center mb-6">


                        <h1 className="text-3xl font-bold">

                            Bed Details

                        </h1>


                        <button

                            onClick={() =>

                                navigate("/beds")

                            }

                            className="bg-gray-600 text-white px-5 py-3 rounded-lg hover:bg-gray-700"

                        >

                            Back to Beds

                        </button>

                    </div>


                    {/* ==========================================================
                        BED INFORMATION
                    ========================================================== */}

                    <div className="bg-white rounded-xl shadow p-6 mb-6">


                        <h2 className="text-xl font-bold mb-6">

                            Bed Information

                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                            {/* ==========================================================
                                BED NUMBER
                            ========================================================== */}

                            <div>

                                <p className="text-gray-500">

                                    Bed Number

                                </p>

                                <p className="text-lg font-semibold">

                                    {bed.bed_number}

                                </p>

                            </div>


                            {/* ==========================================================
                                WARD
                            ========================================================== */}

                            <div>

                                <p className="text-gray-500">

                                    Ward

                                </p>

                                <p className="text-lg font-semibold">

                                    {bed.ward}

                                </p>

                            </div>


                            {/* ==========================================================
                                BED TYPE
                            ========================================================== */}

                            <div>

                                <p className="text-gray-500">

                                    Bed Type

                                </p>

                                <p className="text-lg font-semibold">

                                    {bed.bed_type}

                                </p>

                            </div>


                            {/* ==========================================================
                                STATUS
                            ========================================================== */}

                            <div>

                                <p className="text-gray-500">

                                    Status

                                </p>

                                <p className="text-lg font-semibold">

                                    {bed.status}

                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ==========================================================
                        CURRENT PATIENT
                    ========================================================== */}

                    <div className="bg-white rounded-xl shadow p-6 mb-6">


                        <h2 className="text-xl font-bold mb-6">

                            Current Patient

                        </h2>


                        {bed.patient_id ? (

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                {/* ==========================================================
                                    PATIENT NAME
                                ========================================================== */}

                                <div>

                                    <p className="text-gray-500">

                                        Patient Name

                                    </p>

                                    <p className="text-lg font-semibold">

                                        {bed.patient_name || "—"}

                                    </p>

                                </div>


                                {/* ==========================================================
                                    PATIENT ID
                                ========================================================== */}

                                <div>

                                    <p className="text-gray-500">

                                        Patient ID

                                    </p>

                                    <p className="text-lg font-semibold">

                                        {bed.patient_id}

                                    </p>

                                </div>


                                {/* ==========================================================
                                    PATIENT PHONE
                                ========================================================== */}

                                <div>

                                    <p className="text-gray-500">

                                        Phone

                                    </p>

                                    <p className="text-lg font-semibold">

                                        {bed.patient_phone || "—"}

                                    </p>

                                </div>


                                {/* ==========================================================
                                    PATIENT AGE
                                ========================================================== */}

                                <div>

                                    <p className="text-gray-500">

                                        Age

                                    </p>

                                    <p className="text-lg font-semibold">

                                        {bed.patient_age || "—"}

                                    </p>

                                </div>


                                {/* ==========================================================
                                    PATIENT GENDER
                                ========================================================== */}

                                <div>

                                    <p className="text-gray-500">

                                        Gender

                                    </p>

                                    <p className="text-lg font-semibold">

                                        {bed.patient_gender || "—"}

                                    </p>

                                </div>


                            </div>

                        ) : (

                            <p className="text-gray-500">

                                No patient is currently assigned to this bed.

                            </p>

                        )}

                    </div>


                    {/* ==========================================================
                        ACTIONS
                    ========================================================== */}

                    <div className="flex gap-4">


                        {/* ==========================================================
                            EDIT BED
                        ========================================================== */}

                        <button

                            onClick={() =>

                                navigate(

                                    `/beds/edit/${bed.id}`

                                )

                            }

                            className="bg-yellow-500 text-white px-5 py-3 rounded-lg hover:bg-yellow-600"

                        >

                            Edit Bed

                        </button>


                        {/* ==========================================================
                            RELEASE BED
                        ========================================================== */}

                        {bed.status === "Occupied" && (

                            <button

                                onClick={handleReleaseBed}

                                disabled={releasing}

                                className="bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"

                            >

                                {releasing

                                    ? "Releasing..."

                                    : "Release Bed"

                                }

                            </button>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default BedDetails;