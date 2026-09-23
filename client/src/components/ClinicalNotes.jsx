import { useEffect, useState } from "react";
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
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Clinical & Pharmacy Notes</h2>
                <div className="animate-pulse space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-40"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Clinical & Pharmacy Notes</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Manage patient clinical records and issue pharmacy prescriptions.
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSaveNote} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">
                        {editingNoteId ? "Edit Record" : "Add Clinical Record / Prescription"}
                    </h3>
                    {editingNoteId && (
                        <button type="button" onClick={handleCancelEdit} className="text-sm text-gray-600 font-semibold">
                            Cancel Edit
                        </button>
                    )}
                </div>

                {/* Note Type Dropdown */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
                    <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-blue-500"
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
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-4">
                        <h4 className="font-bold text-blue-900 text-sm">Pharmacy Order Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Drug / Medication Name *</label>
                                <input
                                    type="text"
                                    value={medication}
                                    onChange={(e) => setMedication(e.target.value)}
                                    placeholder="e.g. Amoxicillin, Paracetamol"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Dosage</label>
                                <input
                                    type="text"
                                    value={dosage}
                                    onChange={(e) => setDosage(e.target.value)}
                                    placeholder="e.g. 500mg"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
                                <input
                                    type="text"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    placeholder="e.g. Twice daily (1-0-1)"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g. 5 Days"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Pharmacy Special Instructions</label>
                            <input
                                type="text"
                                value={pharmacyInstructions}
                                onChange={(e) => setPharmacyInstructions(e.target.value)}
                                placeholder="e.g. Take after meals"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Title Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title or summary"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Additional Clinical Notes Content */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {noteType === "Prescription" ? "Clinical Notes / Remarks" : "Clinical Note"}
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter clinical observations or notes..."
                        rows="4"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-y focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-lg font-semibold transition"
                >
                    {saving ? "Saving..." : editingNoteId ? "Update Record" : noteType === "Prescription" ? "Send to Pharmacy / Save" : "Save Clinical Note"}
                </button>
            </form>

            {/* Notes & Prescriptions List */}
            <div className="space-y-4">
                {notes.map((note) => (
                    <div key={note.id} className="border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    (note.note_type || note.noteType) === "Prescription" 
                                        ? "bg-purple-100 text-purple-700" 
                                        : "bg-blue-100 text-blue-700"
                                }`}>
                                    {note.note_type || note.noteType}
                                </span>
                                {note.title && <h4 className="font-bold text-gray-900">{note.title}</h4>}
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => handleEditNote(note)} className="text-blue-600 text-sm font-semibold">
                                    Edit
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleDeleteNote(note.id)} 
                                    disabled={deletingId === note.id}
                                    className="text-red-600 hover:text-red-700 disabled:text-red-300 text-sm font-semibold"
                                >
                                    {deletingId === note.id ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>

                        {/* Display Structured Prescription Info if available */}
                        {note.prescriptionDetails && (
                            <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-900 grid grid-cols-2 gap-2">
                                <div><strong>Medication:</strong> {note.prescriptionDetails.medication}</div>
                                <div><strong>Dosage:</strong> {note.prescriptionDetails.dosage || "—"}</div>
                                <div><strong>Frequency:</strong> {note.prescriptionDetails.frequency || "—"}</div>
                                <div><strong>Duration:</strong> {note.prescriptionDetails.duration || "—"}</div>
                            </div>
                        )}

                        <p className="text-gray-700 mt-3 whitespace-pre-wrap">{note.content}</p>
                        <div className="mt-3 text-xs text-gray-500">{formatDate(note.created_at || note.createdAt)}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ClinicalNotes;