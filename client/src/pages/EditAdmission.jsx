import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function EditAdmission() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admission, setAdmission] = useState(null);
  const [admissionDate, setAdmissionDate] = useState("");
  const [admissionReason, setAdmissionReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 3D Tilt Card Spotlight State
  const formCardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!formCardRef.current) return;
    const rect = formCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    setCardRotate({ x: rotateX, y: rotateY });
  };

  useEffect(() => {
    const loadAdmission = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/admissions/${id}`);
        const data = response.data.admission;

        setAdmission(data);
        setAdmissionDate(
          data.admission_date
            ? new Date(data.admission_date).toISOString().split("T")[0]
            : ""
        );
        setAdmissionReason(data.admission_reason || "");
        setDiagnosis(data.diagnosis || "");
      } catch (err) {
        console.error("Error fetching admission:", err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to fetch admission details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdmission();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!admissionDate) {
      setError("Admission date is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(`/admissions/${id}`, {
        admissionDate,
        admissionReason,
        diagnosis,
      });

      alert("Admission updated successfully");
      navigate(`/admissions/${id}`);
    } catch (err) {
      console.error("Error updating admission:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update admission"
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10";
  const labelClass = "mb-1.5 block text-xs font-semibold text-slate-700";

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#F6F8FC] font-sans text-slate-900 antialiased p-4 sm:p-6 lg:p-8">
        <MedicalPlusBackground />
        <main className="relative z-10 mx-auto max-w-4xl space-y-6">
          <div className="h-9 w-36 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-200/80 rounded-[22px] animate-pulse" />
          <div className="h-96 bg-slate-200/80 rounded-[22px] animate-pulse" />
        </main>
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="relative min-h-screen bg-[#F6F8FC] font-sans text-slate-900 antialiased p-4 sm:p-6 lg:p-8">
        <MedicalPlusBackground />
        <main className="relative z-10 mx-auto max-w-4xl space-y-6">
          <div>
            <Link
              to="/admissions"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-white"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admissions
            </Link>
          </div>

          <div className="rounded-[22px] border border-rose-200 bg-white/80 backdrop-blur-xl p-8 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900">{error || "Admission Record Not Found"}</h2>
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/admissions")}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#08679F] px-4 text-xs font-semibold text-white shadow-md hover:bg-[#07557F] cursor-pointer"
              >
                Back to Admissions
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <MedicalPlusBackground />

      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <main className="relative z-10 mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            to={`/admissions/${id}`}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-white"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admission Details
          </Link>
        </div>

        <div className="border-b border-slate-200/80 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Edit Admission #{admission.id}
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Update admission details for {admission.patient_name || "Patient"}.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 backdrop-blur-md px-4 py-3 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* 3D Tilt & Spotlight Form Card */}
        <section className="perspective-[1000px]">
          <form
            ref={formCardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setCardRotate({ x: 0, y: 0 });
            }}
            onSubmit={handleSubmit}
            style={{
              transform: isHovered
                ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(6px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="animate-login-card relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)] space-y-6"
          >
            {/* Spotlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            <div className="relative z-10 space-y-6">
              <div>
                <label htmlFor="admissionDate" className={labelClass}>
                  Admission Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="admissionDate"
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="admissionReason" className={labelClass}>
                  Admission Reason
                </label>
                <input
                  id="admissionReason"
                  type="text"
                  value={admissionReason}
                  onChange={(e) => setAdmissionReason(e.target.value)}
                  placeholder="e.g. High Fever & Monitoring"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="diagnosis" className={labelClass}>
                  Diagnosis
                </label>
                <textarea
                  id="diagnosis"
                  rows={4}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter clinical diagnostic notes..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate(`/admissions/${id}`)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="group relative overflow-hidden inline-flex h-10 items-center justify-center rounded-xl bg-[#08679F] px-5 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20 hover:bg-[#07557F] disabled:opacity-60 cursor-pointer"
                >
                  <span className="relative z-10">{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>

      <style>{`
        @keyframes loginCardIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-login-card {
          animation: loginCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}

export default EditAdmission;