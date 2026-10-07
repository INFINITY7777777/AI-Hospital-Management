
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddAdmissionForm() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);

  const [formData, setFormData] = useState({
    patientId: "",
    bedId: "",
    admissionDate: "",
    admissionReason: "",
    diagnosis: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [patientsResponse, bedsResponse] =
          await Promise.all([
            api.get("/patients"),
            api.get("/beds"),
          ]);

        const patientResponseData = patientsResponse.data;
        const bedResponseData = bedsResponse.data;

        const patientsData = Array.isArray(patientResponseData)
          ? patientResponseData
          : Array.isArray(patientResponseData?.patients)
            ? patientResponseData.patients
            : Array.isArray(patientResponseData?.data)
              ? patientResponseData.data
              : [];

        const bedsData = Array.isArray(bedResponseData)
          ? bedResponseData
          : Array.isArray(bedResponseData?.beds)
            ? bedResponseData.beds
            : Array.isArray(bedResponseData?.data)
              ? bedResponseData.data
              : [];

        if (cancelled) return;

        setPatients(patientsData);

        setBeds(
          bedsData.filter(
            (bed) =>
              String(bed.status || "").toLowerCase() ===
                "available" &&
              !bed.patient_id &&
              !bed.patientId
          )
        );
      } catch (err) {
        console.error("Error loading admission data:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Unable to load patients and available beds. Please refresh and try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const getPatientName = (patient) =>
    patient.patient_name ||
    patient.full_name ||
    patient.name ||
    "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.patientId) {
      setError("Please select a patient.");
      return;
    }

    if (!formData.admissionDate) {
      setError("Please select an admission date.");
      return;
    }

    const selectedPatient = patients.find(
      (patient) =>
        String(patient.id) === String(formData.patientId)
    );

    if (!selectedPatient) {
      setError(
        "The selected patient could not be found. Please refresh the page."
      );
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/admissions", {
        patientId: Number(formData.patientId),
        bedId: formData.bedId
          ? Number(formData.bedId)
          : null,
        admissionDate: formData.admissionDate,
        admissionReason: formData.admissionReason.trim(),
        diagnosis: formData.diagnosis.trim(),
      });

      alert("Admission created successfully.");
      navigate("/admissions");
    } catch (err) {
      console.error("Error creating admission:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to create admission. Please check the selected patient and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10";

  const labelClass =
    "mb-1.5 block text-xs font-semibold text-slate-700";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F8FC] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />

          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-9 w-52 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
              </div>

              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F8FC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admissions")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            <svg
              className="h-4 w-4 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Admissions
          </button>
        </div>

        <div className="border-b border-slate-200/70 pb-5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#08679F]">
            PATIENT CARE
          </span>

          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Add Admission
          </h1>

          <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-500 sm:text-sm">
            Create a new patient admission and optionally assign
            an available hospital bed.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700"
          >
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-rose-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>

            <div>
              <p className="font-semibold">
                Unable to continue
              </p>
              <p className="mt-0.5 text-xs text-rose-600">
                {error}
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7 lg:p-8"
        >
          <section>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#08679F]/10 text-[#08679F]">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Patient Information
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select the patient being admitted.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="patientId" className={labelClass}>
                  Patient <span className="text-rose-500">*</span>
                </label>

                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">Select patient</option>

                  {patients.map((patient) => {
                    const patientName = getPatientName(patient);

                    return (
                      <option
                        key={patient.id}
                        value={patient.id}
                        disabled={!patient.id || !patientName}
                      >
                        {patientName
                          ? `${patientName} (ID: ${patient.id})`
                          : `Patient ID: ${patient.id}`}
                      </option>
                    );
                  })}
                </select>

                {patients.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No patients were returned by the patient API.
                    Check the API response and create a patient first
                    if necessary.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="admissionDate"
                  className={labelClass}
                >
                  Admission Date{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <input
                  id="admissionDate"
                  name="admissionDate"
                  type="date"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <div className="my-8 border-t border-slate-200" />

          <section>
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Admission Information
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Provide the basic details for this admission.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="admissionReason"
                  className={labelClass}
                >
                  Admission Reason
                </label>

                <input
                  id="admissionReason"
                  name="admissionReason"
                  type="text"
                  value={formData.admissionReason}
                  onChange={handleChange}
                  placeholder="e.g. HMS workflow test"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="diagnosis" className={labelClass}>
                  Diagnosis
                </label>

                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter test details only; do not use real patient data for testing."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                />
              </div>
            </div>
          </section>

          <div className="my-8 border-t border-slate-200" />

          <section>
            <div className="mb-5">
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Ward / Bed
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                You can leave the bed unassigned and assign it later.
              </p>
            </div>

            <div>
              <label htmlFor="bedId" className={labelClass}>
                Available Bed
              </label>

              <select
                id="bedId"
                name="bedId"
                value={formData.bedId}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">No bed assigned</option>

                {beds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bed_number ||
                      bed.bedNumber ||
                      `Bed ${bed.id}`}
                    {bed.ward
                      ? ` — ${bed.ward}`
                      : bed.ward_name || bed.wardName
                        ? ` — ${bed.ward_name || bed.wardName}`
                        : ""}
                  </option>
                ))}
              </select>

              {beds.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No available beds were returned. You can create
                  the admission without a bed and assign one later.
                </p>
              )}
            </div>
          </section>

          <div className="my-8 border-t border-slate-200" />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admissions")}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || patients.length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#08679F] px-5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#07557F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Admission"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddAdmissionForm;

