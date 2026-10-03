import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";

function EditBed() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bedData, setBedData] = useState({
    bedNumber: "",
    ward: "",
    bedType: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // FETCH BED DETAILS
  // ==========================================================
  useEffect(() => {
    const fetchBed = async () => {
      try {
        const response = await api.get(`/beds/${id}`);
        const bed = response.data.bed;

        setBedData({
          bedNumber: bed.bed_number || "",
          ward: bed.ward || "",
          bedType: bed.bed_type || "",
          status: bed.status || "",
        });
      } catch (error) {
        console.error("Error fetching bed:", error);
        setError(error.response?.data?.error || "Failed to fetch bed");
      } finally {
        setLoading(false);
      }
    };

    fetchBed();
  }, [id]);

  // ==========================================================
  // HANDLE INPUT CHANGE
  // ==========================================================
  const handleChange = (event) => {
    const { name, value } = event.target;
    setBedData((previousData) => ({
      ...previousData,
      [name]: value,
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

      await api.put(`/beds/${id}`, {
        bedNumber: bedData.bedNumber,
        ward: bedData.ward,
        bedType: bedData.bedType,
        status: bedData.status,
      });

      alert("Bed updated successfully");
      navigate("/beds");
    } catch (error) {
      console.error("Error updating bed:", error);
      setError(error.response?.data?.error || "Failed to update bed");
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-9 w-36 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="border-b border-slate-200/80 pb-5">
            <div className="h-8 w-48 bg-slate-200/80 rounded-lg animate-pulse" />
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Bar: Back to Beds Button */}
        <div className="flex items-center justify-between">
          <Link
            to="/beds"
            className="
              inline-flex items-center gap-2 h-9 px-3.5 rounded-xl
              bg-white border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300
              text-xs font-semibold shadow-xs transition-all duration-150
              active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200
            "
          >
            <svg
              className="h-3.5 w-3.5 text-[#08679F]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Back to Beds
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-200/80 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Edit Bed
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Update bed details, ward assignment, or maintenance status.
          </p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-xs font-medium text-rose-700">
            <div className="flex items-center gap-2.5">
              <svg
                className="h-4 w-4 shrink-0 text-rose-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* FORM CONTAINER */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-5"
        >
          {/* BED NUMBER */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bed Number
            </label>
            <input
              type="text"
              name="bedNumber"
              value={bedData.bedNumber}
              onChange={handleChange}
              required
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 placeholder:text-slate-400"
            />
          </div>

          {/* WARD */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ward
            </label>
            <input
              type="text"
              name="ward"
              value={bedData.ward}
              onChange={handleChange}
              required
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 placeholder:text-slate-400"
            />
          </div>

          {/* BED TYPE */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bed Type
            </label>
            <select
              name="bedType"
              value={bedData.bedType}
              onChange={handleChange}
              required
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
            >
              <option value="">Select Bed Type</option>
              <option value="General">General</option>
              <option value="ICU">ICU</option>
              <option value="Private">Private</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={bedData.status}
              onChange={handleChange}
              disabled={bedData.status === "Occupied"}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              {bedData.status === "Occupied" && (
                <option value="Occupied">Occupied</option>
              )}
            </select>
            {bedData.status === "Occupied" && (
              <p className="text-[11px] text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                <span>⚠️</span> Occupied beds cannot be status-edited directly. Use "Release Bed" from Bed Management.
              </p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={updating}
              className="
                inline-flex items-center justify-center h-10 px-5 rounded-xl
                bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold
                shadow-md shadow-[#08679F]/20 transition-all duration-150
                hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]
                focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:opacity-50
              "
            >
              {updating ? "Updating..." : "Update Bed"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/beds")}
              className="
                inline-flex items-center justify-center h-10 px-5 rounded-xl
                bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold
                transition-all duration-150 active:scale-[0.99]
              "
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBed;