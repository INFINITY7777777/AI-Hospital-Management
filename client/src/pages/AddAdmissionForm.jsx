import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

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
    const loadData = async () => {
        try {
        setLoading(true);
        setError("");

        const [patientsResponse, bedsResponse] = await Promise.all([
            api.get("/patients"),
            api.get("/beds"),
        ]);

        // Handle different API response formats safely
        const patientsData = Array.isArray(patientsResponse.data)
            ? patientsResponse.data
            : patientsResponse.data?.patients ||
            patientsResponse.data?.data ||
            [];

        const bedsData = Array.isArray(bedsResponse.data)
            ? bedsResponse.data
            : bedsResponse.data?.beds ||
            bedsResponse.data?.data ||
            [];

        setPatients(patientsData);

        const availableBeds = bedsData.filter(
            (bed) => bed.status === "Available"
        );

        setBeds(availableBeds);
        } catch (err) {
        console.error("Error loading admission data:", err);

        setError(
            err.response?.data?.message ||
            "Unable to load patients and available beds."
        );
        } finally {
        setLoading(false);
        }
    };

    loadData();
    }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.patientId) {
      alert("Please select a patient.");
      return;
    }

    if (!formData.admissionDate) {
      alert("Please select an admission date.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/admissions", {
        patientId: Number(formData.patientId),
        bedId: formData.bedId ? Number(formData.bedId) : null,
        admissionDate: formData.admissionDate,
        admissionReason: formData.admissionReason,
        diagnosis: formData.diagnosis,
      });

      alert("Admission created successfully.");

      navigate("/admissions");
    } catch (err) {
      console.error("Error creating admission:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create admission. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `
    w-full
    h-11
    px-3.5
    rounded-xl
    border
    border-slate-300
    bg-white
    text-sm
    text-slate-800
    placeholder:text-slate-400
    outline-none
    transition-all
    duration-150
    focus:border-[#08679F]
    focus:ring-4
    focus:ring-[#08679F]/10
  `;

  const labelClass = `
    mb-1.5
    block
    text-xs
    font-semibold
    text-slate-700
  `;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F8FC] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-200" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-9 w-52 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          {/* Form Skeleton */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="space-y-8">
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

              <div className="space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
              </div>

              <div className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
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
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => navigate("/admissions")}
            className="
              inline-flex
              h-10
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3.5
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              transition-all
              duration-150
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-900
              active:scale-[0.99]
              focus:outline-none
              focus:ring-4
              focus:ring-slate-200
            "
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

        {/* Page Header */}
        <div className="border-b border-slate-200/70 pb-5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#08679F]">
            PATIENT CARE
          </span>

          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Add Admission
          </h1>

          <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-500 sm:text-sm">
            Create a new patient admission and assign an available hospital
            bed.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-rose-200
              bg-rose-50
              px-4
              py-3.5
              text-sm
              text-rose-700
            "
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
              <p className="font-semibold">Unable to continue</p>
              <p className="mt-0.5 text-xs text-rose-600">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <form
          onSubmit={handleSubmit}
          className="
            rounded-[22px]
            border
            border-slate-200/80
            bg-white
            p-5
            shadow-[0_8px_30px_rgba(15,23,42,0.04)]
            sm:p-7
            lg:p-8
          "
        >
          {/* Patient Information */}
          <section>
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#08679F]/10
                    text-[#08679F]
                  "
                >
                  <svg
                    className="h-4.5 w-4.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Patient */}
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

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admission Date */}
              <div>
                <label htmlFor="admissionDate" className={labelClass}>
                  Admission Date <span className="text-rose-500">*</span>
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

          {/* Divider */}
          <div className="my-8 border-t border-slate-200" />

          {/* Admission Information */}
          <section>
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <svg
                    className="h-4.5 w-4.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 6v12" />
                    <path d="M6 12h12" />
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Admission Information
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Provide the basic clinical details for this admission.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Admission Reason */}
              <div>
                <label htmlFor="admissionReason" className={labelClass}>
                  Admission Reason
                </label>

                <input
                  id="admissionReason"
                  name="admissionReason"
                  type="text"
                  value={formData.admissionReason}
                  onChange={handleChange}
                  placeholder="e.g. Observation, surgery, treatment"
                  className={inputClass}
                />
              </div>

              {/* Diagnosis */}
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
                  placeholder="Enter the patient's diagnosis or relevant clinical notes..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-3.5
                    py-3
                    text-sm
                    text-slate-800
                    placeholder:text-slate-400
                    outline-none
                    transition-all
                    duration-150
                    focus:border-[#08679F]
                    focus:ring-4
                    focus:ring-[#08679F]/10
                  "
                />
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="my-8 border-t border-slate-200" />

          {/* Ward / Bed */}
          <section>
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <svg
                    className="h-4.5 w-4.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
                    <path d="M3 18h18" />
                    <path d="M5 18v2" />
                    <path d="M19 18v2" />
                    <path d="M5 11V7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Ward / Bed
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Assign an available bed to the patient if required.
                  </p>
                </div>
              </div>
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
                    {bed.bed_number || bed.bedNumber || `Bed ${bed.id}`}
                    {bed.ward_name || bed.wardName
                      ? ` — ${bed.ward_name || bed.wardName}`
                      : ""}
                  </option>
                ))}
              </select>

              {beds.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No available beds are currently listed.
                </p>
              )}
            </div>
          </section>

          {/* Bottom Divider */}
          <div className="my-8 border-t border-slate-200" />

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admissions")}
              disabled={submitting}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                text-sm
                font-semibold
                text-slate-600
                transition-all
                duration-150
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-900
                disabled:cursor-not-allowed
                disabled:opacity-60
                focus:outline-none
                focus:ring-4
                focus:ring-slate-200
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#08679F]
                px-5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                duration-150
                hover:bg-[#07557F]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-60
                focus:outline-none
                focus:ring-4
                focus:ring-[#08679F]/20
              "
            >
              {submitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                    />
                  </svg>

                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>

                  Create Admission
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AddAdmissionForm;