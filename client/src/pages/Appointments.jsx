import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AppointmentList from "../components/AppointmentList";
import AddAppointmentForm from "../components/AddAppointmentForm";

function Appointments() {
  // Trigger state to notify child component to refetch appointments on updates
  const [refreshAppointments, setRefreshAppointments] = useState(0);

  // Controls modal visibility for booking new appointments
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Active filter tab: 'all', 'today', or 'upcoming'
  const [activeFilter, setActiveFilter] = useState("all");

  // Global search input query string
  const [searchTerm, setSearchTerm] = useState("");

  // Handler passed to form to increment trigger and close modal after creation
  const handleAppointmentCreated = () => {
    setRefreshAppointments((prev) => prev + 1);
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Viewport Column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Navbar */}
        <Navbar />

        {/* Scrollable Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Header Card & Primary Action */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Appointment Management
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Schedule, view, and manage patient appointments and clinical visits
              </p>
            </div>

            {/* Book Appointment CTA Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>+</span> Book Appointment
            </button>
          </div>

          {/* Controls Bar: Filter Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            {/* Filter Segmented Control Tabs */}
            <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto pb-1 md:pb-0">
              {[
                { id: "all", label: "All Appointments" },
                { id: "today", label: "Today's Schedule" },
                { id: "upcoming", label: "Upcoming Visits" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                    activeFilter === tab.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100 bg-white border border-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input Box with Explicit Padding to Prevent Glass Overlap */}
            <div className="relative w-full md:w-80 flex items-center">
              {/* Search Icon Element */}
              <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400 text-xs z-10">
                🔍
              </div>

              {/* Text Field with explicit inline padding for predictable layout */}
              <input
                type="text"
                placeholder="Search patient, doctor, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-xs bg-white"
                style={{
                  paddingLeft: "2.5rem",
                  paddingRight: "2rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                }}
              />

              {/* Clear Search Button */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600 text-xs z-10"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Main Content Card Container */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <AppointmentList
              filter={activeFilter}
              searchTerm={searchTerm}
              refreshAppointments={refreshAppointments}
            />
          </div>
        </main>
      </div>

      {/* Modal Dialog overlay for booking appointments */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                Book New Appointment
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <AddAppointmentForm
              refreshAppointments={handleAppointmentCreated}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;