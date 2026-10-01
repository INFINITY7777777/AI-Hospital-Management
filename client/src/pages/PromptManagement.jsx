import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PromptManagement() {
  const navigate = useNavigate();

  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [template, setTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State for Creating New Prompts
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    promptKey: "",
    title: "",
    description: "",
    template: "",
    variables: "patient_context, user_prompt",
  });

  // Helper to parse variables safely whether returned as Array or JSON String
  const parseVariables = (vars) => {
    if (Array.isArray(vars)) return vars;
    if (typeof vars === "string") {
      try {
        const parsed = JSON.parse(vars);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return vars.split(",").map((v) => v.trim());
      }
    }
    return [];
  };

  const selectPrompt = (item) => {
    setSelectedPrompt(item);
    const cleanTemplate = item.template ? item.template.replace(/\\n/g, "\n") : "";
    setTemplate(cleanTemplate);
  };

  const fetchPrompts = useCallback(async () => {
    try {
      const res = await api.get("/prompts");
      const fetchedPrompts = res.data?.prompts || [];
      setPrompts(fetchedPrompts);

      if (fetchedPrompts.length > 0) {
        setSelectedPrompt((prev) => {
          const match = fetchedPrompts.find((p) => p.prompt_key === prev?.prompt_key);
          const active = match || fetchedPrompts[0];
          setTemplate(active.template ? active.template.replace(/\\n/g, "\n") : "");
          return active;
        });
      }
    } catch (err) {
      console.error("Failed to load system prompts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const res = await api.get("/prompts");
        if (!isMounted) return;

        const fetchedPrompts = res.data?.prompts || [];
        setPrompts(fetchedPrompts);

        if (fetchedPrompts.length > 0) {
          const initial = fetchedPrompts[0];
          setSelectedPrompt(initial);
          setTemplate(initial.template ? initial.template.replace(/\\n/g, "\n") : "");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load system prompts:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!selectedPrompt) return;
    try {
      setSaving(true);
      await api.put(`/prompts/${selectedPrompt.prompt_key}`, {
        title: selectedPrompt.title,
        description: selectedPrompt.description,
        template,
        variables: parseVariables(selectedPrompt.variables),
        isActive: selectedPrompt.is_active ?? true,
      });
      alert("Prompt template version updated successfully!");
      await fetchPrompts();
    } catch (err) {
      console.error("Failed to save prompt update:", err);
      alert("Failed to save prompt template update.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewPrompt = async (e) => {
    e.preventDefault();
    if (!newPrompt.promptKey || !newPrompt.template) {
      alert("Prompt Key and Template are required.");
      return;
    }

    try {
      setSaving(true);
      const formattedKey = newPrompt.promptKey.trim().toUpperCase().replace(/\s+/g, "_");
      const varArray = newPrompt.variables
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      await api.put(`/prompts/${formattedKey}`, {
        title: newPrompt.title || formattedKey,
        description: newPrompt.description || "Custom HMS Prompt",
        template: newPrompt.template,
        variables: varArray,
        isActive: true,
      });

      alert("New prompt template created!");
      setShowCreateModal(false);
      setNewPrompt({
        promptKey: "",
        title: "",
        description: "",
        template: "",
        variables: "patient_context, user_prompt",
      });
      await fetchPrompts();
    } catch (err) {
      console.error("Failed to create new prompt:", err);
      alert("Failed to create new prompt template.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Loading AI Prompt Management Studio...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top Header Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300 px-3 py-2 rounded-lg shadow-sm transition"
          >
            ← Back to Dashboard
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              AI Prompt Management Studio
            </h1>
            <p className="text-sm text-gray-500">
              Configure system personas, context templates, and LLM behavior rules.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition self-start md:self-auto"
        >
          + Create New Prompt
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Prompt List */}
        <div className="space-y-3">
          {prompts.map((p) => {
            const isSelected = selectedPrompt?.prompt_key === p.prompt_key;
            return (
              <div
                key={p.prompt_key}
                onClick={() => selectPrompt(p)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/60 shadow-sm"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-gray-800 text-sm">
                    {p.title || p.prompt_key}
                  </div>
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded">
                    v{p.version}
                  </span>
                </div>
                <div className="text-xs font-mono text-blue-600 mt-1">
                  Key: {p.prompt_key}
                </div>
              </div>
            );
          })}
        </div>

        {/* Prompt Editor Panel */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {selectedPrompt ? (
            <div>
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {selectedPrompt.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedPrompt.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                    Version {selectedPrompt.version}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  System Prompt Template (Supports Mustache Placeholders)
                </label>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={13}
                  className="w-full border border-gray-300 rounded-lg p-3.5 font-mono text-sm leading-relaxed text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">
                    Variables:
                  </span>{" "}
                  {JSON.stringify(parseVariables(selectedPrompt.variables))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition disabled:opacity-50 shadow-sm"
                >
                  {saving ? "Saving New Version..." : "Save Prompt Version"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 py-12 text-center text-sm">
              Select a prompt template from the left list to view or edit.
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW PROMPT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Add New System Prompt
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Register a new prompt key for AI feature integrations.
            </p>

            <form onSubmit={handleCreateNewPrompt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Prompt Key (Unique Identifier)
                </label>
                <input
                  type="text"
                  placeholder="e.g. LAB_INTERPRETATION"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPrompt.promptKey}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, promptKey: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lab Report Interpreter"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPrompt.title}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of where this prompt is used"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPrompt.description}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Variables (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="patient_context, user_prompt"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPrompt.variables}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, variables: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Initial System Template
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="You are an expert clinical AI..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPrompt.template}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, template: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Prompt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromptManagement;