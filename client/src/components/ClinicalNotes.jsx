import { useEffect, useState, useRef } from "react";
import api from "../services/api";

function ClinicalNotes({ patientId }) {
  // State Management
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteType, setNoteType] = useState("General");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Pharmacy / Prescription Specific State
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [pharmacyInstructions, setPharmacyInstructions] = useState("");

  // 3D Tilt & Spotlight Hover State
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMoveCard = (e) => {
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

  // Fetch Clinical Notes
  useEffect(() => {
    if (!patientId) return;

    const loadClinicalNotes = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/clinical-notes/patient/${patientId}`);
        setNotes(response.data?.notes || []);
      } catch (err) {
        console.error("Error fetching clinical notes:", err);
        setError(err.response?.data?.error || "Failed to load clinical notes.");
      } finally {
        setLoading(false);
      }
    };

    loadClinicalNotes();
  }, [patientId]);

  // Handle Form Reset
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteType("General");
    setTitle("");
    setContent("");
    setMedication("");
    setDosage("");
    setFrequency("");
    setDuration("");
    setPharmacyInstructions("");
  };

  // Save or Update Note
  const handleSaveNote = async (event) => {
    event.preventDefault();

    if (!content.trim() && noteType !== "Prescription") {
      alert("Clinical note content is required.");
      return;
    }

    if (noteType === "Prescription" && !medication.trim()) {
      alert("Medication name is required for pharmacy prescriptions.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        noteType,
        title: title.trim() || (noteType === "Prescription" ? `Prescription: ${medication}` : ""),
        content: content.trim(),
        prescriptionDetails: noteType === "Prescription" ? {
          medication: medication.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          duration: duration.trim(),
          instructions: pharmacyInstructions.trim(),
          sendToPharmacy: true
        } : null
      };

      if (editingNoteId) {
        const response = await api.put(`/clinical-notes/${editingNoteId}`, payload);
        const updatedNote = response.data?.note || response.data;

        setNotes((previousNotes) =>
          previousNotes.map((note) =>
            note.id === editingNoteId
              ? { ...note, ...updatedNote, note_type: noteType }
              : note
          )
        );
      } else {
        const response = await api.post(`/clinical-notes/patient/${patientId}`, payload);
        const newNote = response.data?.note || response.data;

        setNotes((previousNotes) => [
          { ...newNote, note_type: newNote.note_type || noteType },
          ...previousNotes
        ]);
      }

      handleCancelEdit();
    } catch (err) {
      console.error("Error saving note/prescription:", err);
      alert(err.response?.data?.error || "Failed to save record.");
    } finally {
      setSaving(false);
    }
  };

  // Edit Note / Prescription
  const handleEditNote = (note) => {
    if (editingNoteId === note.id) {
      handleCancelEdit();
      return;
    }

    const type = note.note_type || note.noteType || "General";
    setEditingNoteId(note.id);
    setNoteType(type);
    setTitle(note.title || "");
    setContent(note.content || "");

    if (note.prescriptionDetails) {
      setMedication(note.prescriptionDetails.medication || "");
      setDosage(note.prescriptionDetails.dosage || "");
      setFrequency(note.prescriptionDetails.frequency || "");
      setDuration(note.prescriptionDetails.duration || "");
      setPharmacyInstructions(note.prescriptionDetails.instructions || "");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      setDeletingId(noteId);
      await api.delete(`/clinical-notes/${noteId}`);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));

      if (editingNoteId === noteId) handleCancelEdit();
    } catch (err) {
      console.error("Error deleting record:", err);
      alert(err.response?.data?.error || "Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <section className="bg-white/80 backdrop-blur-xl rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <h2 className="text-base font-bold text-slate-900 mb-6">Clinical & Pharmacy Notes</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-slate-200 rounded-lg w-40"></div>
          <div className="h-28 bg-slate-100 rounded-xl"></div>
        </div>
      </section>
    );
  }

  return (
    <div className="perspective-[1000px]">
      <section
        ref={cardRef}
        onMouseMove={handleMouseMoveCard}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setCardRotate({ x: 0, y: 0 });
        }}
        style={{
          transform: isHovered
            ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(10px)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: isHovered
            ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
            : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
        }}
        className="relative overflow-hidden bg-white/80 rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)] space-y-6"
      >
        {/* Dynamic Spotlight Glow effect inside Card */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
          }}
        />

        {/* Border Light Highlight */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
            maskImage:
              "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Clinical & Pharmacy Notes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage patient clinical observations, diagnosis logs, and send orders directly to the pharmacy.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <svg className="h-4 w-4 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          {/* FORM CONTAINER */}
          <form onSubmit={handleSaveNote} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#08679F]"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {editingNoteId ? "Edit Record" : "Add Clinical Record / Prescription"}
                </h3>
              </div>
              {editingNoteId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Note Type Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Record Type
              </label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
              >
                <option value="General">General Note</option>
                <option value="Prescription">Pharmacy Prescription</option>
                <option value="Diagnosis">Diagnosis</option>
                <option value="Treatment">Treatment Plan</option>
                <option value="Progress">Progress Note</option>
              </select>
            </div>

            {/* Dynamic Pharmacy Integration Section */}
            {noteType === "Prescription" && (
              <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-sky-100">
                  <svg className="h-4 w-4 text-[#08679F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
                  </svg>
                  <h4 className="font-bold text-[#08679F] text-xs uppercase tracking-wider">
                    Pharmacy Order Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Drug / Medication Name *
                    </label>
                    <input
                      type="text"
                      value={medication}
                      onChange={(e) => setMedication(e.target.value)}
                      placeholder="e.g. Amoxicillin, Paracetamol"
                      className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#08679F]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g. 500mg"
                      className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#08679F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Frequency</label>
                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      placeholder="e.g. Twice daily (1-0-1)"
                      className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#08679F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 5 Days"
                      className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#08679F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Pharmacy Special Instructions
                  </label>
                  <input
                    type="text"
                    value={pharmacyInstructions}
                    onChange={(e) => setPharmacyInstructions(e.target.value)}
                    placeholder="e.g. Take after meals"
                    className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#08679F]"
                  />
                </div>
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Title / Topic
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title or clinical summary"
                className="w-full h-10 border border-slate-200 rounded-xl px-3 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
              />
            </div>

            {/* Additional Clinical Notes Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {noteType === "Prescription" ? "Clinical Notes / Remarks" : "Clinical Note Details"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter clinical observations, patient symptoms, or doctor orders..."
                rows="3"
                className="w-full border border-slate-200 rounded-xl p-3 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl
                bg-[#08679F] hover:bg-[#07557F] text-white text-xs sm:text-sm font-semibold
                shadow-md shadow-[#08679F]/20 transition-all duration-150
                hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {saving ? (
                "Saving Record..."
              ) : editingNoteId ? (
                "Update Record"
              ) : noteType === "Prescription" ? (
                "Send to Pharmacy / Save Order"
              ) : (
                "Save Clinical Note"
              )}
            </button>
          </form>

          {/* NOTES & PRESCRIPTIONS LIST */}
          <div className="space-y-3 pt-2">
            {notes.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-xs text-slate-500 font-medium">
                  No clinical notes or prescriptions recorded yet.
                </p>
              </div>
            ) : (
              notes.map((note) => {
                const isPrescription = (note.note_type || note.noteType) === "Prescription";

                return (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white/90 hover:border-slate-300 transition-all duration-150 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isPrescription
                              ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                              : "bg-[#08679F]/10 text-[#08679F]"
                          }`}
                        >
                          {note.note_type || note.noteType || "General"}
                        </span>
                        {note.title && (
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                            {note.title}
                          </h4>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditNote(note)}
                          className="text-xs font-semibold text-[#08679F] hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deletingId === note.id}
                          className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50"
                        >
                          {deletingId === note.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    {/* Structured Prescription Box */}
                    {note.prescriptionDetails && (
                      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Medication</span>
                          <strong className="text-purple-900 font-semibold">{note.prescriptionDetails.medication}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Dosage</span>
                          <span>{note.prescriptionDetails.dosage || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Frequency</span>
                          <span>{note.prescriptionDetails.frequency || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                          <span>{note.prescriptionDetails.duration || "—"}</span>
                        </div>
                      </div>
                    )}

                    {note.content && (
                      <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    )}

                    <div className="text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Recorded: {formatDate(note.created_at || note.createdAt)}</span>
                      {isPrescription && (
                        <span className="text-purple-600 font-bold">Sent to Pharmacy</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ClinicalNotes;