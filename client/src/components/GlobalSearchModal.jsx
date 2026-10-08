import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  UserRound,
  Stethoscope,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  Command,
} from "lucide-react";
import api from "../services/api";

function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'patients' | 'doctors' | 'staff'
  const [results, setResults] = useState({ patients: [], doctors: [], staff: [] });
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleCloseModal = useCallback(() => {
    setQuery("");
    setResults({ patients: [], doctors: [], staff: [] });
    setLoading(false);
    setActiveTab("all");
    onClose();
  }, [onClose]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) {
      setResults({ patients: [], doctors: [], staff: [] });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        handleCloseModal();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleCloseModal();
      }
    };

    if (isOpen) window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, handleCloseModal]);

  // Debounced Unified Search Request
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        // Fetch from unified backend endpoint
        const res = await api.get(`/search?q=${encodeURIComponent(trimmedQuery)}`);

        if (cancelled) return;

        setResults({
          patients: res.data?.patients || [],
          doctors: res.data?.doctors || [],
          staff: res.data?.staff || [],
        });
      } catch (err) {
        if (cancelled) return;
        console.error("Search error:", err);
        setResults({ patients: [], doctors: [], staff: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.patients.length + results.doctors.length + results.staff.length;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-slate-950/45 px-4 pt-[10vh] backdrop-blur-md animate-[fadeIn_180ms_ease-out]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white/95 backdrop-blur-2xl shadow-[0_30px_80px_rgba(15,23,42,0.22)] animate-[modalIn_220ms_ease-out]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-slate-200/80 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-[#08679f]">
            <Search className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search patients, doctors, or staff members..."
              className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none"
            />
            <p className="mt-0.5 text-[10px] text-slate-400">
              Hospital directory search
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Category Tabs */}
        {query.trim() && (
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-white text-[#08679f] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "patients"
                  ? "bg-white text-[#08679f] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Patients ({results.patients.length})
            </button>
            <button
              onClick={() => setActiveTab("doctors")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "doctors"
                  ? "bg-white text-[#08679f] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Doctors ({results.doctors.length})
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "staff"
                  ? "bg-white text-[#08679f] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Staff ({results.staff.length})
            </button>
          </div>
        )}

        {/* Keyboard hint */}
        {!query.trim() && (
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-2">
            <span className="text-[10px] font-medium text-slate-400">
              Global directory search
            </span>
            <kbd className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-xs">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </div>
        )}

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {!query.trim() && (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Search hospital records
              </p>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                Type a name, specialization, phone number, or role to search across patients, doctors, and staff.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 px-4 py-5">
              <Loader2 className="h-4 w-4 animate-spin text-[#08679f]" />
              <p className="text-xs font-semibold text-slate-700">
                Searching directory...
              </p>
            </div>
          )}

          {!loading && query.trim() && totalResults === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">No records found</p>
              <p className="mt-1 text-xs text-slate-400">Try searching with a different term.</p>
            </div>
          )}

          {/* RENDER PATIENTS */}
          {!loading && (activeTab === "all" || activeTab === "patients") &&
            results.patients.map((item) => (
              <button
                type="button"
                key={`p-${item.id}`}
                onClick={() => {
                  navigate(`/patients/${item.id}`);
                  handleCloseModal();
                }}
                className="group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-sky-50/70"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-[#08679f]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-800 group-hover:text-[#08679f]">
                      {item.name}
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-[#08679f]">
                      Patient
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Ward: {item.ward || "Unassigned"} • Bed: {item.bed_number || "—"}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#08679f]" />
              </button>
            ))}

          {/* RENDER DOCTORS */}
          {!loading && (activeTab === "all" || activeTab === "doctors") &&
            results.doctors.map((item) => (
              <button
                type="button"
                key={`d-${item.id}`}
                onClick={() => {
                  navigate(`/doctors`);
                  handleCloseModal();
                }}
                className="group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-emerald-50/70"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-800 group-hover:text-emerald-700">
                      Dr. {item.name}
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
                      Doctor
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {item.specialization || "General Medicine"} • {item.department || "Clinical"}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700" />
              </button>
            ))}

          {/* RENDER STAFF */}
          {!loading && (activeTab === "all" || activeTab === "staff") &&
            results.staff.map((item) => (
              <button
                type="button"
                key={`s-${item.id}`}
                onClick={() => {
                  navigate(`/users`);
                  handleCloseModal();
                }}
                className="group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-purple-50/70"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-800 group-hover:text-purple-700">
                      {item.name}
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-700 uppercase">
                      {item.role || "Staff"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {item.email}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-700" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;