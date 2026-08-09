// ==========================================================
// REACT HOOKS
// ==========================================================

import { useState } from "react";


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
// ADD BED FORM
// ==========================================================

function AddBedForm() {


    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // FORM DATA
    // ==========================================================

    const [bedData, setBedData] = useState({

        bedNumber: "",

        ward: "",

        bedType: "",

        status: "Available"

    });


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(false);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


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


        // ==========================================================
        // CLEAR PREVIOUS ERROR
        // ==========================================================

        setError("");


        try {

            // ==========================================================
            // START LOADING
            // ==========================================================

            setLoading(true);


            // ==========================================================
            // SEND POST REQUEST
            // ==========================================================

            await axios.post(

                "http://localhost:5000/api/beds",

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

                "Bed added successfully"

            );


            // ==========================================================
            // GO BACK TO BED LIST
            // ==========================================================

            navigate("/beds");

        }


        catch (error) {

            console.error(

                "Error adding bed:",

                error

            );


            setError(

                error.response?.data?.error ||

                "Failed to add bed"

            );

        }


        finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // RENDER
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

                            Add New Bed

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

                                    placeholder="Example: B-101"

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

                                    placeholder="Example: General Ward"

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

                                </select>

                            </div>


                            {/* ==========================================================
                                BUTTONS
                            ========================================================== */}

                            <div className="flex gap-4">


                                {/* ==========================================================
                                    ADD BED BUTTON
                                ========================================================== */}

                                <button

                                    type="submit"

                                    disabled={loading}

                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"

                                >

                                    {loading

                                        ? "Adding..."

                                        : "Add Bed"

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

export default AddBedForm;