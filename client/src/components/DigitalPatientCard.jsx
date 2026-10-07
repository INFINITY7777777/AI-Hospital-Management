// ==========================================================
// INFO ITEM SUB-COMPONENT
// ==========================================================

function InfoItem({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </p>
      <p
        className={`text-xs sm:text-sm font-semibold warp-break-word ${
          highlight ? "text-[#08679F] font-bold" : "text-slate-800"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

// ==========================================================
// FORMAT DATE HELPER (TIMEZONE-SAFE)
// ==========================================================

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  // Handle ISO strings, timestamps, or standard YYYY-MM-DD
  const rawDateStr = String(date).split("T")[0];
  const parts = rawDateStr.split("-");

  if (parts.length !== 3) {
    return "—";
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!year || !month || !day) {
    return "—";
  }

  // Construct a pure local calendar date
  const parsedDate = new Date(year, month - 1, day);

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

// ==========================================================
// DIGITAL PATIENT CARD
// ==========================================================

function DigitalPatientCard({ patient }) {
  if (!patient) return null;

  return (
    <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
      {/* HEADER HERO BANNER */}
      <div className="bg-[#08679F] text-white p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-20 -bottom-10 h-24 w-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-100">
                Digital Patient Card
              </p>
            </div>

            <h1 className="text-xl md:text-2xl font-bold mt-1 tracking-tight">
              {patient.patient_name || patient.name || "Unknown Patient"}
            </h1>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/15 px-4 py-2.5 self-start md:self-auto">
            <p className="text-[10px] uppercase font-bold text-sky-100 tracking-wider">
              Patient ID
            </p>
            <p className="font-bold text-sm sm:text-base">
              #{patient.id || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-6 space-y-6">
        {/* PERSONAL INFORMATION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <svg className="h-4 w-4 text-[#08679F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoItem label="Age" value={patient.age ? `${patient.age} yrs` : null} />
            <InfoItem label="Gender" value={patient.gender} />
            <InfoItem label="Blood Group" value={patient.blood_group} highlight />
            <InfoItem label="Phone" value={patient.phone} />
          </div>
        </section>

        {/* CONTACT INFORMATION */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <svg className="h-4 w-4 text-[#08679F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.47-5.112-3.756-6.58-6.58l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Contact & Address
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Address" value={patient.address} />
            <InfoItem label="Emergency Contact" value={patient.emergency_contact} />
          </div>
        </section>

        {/* MEDICAL & CLINICAL INFORMATION */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <svg className="h-4 w-4 text-[#08679F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Clinical & Ward Assignment
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoItem label="Assigned Doctor" value={patient.doctor} />
            <InfoItem label="Ward" value={patient.ward} />
            <InfoItem label="Bed Number" value={patient.bed_number} />
            <InfoItem label="Admission Date" value={formatDate(patient.admission_date)} />
          </div>

          <div className="mt-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <InfoItem label="Diagnosis / Notes" value={patient.diagnosis} />
          </div>
        </section>

        {/* FOOTER */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Hospital Management System Verified Record</span>
          <span className="font-medium text-slate-500">Live Sync</span>
        </div>
      </div>
    </div>
  );
}

export default DigitalPatientCard;