import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "—";
  const datePart = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Interactive Tilt Card Wrapper
function SpotlightCard({ children, className = "" }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    setCardRotate({ x: rotateX, y: rotateY });
  };

  return (
    <div className="perspective-[1000px]">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setCardRotate({ x: 0, y: 0 });
        }}
        style={{
          transform: isHovered
            ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(4px)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: isHovered
            ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
            : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
        }}
        className={`animate-login-card relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)] ${className}`}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

function AdmissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dischargeReason, setDischargeReason] = useState("");
  const [dischargeDate, setDischargeDate] = useState(getLocalDate());
  const [discharging, setDischarging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadAdmission = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/admissions/${id}`);
        const data = response.data?.admission ?? response.data;

        if (!cancelled) {
          setAdmission(data || null);
          if (data?.discharge_date) {
            setDischargeDate(String(data.discharge_date).slice(0, 10));
          }
        }
      } catch (err) {
        console.error("Error fetching admission:", err.response?.status, err.response?.data || err.message);
        if (!cancelled) {
          setError(err.response?.data?.error || err.response?.data?.message || "Failed to fetch admission.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAdmission();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDischarge = async () => {
    if (!admission || admission.status === "Discharged") return;
    if (!dischargeDate) {
      setError("Please select a discharge date.");
      return;
    }

    const admissionDate = String(admission.admission_date || "").slice(0, 10);
    if (admissionDate && dischargeDate < admissionDate) {
      setError("Discharge date cannot be before the admission date.");
      return;
    }

    if (dischargeDate > getLocalDate()) {
      setError("Discharge date cannot be in the future.");
      return;
    }

    const confirmed = window.confirm(`Discharge admission #${admission.id} on ${formatDate(dischargeDate)}?`);
    if (!confirmed) return;

    try {
      setDischarging(true);
      setError("");

      await api.put(`/admissions/${id}/discharge`, {
        dischargeDate,
        dischargeReason: dischargeReason.trim(),
      });

      alert("Patient discharged successfully.");
      navigate("/admissions");
    } catch (err) {
      console.error("Discharge error:", err.response?.status, err.response?.data || err.message);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to discharge patient.");
    } finally {
      setDischarging(false);
    }
  };

  const renderStatusBadge = (status) => {
    const admitted = status === "Admitted";
    const discharged = status === "Discharged";

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
          admitted
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : discharged
            ? "border-slate-200 bg-slate-100 text-slate-600"
            : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${admitted ? "bg-emerald-500" : discharged ? "bg-slate-400" : "bg-amber-500"}`} />
        {status || "Unknown"}
      </span>
    );
  };

  const labelClass = "mb-1.5 block text-xs font-semibold text-slate-700";
  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 disabled:cursor-not-allowed disabled:bg-slate-100";

  if (loading) {
    return (
      <main className="relative min-h-screen bg-[#F6F8FC] p-6 text-slate-900">
        <MedicalPlusBackground />
        <div className="relative z-10 mx-auto max-w-7xl space-y-5">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-32 animate-pulse rounded-[22px] bg-white/80" />
          <div className="h-48 animate-pulse rounded-[22px] bg-white/80" />
        </div>
      </main>
    );
  }

  if (!admission) {
    return (
      <main className="relative min-h-screen bg-[#F6F8FC] p-6 text-slate-900">
        <MedicalPlusBackground />
        <div className="relative z-10 mx-auto max-w-3xl rounded-[22px] border border-rose-200 bg-white/80 backdrop-blur-xl p-6 shadow-xl">
          <h1 className="text-lg font-bold text-slate-900">Admission not found</h1>
          <p className="mt-2 text-sm text-rose-700">{error || "The requested admission could not be loaded."}</p>
          <Link to="/admissions" className="mt-5 inline-flex rounded-xl bg-[#08679F] px-4 py-2.5 text-sm font-semibold text-white">
            Back to Admissions
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <MedicalPlusBackground />

      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <Link
          to="/admissions"
          className="inline-flex h-10 items-center rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
        >
          ← Back to Admissions
        </Link>

        <header className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Admission #{admission.id}</h1>
              {renderStatusBadge(admission.status)}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Detailed hospital stay and clinical record for {admission.patient_name || "Patient"}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/admissions/${id}/edit`)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white/80 backdrop-blur-md px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white cursor-pointer"
          >
            Edit Admission
          </button>
        </header>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50/80 backdrop-blur-md px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <SpotlightCard>
          <h2 className="mb-5 text-base font-bold">Patient Information</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Patient Name</p>
              <p className="mt-1 text-sm font-semibold">{admission.patient_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Phone Number</p>
              <p className="mt-1 text-sm font-semibold">{admission.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Age / Gender</p>
              <p className="mt-1 text-sm font-semibold">{admission.age ?? "—"} / {admission.gender || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Blood Group</p>
              <p className="mt-1 text-sm font-semibold">{admission.blood_group || "—"}</p>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <h2 className="text-base font-bold">Bed & Ward Allocation</h2>
          <p className="mt-1 text-xs text-slate-500">Current bed assignment</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">Bed Number</p>
              <p className="mt-1 text-sm font-semibold">{admission.bed_number || "Not Assigned"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Ward</p>
              <p className="mt-1 text-sm font-semibold">{admission.ward || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Bed Type</p>
              <p className="mt-1 text-sm font-semibold">{admission.bed_type || "—"}</p>
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard>
          <h2 className="mb-5 text-base font-bold">Admission Details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Admission Date</p>
              <p className="mt-1 text-sm font-semibold">{formatDate(admission.admission_date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <div className="mt-1">{renderStatusBadge(admission.status)}</div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Admission Reason</p>
              <p className="mt-1 text-sm">{admission.admission_reason || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Diagnosis</p>
              <p className="mt-1 text-sm">{admission.diagnosis || "—"}</p>
            </div>
          </div>
        </SpotlightCard>

        {admission.status !== "Discharged" ? (
          <SpotlightCard>
            <h2 className="text-base font-bold">Discharge Patient</h2>
            <p className="mt-1 text-xs text-slate-500">Select the discharge date and record any discharge notes.</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="dischargeDate" className={labelClass}>
                  Discharge Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="dischargeDate"
                  type="date"
                  value={dischargeDate}
                  min={admission.admission_date ? String(admission.admission_date).slice(0, 10) : undefined}
                  max={getLocalDate()}
                  onChange={(event) => setDischargeDate(event.target.value)}
                  disabled={discharging}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="dischargeReason" className={labelClass}>
                  Discharge Reason / Notes
                </label>
                <textarea
                  id="dischargeReason"
                  value={dischargeReason}
                  onChange={(event) => setDischargeReason(event.target.value)}
                  placeholder="Enter discharge notes..."
                  rows={3}
                  disabled={discharging}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleDischarge}
                disabled={discharging}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {discharging ? "Discharging..." : "Discharge Patient"}
              </button>
            </div>
          </SpotlightCard>
        ) : (
          <SpotlightCard>
            <h2 className="text-base font-bold">Discharge Record</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Discharge Date</p>
                <p className="mt-1 text-sm font-semibold">{formatDate(admission.discharge_date)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Discharge Reason</p>
                <p className="mt-1 text-sm">{admission.discharge_reason || "—"}</p>
              </div>
            </div>
          </SpotlightCard>
        )}
      </div>

      <style>{`
        @keyframes loginCardIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-login-card {
          animation: loginCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </main>
  );
}

export default AdmissionDetails;