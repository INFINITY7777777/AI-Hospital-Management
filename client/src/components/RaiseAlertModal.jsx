import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Search,
  UserRound,
  X,
  UserPlus,
  Send,
  Info,
  ShieldAlert,
} from "lucide-react";
import api from "../services/api";

const EMPTY_FORM = {
  title: "",
  message: "",
  type: "critical",
};

const RaiseAlertModal = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  onAlertSent,
}) => {
  /*
   * ---------------------------------------------------------
   * INITIAL PATIENT
   * ---------------------------------------------------------
   *
   * patientId/patientName can come from the patient details page.
   * We DO NOT copy them into state using useEffect.
   *
   * This avoids the React "set-state-in-effect" ESLint error.
   */
  const initialPatient = useMemo(() => {
    if (!patientId) return null;

    return {
      id: patientId,
      patient_name: patientName || "Selected Patient",
    };
  }, [patientId, patientName]);

  /*
   * Additional patients selected through the search field.
   */
  const [additionalPatients, setAdditionalPatients] = useState([]);

  /*
   * Search state.
   */
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  /*
   * Alert form.
   */
  const [formData, setFormData] = useState(EMPTY_FORM);

  /*
   * UI state.
   */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchInputRef = useRef(null);

  /*
   * ---------------------------------------------------------
   * SELECTED PATIENTS
   * ---------------------------------------------------------
   *
   * The initial patient is derived from props.
   * Additional patients are stored in state.
   */
  const selectedPatients = useMemo(() => {
    const patients = [];

    if (initialPatient) {
      patients.push(initialPatient);
    }

    additionalPatients.forEach((patient) => {
      if (!patients.some((item) => String(item.id) === String(patient.id))) {
        patients.push(patient);
      }
    });

    return patients;
  }, [initialPatient, additionalPatients]);

  /*
   * ---------------------------------------------------------
   * SEARCH PATIENTS
   * ---------------------------------------------------------
   *
   * We intentionally DO NOT call setState synchronously when
   * the search string is empty inside the effect.
   *
   * Empty results are derived in the render instead.
   */
  useEffect(() => {
    const trimmedSearch = patientSearch.trim();

    if (!isOpen || !trimmedSearch) {
      return undefined;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const res = await api.get(
          `/patients?search=${encodeURIComponent(trimmedSearch)}`,
          {
            signal: controller.signal,
          }
        );

        if (res.data?.patients) {
          setPatientResults(res.data.patients);
        } else if (Array.isArray(res.data)) {
          setPatientResults(res.data);
        } else {
          setPatientResults([]);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Patient search failed:", err);
          setPatientResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [patientSearch, isOpen]);

  /*
   * ---------------------------------------------------------
   * RESET SEARCH WHEN MODAL CLOSES
   * ---------------------------------------------------------
   *
   * This happens from the close event rather than an effect.
   */
  const resetModalState = () => {
    setPatientSearch("");
    setPatientResults([]);
    setAdditionalPatients([]);
    setFormData(EMPTY_FORM);
    setError(null);
    setLoading(false);
  };

  /*
   * ---------------------------------------------------------
   * CLOSE MODAL
   * ---------------------------------------------------------
   */
  const handleClose = () => {
    if (loading) return;

    resetModalState();
    onClose();
  };

  /*
   * ---------------------------------------------------------
   * FORM CHANGE
   * ---------------------------------------------------------
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * ---------------------------------------------------------
   * SEARCH CHANGE
   * ---------------------------------------------------------
   */
  const handlePatientSearchChange = (event) => {
    const value = event.target.value;

    setPatientSearch(value);

    /*
     * This is an event handler, so clearing state here is valid.
     * It also avoids the set-state-in-effect ESLint warning.
     */
    if (!value.trim()) {
      setPatientResults([]);
      setSearchLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * ADD PATIENT
   * ---------------------------------------------------------
   */
  const handleSelectPatient = (patient) => {
    if (!patient?.id) return;

    const alreadySelected = selectedPatients.some(
      (item) => String(item.id) === String(patient.id)
    );

    if (alreadySelected) {
      setPatientSearch("");
      setPatientResults([]);
      return;
    }

    setAdditionalPatients((previous) => [
      ...previous,
      {
        id: patient.id,
        patient_name:
          patient.patient_name ||
          patient.name ||
          patient.full_name ||
          `Patient #${patient.id}`,
      },
    ]);

    setPatientSearch("");
    setPatientResults([]);
    setError(null);
  };

  /*
   * ---------------------------------------------------------
   * REMOVE PATIENT
   * ---------------------------------------------------------
   *
   * If the patient came from patientId, we don't remove it
   * from the prop itself. The user can remove it visually
   * only when it exists in the additional list.
   *
   * For a fully standalone modal, the initial patient remains
   * selected because it was supplied by the parent.
   */
  const handleRemovePatient = (id) => {
    setAdditionalPatients((previous) =>
      previous.filter((patient) => String(patient.id) !== String(id))
    );
  };

  /*
   * ---------------------------------------------------------
   * SUBMIT ALERT
   * ---------------------------------------------------------
   *
   * Existing backend endpoint accepts:
   *
   * POST /notifications
   * {
   *   patientId,
   *   title,
   *   message,
   *   type
   * }
   *
   * Therefore we send one notification request per patient.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);

    if (selectedPatients.length === 0) {
      setError("Please select at least one patient.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Please enter an alert message.");
      return;
    }

    try {
      setLoading(true);

      const defaultTitle =
        formData.type === "critical"
          ? "Critical Patient Alert"
          : formData.type === "warning"
            ? "Patient Warning"
            : "Patient Information";

      /*
       * Send the same alert to every selected patient.
       *
       * Promise.all preserves the current API contract while
       * supporting multiple patient selection.
       */
      await Promise.all(
        selectedPatients.map((patient) =>
          api.post("/notifications", {
            patientId: patient.id,
            title:
              formData.title.trim() ||
              `${defaultTitle} - ${
                patient.patient_name || `Patient #${patient.id}`
              }`,
            message: formData.message.trim(),
            type: formData.type,
          })
        )
      );

      if (onAlertSent) {
        onAlertSent();
      }

      resetModalState();
      onClose();
    } catch (err) {
      console.error("Failed to broadcast patient alert:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to broadcast the patient alert. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  /*
   * ---------------------------------------------------------
   * FILTER SEARCH RESULTS
   * ---------------------------------------------------------
   *
   * Don't show patients that have already been selected.
   */
  const availableResults = patientResults.filter(
    (patient) =>
      !selectedPatients.some(
        (selected) => String(selected.id) === String(patient.id)
      )
  );

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/55 backdrop-blur-md p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="
          relative w-full max-w-2xl
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          border border-white/70
          bg-white/95
          shadow-2xl shadow-slate-900/20
          backdrop-blur-xl
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Raise Patient Alert
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Notify the medical team about an important patient condition.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close alert modal"
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-xl
                text-slate-400
                transition-all duration-200
                hover:bg-slate-100
                hover:text-slate-700
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* ===================================================
              ERROR
          ==================================================== */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

              <p>{error}</p>
            </div>
          )}

          {/* ===================================================
              PATIENT SELECTION
          ==================================================== */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <UserRound className="h-4 w-4" />
                Patients
              </label>

              <span className="text-xs font-medium text-slate-400">
                {selectedPatients.length} selected
              </span>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                ref={searchInputRef}
                type="text"
                value={patientSearch}
                onChange={handlePatientSearchChange}
                placeholder="Search patients by name, ID, or bed number..."
                disabled={loading}
                className="
                  h-12 w-full
                  rounded-2xl
                  border border-slate-200
                  bg-slate-50/70
                  pl-12 pr-4
                  text-sm font-medium text-slate-800
                  outline-none
                  transition-all duration-200
                  placeholder:text-slate-400
                  focus:border-indigo-300
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-500/10
                "
              />

              {searchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
                </div>
              )}
            </div>

            {/* SEARCH RESULTS */}
            {patientSearch.trim() && (
              <div className="relative z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                {searchLoading ? (
                  <div className="px-4 py-5 text-center text-sm text-slate-400">
                    Searching patient records...
                  </div>
                ) : availableResults.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto p-2">
                    {availableResults.map((patient) => {
                      const name =
                        patient.patient_name ||
                        patient.name ||
                        patient.full_name ||
                        `Patient #${patient.id}`;

                      return (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handleSelectPatient(patient)}
                          className="
                            flex w-full items-center gap-3
                            rounded-xl
                            px-3 py-3
                            text-left
                            transition-all duration-150
                            hover:bg-indigo-50
                          "
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <UserRound className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              ID: #{patient.id}
                              {patient.ward
                                ? ` • Ward: ${patient.ward}`
                                : ""}
                              {patient.bed_number
                                ? ` • Bed: ${patient.bed_number}`
                                : ""}
                            </p>
                          </div>

                          <UserPlus className="h-4 w-4 text-indigo-500" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <UserRound className="mx-auto h-6 w-6 text-slate-300" />

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      No matching patients found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try a different patient name or ID.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SELECTED PATIENTS */}
            {selectedPatients.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedPatients.map((patient) => {
                  const name =
                    patient.patient_name ||
                    patient.name ||
                    `Patient #${patient.id}`;

                  const isInitialPatient =
                    initialPatient &&
                    String(initialPatient.id) === String(patient.id);

                  return (
                    <div
                      key={patient.id}
                      className="
                        flex items-center gap-3
                        rounded-2xl
                        border border-indigo-100
                        bg-indigo-50/50
                        px-3 py-3
                      "
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {name}
                        </p>

                        <p className="text-xs text-slate-400">
                          Patient ID: #{patient.id}
                        </p>
                      </div>

                      {isInitialPatient ? (
                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold text-indigo-600">
                          Current
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemovePatient(patient.id)}
                          disabled={loading}
                          className="
                            flex h-8 w-8 items-center justify-center
                            rounded-lg
                            text-slate-400
                            transition
                            hover:bg-red-50
                            hover:text-red-500
                          "
                          aria-label={`Remove ${name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedPatients.length === 0 && !patientSearch && (
              <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-center">
                <UserRound className="mx-auto h-6 w-6 text-slate-300" />

                <p className="mt-2 text-sm font-medium text-slate-500">
                  No patient selected
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Search above to select one or more patients.
                </p>
              </div>
            )}
          </section>

          {/* ===================================================
              ALERT LEVEL
          ==================================================== */}
          <section>
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Alert Level
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* CRITICAL */}
              <button
                type="button"
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    type: "critical",
                  }))
                }
                disabled={loading}
                className={`
                  rounded-2xl border p-4 text-left
                  transition-all duration-200
                  ${
                    formData.type === "critical"
                      ? "border-red-300 bg-red-50 shadow-sm shadow-red-500/10"
                      : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/40"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert
                    className={`h-5 w-5 ${
                      formData.type === "critical"
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  />

                  <span
                    className={`text-sm font-bold ${
                      formData.type === "critical"
                        ? "text-red-600"
                        : "text-slate-600"
                    }`}
                  >
                    Critical
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Urgent response needed
                </p>
              </button>

              {/* WARNING */}
              <button
                type="button"
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    type: "warning",
                  }))
                }
                disabled={loading}
                className={`
                  rounded-2xl border p-4 text-left
                  transition-all duration-200
                  ${
                    formData.type === "warning"
                      ? "border-amber-300 bg-amber-50 shadow-sm shadow-amber-500/10"
                      : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/40"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Info
                    className={`h-5 w-5 ${
                      formData.type === "warning"
                        ? "text-amber-500"
                        : "text-slate-400"
                    }`}
                  />

                  <span
                    className={`text-sm font-bold ${
                      formData.type === "warning"
                        ? "text-amber-600"
                        : "text-slate-600"
                    }`}
                  >
                    Warning
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Clinical priority
                </p>
              </button>

              {/* INFORMATION */}
              <button
                type="button"
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    type: "info",
                  }))
                }
                disabled={loading}
                className={`
                  rounded-2xl border p-4 text-left
                  transition-all duration-200
                  ${
                    formData.type === "info"
                      ? "border-blue-300 bg-blue-50 shadow-sm shadow-blue-500/10"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Info
                    className={`h-5 w-5 ${
                      formData.type === "info"
                        ? "text-blue-500"
                        : "text-slate-400"
                    }`}
                  />

                  <span
                    className={`text-sm font-bold ${
                      formData.type === "info"
                        ? "text-blue-600"
                        : "text-slate-600"
                    }`}
                  >
                    Information
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  General broadcast
                </p>
              </button>
            </div>
          </section>

          {/* ===================================================
              TITLE
          ==================================================== */}
          <section>
            <label
              htmlFor="alert-title"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Alert Title{" "}
              <span className="font-medium normal-case text-slate-400">
                Optional
              </span>
            </label>

            <input
              id="alert-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              placeholder={
                formData.type === "critical"
                  ? "Critical Alert - Patient"
                  : formData.type === "warning"
                    ? "Warning - Patient"
                    : "Information - Patient"
              }
              className="
                h-12 w-full
                rounded-2xl
                border border-slate-200
                bg-white
                px-4
                text-sm font-medium text-slate-800
                outline-none
                transition-all
                placeholder:text-slate-400
                focus:border-indigo-300
                focus:ring-4
                focus:ring-indigo-500/10
              "
            />
          </section>

          {/* ===================================================
              MESSAGE
          ==================================================== */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="alert-message"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Alert Details / Reason{" "}
                <span className="text-red-500">*</span>
              </label>

              <span className="text-xs text-slate-400">Required</span>
            </div>

            <textarea
              id="alert-message"
              name="message"
              rows={5}
              required
              value={formData.message}
              onChange={handleChange}
              disabled={loading}
              placeholder="State patient condition changes, vital drops, or immediate needs..."
              className="
                min-h-32.5 w-full
                resize-y
                rounded-2xl
                border border-slate-200
                bg-white
                px-4 py-3
                text-sm font-medium text-slate-800
                outline-none
                transition-all
                placeholder:text-slate-400
                focus:border-indigo-300
                focus:ring-4
                focus:ring-indigo-500/10
              "
            />

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <Info className="h-3.5 w-3.5" />

              <span>
                Keep the alert concise and include clinically relevant details.
              </span>
            </div>
          </section>

          {/* ===================================================
              FOOTER
          ==================================================== */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="
                h-12 rounded-2xl
                border border-slate-200
                bg-white
                px-6
                text-sm font-semibold text-slate-600
                shadow-sm
                transition-all duration-200
                hover:bg-slate-50
                hover:text-slate-800
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || selectedPatients.length === 0}
              className="
                flex h-12 items-center justify-center gap-2
                rounded-2xl
                bg-red-500
                px-6
                text-sm font-bold text-white
                shadow-lg shadow-red-500/20
                transition-all duration-200
                hover:bg-red-600
                hover:shadow-xl hover:shadow-red-500/25
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:bg-slate-300
                disabled:shadow-none
              "
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Broadcast Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseAlertModal;