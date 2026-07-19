// ==========================================================
// LOGIN PAGE
// This is the first screen users will see.
// For now, we're only displaying a heading.
// Later we'll add the login form.
// ==========================================================

// React Hook to store user input
import { useState } from "react";

// Used to call backend APIs
import axios from "axios";

import { useNavigate } from "react-router-dom";

function Login() {

    // ==========================================================
    // FORM STATE
    // Stores the values entered by the user
    // ==========================================================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mpin, setMpin] = useState("");

    // Used to move from one page to another
    const navigate = useNavigate();

    // ==========================================================
    // LOGIN FUNCTION
    // Sends login data to the backend
    // ==========================================================

    const handleLogin = async () => {

        try {

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password,
                    mpin
                }
            );

            console.log(response.data);

            // ==========================================================
            // SAVE JWT TOKEN
            // Store the token in browser localStorage
            // ==========================================================

            localStorage.setItem("token", response.data.token);

            // Redirect user after successful login
            navigate("/dashboard");

            alert("Login Successful!");

        } catch (error) {

            console.error(error);

            alert("Login Failed!");

        }

    };

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center">

            <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">


                <h2 className="text-xl font-semibold text-center mt-6">

                    Welcome Back!

                </h2>

                <p className="text-gray-500 text-center mt-2">

                    Secure Login for Hospital Staff

                </p>

                {/* ==========================================================
                EMAIL INPUT SECTION
                Users will enter their registered email here.
                ========================================================== */}

                <div className="mt-8">

                    {/* Input Label */}
                    <label className="block text-sm font-medium text-gray-700 mb-2">

                        Email Address

                    </label>

                    {/* Email Input */}
                    <input
                        type="email"
                        placeholder="Enter your email"

                        // Current value
                        value={email}

                        // Update value when user types
                        onChange={(e) => setEmail(e.target.value)}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                {/* ==========================================================
                PASSWORD INPUT SECTION
                ========================================================== */}

                <div className="mt-5">

                    {/* Password Label */}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>

                    {/* Password Input */}
                    <input
                        type="password"
                        placeholder="Enter your password"

                        // Current value
                        value={password}

                        // Update password while typing
                        onChange={(e) => setPassword(e.target.value)}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                {/* ==========================================================
                MPIN INPUT SECTION
                ========================================================== */}

                <div className="mt-5">

                    {/* MPIN Label */}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        MPIN
                    </label>

                    {/* MPIN Input */}
                    <input
                        type="password"
                        placeholder="Enter your 4-digit MPIN"

                        // Current value
                        value={mpin}

                        // Update MPIN while typing
                        onChange={(e) => setMpin(e.target.value)}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                {/* ==========================================================
                LOGIN BUTTON
                ========================================================== */}

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg mt-8 hover:bg-blue-700 transition"
                    
                >
                    Login

                </button>

            </div>

        </div>

    );

}

export default Login;