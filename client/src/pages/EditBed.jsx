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
// EDIT BED COMPONENT
// ==========================================================

function EditBed() {


    // ==========================================================
    // GET BED ID FROM URL
    // Example:
    // /beds/edit/2
    // id = 2
    // ==========================================================

    const { id } = useParams();


    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // BED DATA
    // ==========================================================

    const [bedData, setBedData] = useState({

        bedNumber: "",

        ward: "",

        bedType: "",

        status: ""

    });


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // UPDATE LOADING STATE
    // ==========================================================

    const [updating, setUpdating] = useState(false);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // FETCH BED DETAILS
    // ==========================================================

    useEffect(() => {


        const fetchBed = async () => {

            try {

                const response = await axios.get(

                    `http://localhost:5000/api/beds/${id}`

                );


                const bed = response.data.bed;


                // ==========================================================
                // STORE BED DATA IN FORM
                // ==========================================================

                setBedData({

                    bedNumber:
                        bed.bed_number || "",

                    ward:
                        bed.ward || "",

                    bedType:
                        bed.bed_type || "",

                    status:
                        bed.status || ""

                });

            }


            catch (error) {

                console.error(

                    "Error fetching bed:",

                    error

                );


                setError(

                    error.response?.data?.error ||

                    "Failed to fetch bed"

                );

            }


            finally {

                setLoading(false);

            }

        };


        fetchBed();


    }, [id]);


    // ==========================================================
    // HANDLE INPUT CHANGE
    // ==========================================================

    const handleChange = (event) => {

        const {

            name,

            value

        } = event.target;


        setBedData((previousData) => ({

            ...previousData,

            [name]: value

        }));

    };


    // ==========================================================
    // HANDLE FORM SUBMIT
    // ==========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        try {

            setUpdating(true);

            setError("");


            // ==========================================================
            // UPDATE BED
            // ==========================================================

            await axios.put(

                `http://localhost:5000/api/beds/${id}`,

                {

                    bedNumber:
                        bedData.bedNumber,

                    ward:
                        bedData.ward,

                    bedType:
                        bedData.bedType,

                    status:
                        bedData.status

                }

            );


            // ==========================================================
            // SUCCESS MESSAGE
            // ==========================================================

            alert(

                "Bed updated successfully"

            );


            // ==========================================================
            // RETURN TO BED LIST
            // ==========================================================

            navigate("/beds");

        }


        catch (error) {

            console.error(

                "Error updating bed:",

                error

            );


            setError(

                error.response?.data?.error ||

                "Failed to update bed"

            );

        }


        finally {

            setUpdating(false);

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

                            Loading bed...

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


                    <div className="max-w-2xl mx-auto">


                        {/* ==========================================================
                            PAGE TITLE
                        ========================================================== */}

                        <h1 className="text-3xl font-bold mb-6">

                            Edit Bed

                        </h1>


                        {/* ==========================================================
                            ERROR MESSAGE
                        ========================================================== */}

                        {error && (

                            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">

                                {error}

                            </div>

                        )}


                        {/* ==========================================================
                            FORM
                        ========================================================== */}

                        <form

                            onSubmit={handleSubmit}

                            className="bg-white rounded-xl shadow p-6 space-y-6"

                        >


                            {/* ==========================================================
                                BED NUMBER
                            ========================================================== */}

                            <div>

                                <label className="block font-medium mb-2">

                                    Bed Number

                                </label>


                                <input

                                    type="text"

                                    name="bedNumber"

                                    value={bedData.bedNumber}

                                    onChange={handleChange}

                                    required

                                    className="w-full border rounded-lg p-3"

                                />

                            </div>


                            {/* ==========================================================
                                WARD
                            ========================================================== */}

                            <div>

                                <label className="block font-medium mb-2">

                                    Ward

                                </label>


                                <input

                                    type="text"

                                    name="ward"

                                    value={bedData.ward}

                                    onChange={handleChange}

                                    required

                                    className="w-full border rounded-lg p-3"

                                />

                            </div>


                            {/* ==========================================================
                                BED TYPE
                            ========================================================== */}

                            <div>

                                <label className="block font-medium mb-2">

                                    Bed Type

                                </label>


                                <select

                                    name="bedType"

                                    value={bedData.bedType}

                                    onChange={handleChange}

                                    required

                                    className="w-full border rounded-lg p-3"

                                >

                                    <option value="">

                                        Select Bed Type

                                    </option>


                                    <option value="General">

                                        General

                                    </option>


                                    <option value="ICU">

                                        ICU

                                    </option>


                                    <option value="Private">

                                        Private

                                    </option>


                                    <option value="Emergency">

                                        Emergency

                                    </option>

                                </select>

                            </div>


                            {/* ==========================================================
                                STATUS
                            ========================================================== */}

                            <div>

                                <label className="block font-medium mb-2">

                                    Status

                                </label>


                                <select

                                    name="status"

                                    value={bedData.status}

                                    onChange={handleChange}

                                    className="w-full border rounded-lg p-3"

                                >

                                    <option value="Available">

                                        Available

                                    </option>


                                    <option value="Maintenance">

                                        Maintenance

                                    </option>


                                    <option value="Occupied">

                                        Occupied

                                    </option>

                                </select>

                            </div>


                            {/* ==========================================================
                                BUTTONS
                            ========================================================== */}

                            <div className="flex gap-4">


                                {/* ==========================================================
                                    UPDATE BUTTON
                                ========================================================== */}

                                <button

                                    type="submit"

                                    disabled={updating}

                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"

                                >

                                    {updating

                                        ? "Updating..."

                                        : "Update Bed"

                                    }

                                </button>


                                {/* ==========================================================
                                    CANCEL BUTTON
                                ========================================================== */}

                                <button

                                    type="button"

                                    onClick={() =>

                                        navigate("/beds")

                                    }

                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"

                                >

                                    Cancel

                                </button>


                            </div>


                        </form>


                    </div>

                </div>

            </div>

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default EditBed;