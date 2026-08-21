// ==========================================================
// REACT
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";


// ==========================================================
// CLINICAL NOTES
// ==========================================================

function ClinicalNotes({ patientId }) {

    // ======================================================
    // NOTES STATE
    // ======================================================

    const [notes, setNotes] = useState([]);


    // ======================================================
    // LOADING
    // ======================================================

    const [loading, setLoading] = useState(true);


    // ======================================================
    // ERROR
    // ======================================================

    const [error, setError] = useState("");


    // ======================================================
    // FORM STATE
    // ======================================================

    const [noteType, setNoteType] = useState("General");

    const [title, setTitle] = useState("");

    const [content, setContent] = useState("");


    // ======================================================
    // SUBMIT LOADING
    // ======================================================

    const [saving, setSaving] = useState(false);


    // ======================================================
    // DELETE LOADING
    // ======================================================

    const [deletingId, setDeletingId] = useState(null);


    // ======================================================
    // EDIT STATE
    // ======================================================

    const [editingNoteId, setEditingNoteId] = useState(null);


    // ======================================================
    // FETCH NOTES
    // ======================================================

    useEffect(() => {

        if (!patientId) {

            return;

        }


        const loadClinicalNotes = async () => {

            try {

                setLoading(true);

                setError("");


                const response = await api.get(
                    `/clinical-notes/patient/${patientId}`
                );


                setNotes(
                    response.data.notes || []
                );

            }

            catch (error) {

                console.error(
                    "Error fetching clinical notes:",
                    error
                );

                console.error(
                    "Backend response:",
                    error.response?.data
                );


                setError(

                    error.response?.data?.error ||
                    "Failed to load clinical notes."

                );

            }

            finally {

                setLoading(false);

            }

        };


        loadClinicalNotes();

    }, [patientId]);


    // ======================================================
    // ADD / UPDATE NOTE
    // ======================================================

    const handleSaveNote = async (event) => {

        event.preventDefault();


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!content.trim()) {

            alert(
                "Clinical note content is required."
            );

            return;

        }


        try {

            setSaving(true);


            // ==================================================
            // UPDATE EXISTING NOTE
            // ==================================================

            if (editingNoteId) {

                const response = await api.put(

                    `/clinical-notes/${editingNoteId}`,

                    {

                        noteType,
                        title,
                        content

                    }

                );


                // ==============================================
                // UPDATE NOTE IN LIST
                // ==============================================

                setNotes((previousNotes) =>

                    previousNotes.map((note) =>

                        note.id === editingNoteId

                            ? response.data.note

                            : note

                    )

                );


                // ==============================================
                // EXIT EDIT MODE
                // ==============================================

                setEditingNoteId(null);

            }


            // ==================================================
            // ADD NEW NOTE
            // ==================================================

            else {

                const response = await api.post(

                    `/clinical-notes/patient/${patientId}`,

                    {

                        noteType,
                        title,
                        content

                    }

                );


                // ==============================================
                // ADD NEW NOTE TO LIST
                // ==============================================

                setNotes((previousNotes) => [

                    response.data.note,

                    ...previousNotes

                ]);

            }


            // ==================================================
            // CLEAR FORM
            // ==================================================

            setNoteType("General");

            setTitle("");

            setContent("");

        }

        catch (error) {

            console.error(
                "Error saving clinical note:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );


            alert(

                error.response?.data?.error ||
                "Failed to save clinical note."

            );

        }

        finally {

            setSaving(false);

        }

    };


    // ======================================================
    // START EDITING
    // ======================================================

    const handleEditNote = (note) => {

        setEditingNoteId(note.id);

        setNoteType(note.note_type || "General");

        setTitle(note.title || "");

        setContent(note.content || "");


        // Scroll to form

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };


    // ======================================================
    // CANCEL EDIT
    // ======================================================

    const handleCancelEdit = () => {

        setEditingNoteId(null);

        setNoteType("General");

        setTitle("");

        setContent("");

    };


    // ======================================================
    // DELETE NOTE
    // ======================================================

    const handleDeleteNote = async (noteId) => {

        const confirmed = window.confirm(

            "Are you sure you want to delete this clinical note?"

        );


        if (!confirmed) {

            return;

        }


        try {

            setDeletingId(noteId);


            await api.delete(
                `/clinical-notes/${noteId}`
            );


            // ==================================================
            // REMOVE FROM UI
            // ==================================================

            setNotes((previousNotes) =>

                previousNotes.filter(
                    (note) => note.id !== noteId
                )

            );


            // ==================================================
            // IF DELETED NOTE WAS BEING EDITED
            // ==================================================

            if (editingNoteId === noteId) {

                handleCancelEdit();

            }

        }

        catch (error) {

            console.error(
                "Error deleting clinical note:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );


            alert(

                error.response?.data?.error ||
                "Failed to delete clinical note."

            );

        }

        finally {

            setDeletingId(null);

        }

    };


    // ======================================================
    // FORMAT DATE
    // ======================================================

    const formatDate = (date) => {

        if (!date) {

            return "—";

        }


        return new Date(date).toLocaleString(

            "en-IN",

            {

                day: "2-digit",

                month: "short",

                year: "numeric",

                hour: "2-digit",

                minute: "2-digit"

            }

        );

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Clinical Notes
                </h2>


                <div className="animate-pulse space-y-4">

                    <div className="h-5 bg-gray-200 rounded w-40"></div>

                    <div className="h-20 bg-gray-100 rounded"></div>

                    <div className="h-20 bg-gray-100 rounded"></div>

                </div>

            </section>

        );

    }


    // ======================================================
    // MAIN UI
    // ======================================================

    return (

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                    Clinical Notes
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    Medical notes and observations recorded for this patient.
                </p>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">

                    {error}

                </div>

            )}


            {/* ==================================================
                ADD / EDIT NOTE FORM
            ================================================== */}

            <form
                onSubmit={handleSaveNote}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8"
            >


                {/* ==================================================
                    FORM HEADER
                ================================================== */}

                <div className="flex items-center justify-between mb-4">

                    <h3 className="font-bold text-gray-900">

                        {editingNoteId
                            ? "Edit Clinical Note"
                            : "Add Clinical Note"
                        }

                    </h3>


                    {editingNoteId && (

                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-sm text-gray-600 hover:text-gray-900 font-semibold"
                        >
                            Cancel Edit
                        </button>

                    )}

                </div>


                {/* ==================================================
                    NOTE TYPE
                ================================================== */}

                <div className="mb-4">

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note Type
                    </label>


                    <select
                        value={noteType}
                        onChange={(event) =>
                            setNoteType(event.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >

                        <option value="General">
                            General
                        </option>

                        <option value="Progress">
                            Progress
                        </option>

                        <option value="Diagnosis">
                            Diagnosis
                        </option>

                        <option value="Treatment">
                            Treatment
                        </option>

                        <option value="Observation">
                            Observation
                        </option>

                        <option value="Prescription">
                            Prescription
                        </option>

                        <option value="Follow-up">
                            Follow-up
                        </option>

                    </select>

                </div>


                {/* ==================================================
                    TITLE
                ================================================== */}

                <div className="mb-4">

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>


                    <input
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        placeholder="Enter note title"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div className="mb-4">

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinical Note
                    </label>


                    <textarea
                        value={content}
                        onChange={(event) =>
                            setContent(event.target.value)
                        }
                        placeholder="Enter clinical observations, diagnosis, treatment details, etc."
                        rows="5"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* ==================================================
                    FORM BUTTONS
                ================================================== */}

                <div className="flex flex-wrap gap-3">

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-semibold transition"
                    >

                        {saving

                            ? "Saving..."

                            : editingNoteId
                                ? "Update Clinical Note"
                                : "Add Clinical Note"

                        }

                    </button>


                    {editingNoteId && (

                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-5 py-2.5 rounded-lg font-semibold transition"
                        >
                            Cancel
                        </button>

                    )}

                </div>

            </form>


            {/* ==================================================
                NOTES LIST
            ================================================== */}

            <div>


                <div className="flex items-center justify-between mb-4">

                    <h3 className="font-bold text-gray-900">
                        Previous Notes
                    </h3>


                    <span className="text-sm text-gray-500">

                        {notes.length} note
                        {notes.length !== 1 ? "s" : ""}

                    </span>

                </div>


                {/* ==================================================
                    NO NOTES
                ================================================== */}

                {notes.length === 0 ? (

                    <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center">

                        <p className="text-gray-500">
                            No clinical notes have been added yet.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {notes.map((note) => (

                            <div
                                key={note.id}
                                className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition"
                            >


                                {/* ==================================================
                                    NOTE HEADER
                                ================================================== */}

                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">


                                    <div>

                                        <div className="flex flex-wrap items-center gap-2">


                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">

                                                {note.note_type}

                                            </span>


                                            {note.title && (

                                                <h4 className="font-bold text-gray-900">

                                                    {note.title}

                                                </h4>

                                            )}

                                        </div>

                                    </div>


                                    {/* ==================================================
                                        ACTIONS
                                    ================================================== */}

                                    <div className="flex items-center gap-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditNote(note)
                                            }
                                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                                        >
                                            Edit
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteNote(note.id)
                                            }
                                            disabled={
                                                deletingId === note.id
                                            }
                                            className="text-red-600 hover:text-red-700 disabled:text-red-300 text-sm font-semibold"
                                        >

                                            {deletingId === note.id
                                                ? "Deleting..."
                                                : "Delete"
                                            }

                                        </button>

                                    </div>

                                </div>


                                {/* ==================================================
                                    CONTENT
                                ================================================== */}

                                <p className="text-gray-700 mt-4 whitespace-pre-wrap">

                                    {note.content}

                                </p>


                                {/* ==================================================
                                    AUTHOR / DATE
                                ================================================== */}

                                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">

                                    <span>

                                        By{" "}

                                        <strong className="text-gray-700">

                                            {note.author_name || "Unknown"}

                                        </strong>

                                    </span>


                                    {note.author_role && (

                                        <span>

                                            {" "}({note.author_role})

                                        </span>

                                    )}


                                    <span className="mx-2">
                                        •
                                    </span>


                                    <span>
                                        {formatDate(note.created_at)}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </section>

    );

}

export default ClinicalNotes;