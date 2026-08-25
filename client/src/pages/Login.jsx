import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mpin, setMpin] = useState("");
  const [usePassword, setUsePassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const payload = { email };
      if (usePassword) {
        payload.password = password;
      } else {
        payload.mpin = mpin;
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        payload
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login Failed!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mt-2">Welcome Back!</h2>
        <p className="text-gray-500 text-center text-xs mt-1">
          Hospital Staff Login
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!usePassword ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  4-Digit Security MPIN
                </label>
                <button
                  type="button"
                  onClick={() => setUsePassword(true)}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Forgot MPIN?
                </button>
              </div>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="Enter MPIN"
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Account Password
                </label>
                <button
                  type="button"
                  onClick={() => setUsePassword(false)}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Use MPIN instead
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;