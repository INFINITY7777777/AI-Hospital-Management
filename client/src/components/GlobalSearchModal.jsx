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
  ArrowUpRight,
  Loader2,
  Command,
  BedDouble,
} from "lucide-react";

import api from "../services/api";

function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  const navigate = useNavigate();

  /*
   * Close modal and reset search.
   */
  const handleCloseModal = useCallback(() => {
    setQuery("");
    setResults([]);
    setLoading(false);
    onClose();
  }, [onClose]);

  /*
   * Input change.
   *
   * Resetting state here is an event-handler operation,
   * so it does not trigger the React set-state-in-effect warning.
   */
  const handleInputChange = (e) => {
    const value = e.target.value;

    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setLoading(false);
    }
  };

  /*
   * Focus search input when modal opens.
   */
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  /*
   * Keyboard shortcuts:
   * Escape
   * Ctrl + K
   * Cmd + K
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleCloseModal();
        return;
      }

      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleCloseModal();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, handleCloseModal]);

  /*
   * Debounced patient search.
   *
   * IMPORTANT:
   * The API endpoint remains unchanged:
   * GET /patients?search=...
   */
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/patients?search=${encodeURIComponent(trimmedQuery)}`
        );

        if (cancelled) return;

        setResults(
          res.data?.patients ||
            res.data ||
            []
        );
      } catch (err) {
        if (cancelled) return;

        console.error("Search error:", err);
        setResults([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-100
        flex items-start justify-center
        bg-slate-950/45
        backdrop-blur-md
        px-4
        pt-[10vh]
        animate-[fadeIn_180ms_ease-out]
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
    >
      <div
        className="
          w-full max-w-xl
          overflow-hidden
          rounded-3xl
          border border-white/70
          bg-white/95
          backdrop-blur-2xl
          shadow-[0_30px_80px_rgba(15,23,42,0.22)]
          animate-[modalIn_220ms_ease-out]
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="
          flex items-center gap-3
          border-b border-slate-200/80
          px-5 py-4
        ">
          <div className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            bg-indigo-50
            border border-indigo-100
            text-indigo-600
          ">
            <Search className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search patients, ID, or bed number..."
              className="
                w-full
                bg-transparent
                text-sm
                font-semibold
                text-slate-800
                placeholder:text-slate-400
                outline-none
              "
            />

            <p className="mt-0.5 text-[10px] text-slate-400">
              Search hospital patient records
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="
              flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-700
              transition-all duration-200
              active:scale-95
            "
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="
          flex items-center justify-between
          border-b border-slate-100
          bg-slate-50/70
          px-5 py-2
        ">
          <span className="text-[10px] font-medium text-slate-400">
            Global patient search
          </span>

          <div className="flex items-center gap-1">
            <kbd className="
              inline-flex items-center gap-1
              rounded-md
              border border-slate-200
              bg-white
              px-1.5 py-0.5
              text-[10px]
              font-semibold
              text-slate-500
              shadow-sm
            ">
              <Command className="h-2.5 w-2.5" />
              K
            </kbd>

            <span className="text-[10px] text-slate-300">
              to close
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-107.5 overflow-y-auto p-2">
          {/* Initial state */}
          {!query.trim() && (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="
                flex h-14 w-14
                items-center justify-center
                rounded-2xl
                bg-slate-100
                text-slate-400
              ">
                <Search className="h-6 w-6" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Search patient records
              </p>

              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                Enter a patient name, ID, or bed number to find their
                medical record.
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 px-4 py-5">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Searching records...
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Looking through patient records
                </p>
              </div>
            </div>
          )}

          {/* No results */}
          {!loading &&
            query.trim() &&
            results.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="
                  flex h-12 w-12
                  items-center justify-center
                  rounded-2xl
                  bg-slate-100
                  text-slate-400
                ">
                  <UserRound className="h-5 w-5" />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No patient records found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try a different name, patient ID, or bed number.
                </p>
              </div>
            )}

          {/* Results */}
          {!loading &&
            results.map((patient) => {
              const name =
                patient.patient_name ||
                patient.name ||
                patient.full_name ||
                "Unknown Patient";

              const ward =
                patient.ward ||
                patient.ward_name ||
                "Unassigned";

              return (
                <button
                  type="button"
                  key={patient.id}
                  onClick={() => {
                    navigate(`/patients/${patient.id}`);
                    handleCloseModal();
                  }}
                  className="
                    group
                    flex w-full
                    items-center gap-3
                    rounded-2xl
                    p-3
                    text-left
                    transition-all duration-200
                    hover:bg-indigo-50/70
                    hover:-translate-y-0.5
                  "
                >
                  {/* Avatar */}
                  <div className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-indigo-50
                    border border-indigo-100
                    text-indigo-600
                    transition-all duration-200
                    group-hover:bg-indigo-100
                  ">
                    <UserRound className="h-5 w-5" />
                  </div>

                  {/* Patient information */}
                  <div className="min-w-0 flex-1">
                    <p className="
                      truncate
                      text-sm
                      font-bold
                      text-slate-800
                      group-hover:text-indigo-700
                    ">
                      {name}
                    </p>

                    <div className="
                      mt-1
                      flex flex-wrap
                      items-center gap-x-3 gap-y-1
                    ">
                      <span className="
                        text-[10px]
                        font-semibold
                        text-slate-400
                      ">
                        ID #{patient.id}
                      </span>

                      <span className="
                        inline-flex
                        items-center gap-1
                        text-[10px]
                        font-medium
                        text-slate-400
                      ">
                        <BedDouble className="h-3 w-3" />
                        {ward}
                      </span>
                    </div>
                  </div>

                  {/* Open record */}
                  <div className="
                    flex h-8 w-8 shrink-0
                    items-center justify-center
                    rounded-lg
                    bg-white
                    border border-slate-200
                    text-slate-400
                    transition-all duration-200
                    group-hover:border-indigo-200
                    group-hover:bg-indigo-100
                    group-hover:text-indigo-600
                  ">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;