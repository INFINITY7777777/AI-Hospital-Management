import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function GlobalSearchModal({ isOpen, onClose }) {
  // State for search query input string
  const [query, setQuery] = useState("");
  // State for search results array returned from API
  const [results, setResults] = useState([]);
  // Loading indicator for async API calls
  const [loading, setLoading] = useState(false);

  // Ref to directly access search input DOM node for focusing
  const inputRef = useRef(null);
  // Navigation hook for routing to patient detail pages
  const navigate = useNavigate();

  // Helper function to safely close the modal and reset search state cleanly
  // Wrapped in useCallback to preserve function reference and satisfy ESLint dependency checks
  const handleCloseModal = useCallback(() => {
    setQuery("");
    setResults([]);
    onClose();
  }, [onClose]);

  // Helper function to handle input change and reset results asynchronously when empty
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
    }
  };

  // 1. FOCUS EFFECT: Automatically focus the input field when the modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 2. SHORTCUT LISTENER: Listens for Escape (close) and Ctrl+K / Cmd+K (toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      // Close modal when Escape key is pressed
      if (e.key === "Escape" || e.code === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleCloseModal();
      }

      // Toggle/close modal when Ctrl+K or Cmd+K is pressed
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleCloseModal();
      }
    };

    if (isOpen) {
      // Use true for capture phase to intercept keys before input element traps them
      window.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, handleCloseModal]);

  // 3. DEBOUNCED API SEARCH EFFECT: Debounces search input requests by 300ms
  useEffect(() => {
    // Skip API request if query is empty
    if (!query.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/patients?search=${encodeURIComponent(query)}`);
        setResults(res.data.patients || res.data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    // BACKDROP: Overlay covering screen, clicking backdrop closes modal
    <div
      onClick={handleCloseModal}
      className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
    >
      {/* MODAL CARD: Prevents backdrop click propagation when clicking inside */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* INPUT HEADER */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <span className="text-gray-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search patients by name, ID, or bed number..."
            className="w-full text-sm font-medium focus:outline-none"
          />
          {/* ESC KEY CLOSE BUTTON */}
          <button
            onClick={handleCloseModal}
            className="text-xs bg-gray-100 text-gray-500 hover:bg-gray-200 px-2 py-1 rounded transition"
          >
            ESC
          </button>
        </div>

        {/* RESULTS BODY */}
        <div className="max-h-80 overflow-y-auto p-2">
          {/* Loading Indicator */}
          {loading && (
            <p className="p-4 text-xs text-gray-400 animate-pulse">Searching records...</p>
          )}

          {/* Empty Search Result Message */}
          {!loading && results.length === 0 && query && (
            <p className="p-4 text-xs text-gray-400">No matching patient records found.</p>
          )}

          {/* Mapped Patient Search Results */}
          {results.map((patient) => (
            <div
              key={patient.id}
              onClick={() => {
                navigate(`/patients/${patient.id}`);
                handleCloseModal();
              }}
              className="p-3 hover:bg-blue-50 rounded-xl cursor-pointer flex justify-between items-center transition"
            >
              <div>
                <p className="text-sm font-bold text-gray-900">{patient.patient_name || patient.name}</p>
                <p className="text-xs text-gray-500">
                  ID: #{patient.id} • Ward: {patient.ward || "Unassigned"}
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600">View Record →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;