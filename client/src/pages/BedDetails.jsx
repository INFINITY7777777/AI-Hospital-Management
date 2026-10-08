import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground.jsx";

function PageBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <MedicalPlusBackground />

      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

function BedDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bed, setBed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [releasing, setReleasing] = useState(false);

  // 3D Tilt & Spotlight State for Specifications Card
  const detailsCardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });

  // 3D Tilt & Spotlight State for Occupant Card
  const occupantCardRef = useRef(null);
  const [occupantMousePos, setOccupantMousePos] = useState({ x: 0, y: 0 });
  const [isOccupantHovered, setIsOccupantHovered] = useState(false);
  const [occupantCardRotate, setOccupantCardRotate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchBed = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/beds/${id}`);
        setBed(response.data.bed);
      } catch (error) {
        console.error("Error fetching bed details:", error);
        setError(error.response?.data?.error || "Failed to fetch bed details");
      } finally {
        setLoading(false);
      }
    };

    fetchBed();
  }, [id]);

  const handleCardMouseMove = (event) => {
    const card = detailsCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setCardRotate({ x: rotateX, y: rotateY });
  };

  const handleOccupantMouseMove = (event) => {
    const card = occupantCardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setOccupantMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setOccupantCardRotate({ x: rotateX, y: rotateY });
  };

  const handleReleaseBed = async () => {
    const confirmRelease = window.confirm("Are you sure you want to release this bed?");
    if (!confirmRelease) return;

    try {
      setReleasing(true);
      await api.put(`/beds/${id}/release`);
      alert("Bed released successfully");

      const response = await api.get(`/beds/${id}`);
      setBed(response.data.bed);
    } catch (error) {
      console.error("Error releasing bed:", error);
      alert(error.response?.data?.error || "Failed to release bed");
    } finally {
      setReleasing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Available
          </span>
        );
      case "Occupied":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Occupied
          </span>
        );
      case "Maintenance":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Maintenance
          </span>
        );
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-9 w-36 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="border-b border-slate-200/80 pb-5">
            <div className="h-8 w-48 bg-slate-200/80 rounded-lg animate-pulse" />
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 h-64 animate-pulse" />
        </div>
      </PageBackground>
    );
  }

  if (error || !bed) {
    return (
      <PageBackground>
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            to="/beds"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/80 border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold shadow-xs transition-all duration-150"
          >
            <svg
              className="h-3.5 w-3.5 text-[#08679F]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Beds
          </Link>

          {error ? (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-xs font-medium text-rose-700">
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium">Bed not found.</p>
          )}
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <Link
            to="/beds"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/80 border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.99]"
          >
            <svg
              className="h-3.5 w-3.5 text-[#08679F]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Beds
          </Link>
        </div>

        {/* PAGE HEADER */}
        <div className="border-b border-slate-200/80 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Bed Details
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Comprehensive specifications and active patient assignment information.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/beds/edit/${bed.id}`)}
              className="group relative overflow-hidden inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold shadow-md shadow-[#08679F]/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
            >
              <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              <svg className="h-3.5 w-3.5 text-white z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              <span className="z-10">Edit Bed</span>
            </button>

            {bed.status === "Occupied" && (
              <button
                onClick={handleReleaseBed}
                disabled={releasing}
                className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-50"
              >
                {releasing ? "Releasing..." : "Release Bed"}
              </button>
            )}
          </div>
        </div>

        {/* MAIN 3D SPECIFICATIONS CARD */}
        <div className="perspective-[1000px]">
          <div
            ref={detailsCardRef}
            onMouseMove={handleCardMouseMove}
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => {
              setIsCardHovered(false);
              setCardRotate({ x: 0, y: 0 });
            }}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
            style={{
              transform: isCardHovered
                ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(8px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isCardHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
          >
            {/* Dynamic Spotlight Glow */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isCardHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300 z-20"
              style={{
                opacity: isCardHovered ? 1 : 0,
                background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Bed Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Bed Number</p>
                  <p className="text-sm font-bold text-slate-900">{bed.bed_number}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Ward</p>
                  <p className="text-sm font-bold text-slate-900">{bed.ward}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Bed Type</p>
                  <p className="text-sm font-bold text-slate-900">{bed.bed_type || "Standard"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                  <div>{getStatusBadge(bed.status)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OCCUPANT CARD */}
        <div className="perspective-[1000px]">
          <div
            ref={occupantCardRef}
            onMouseMove={handleOccupantMouseMove}
            onMouseEnter={() => setIsOccupantHovered(true)}
            onMouseLeave={() => {
              setIsOccupantHovered(false);
              setOccupantCardRotate({ x: 0, y: 0 });
            }}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)] space-y-4"
            style={{
              transform: isOccupantHovered
                ? `rotateX(${occupantCardRotate.x}deg) rotateY(${occupantCardRotate.y}deg) translateZ(8px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isOccupantHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
          >
            {/* Dynamic Spotlight Glow */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isOccupantHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${occupantMousePos.x}px ${occupantMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300 z-20"
              style={{
                opacity: isOccupantHovered ? 1 : 0,
                background: `radial-gradient(400px circle at ${occupantMousePos.x}px ${occupantMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Occupant Details
              </h2>

              {bed.patient_id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Patient Name</p>
                    <p className="text-sm font-bold text-slate-900">{bed.patient_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Patient ID</p>
                    <p className="text-sm font-bold text-slate-900">#{bed.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Phone</p>
                    <p className="text-sm font-bold text-slate-900">{bed.patient_phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Age</p>
                    <p className="text-sm font-bold text-slate-900">{bed.patient_age || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Gender</p>
                    <p className="text-sm font-bold text-slate-900">{bed.patient_gender || "—"}</p>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center sm:text-left">
                  <p className="text-xs font-medium text-slate-500">
                    No patient is currently assigned to this bed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

export default BedDetails;