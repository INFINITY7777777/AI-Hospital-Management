import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Save,
  ArrowLeft,
  Code2,
  Variable,
  CheckCircle2,
  X,
  Layers,
  FileCode2
} from "lucide-react";
import api from "../services/api";
import Sidebar from "../components/Sidebar.jsx";

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
      <div className="relative min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
        {/* =====================================================
            VERTICALLY CENTERED CIRCULAR MENU OVERRIDE CONTAINER
        ====================================================== */}
        <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
          <Sidebar />
        </div>

        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] max-w-7xl mx-auto my-6 font-sans">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#08679F] border-t-transparent"></div>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Loading AI Prompt Management Studio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
      {/* =====================================================
          VERTICALLY CENTERED CIRCULAR MENU OVERRIDE CONTAINER
          Overrides the floating button position & shape without
          modifying any code inside Sidebar.jsx
      ====================================================== */}
      <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
        <Sidebar />
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
        {/* Top Header Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#08679F] bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 px-3 py-2 rounded-xl transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#08679F]" />
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  AI Prompt Management Studio
                </h1>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Configure clinical system personas, context templates, and LLM behavior rules
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-[0.98] self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Prompt</span>
          </button>
        </div>

        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Prompt List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Layers className="h-3.5 w-3.5" />
              <span>System Prompt Keys ({prompts.length})</span>
            </div>

            {prompts.map((p) => {
              const isSelected = selectedPrompt?.prompt_key === p.prompt_key;
              return (
                <div
                  key={p.prompt_key}
                  onClick={() => selectPrompt(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#08679F] bg-sky-50/60 shadow-xs"
                      : "border-slate-200/80 bg-white hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-slate-900 text-xs line-clamp-1">
                      {p.title || p.prompt_key}
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md shrink-0">
                      v{p.version}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#08679F] font-semibold mt-1.5 flex items-center gap-1">
                    <Code2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{p.prompt_key}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prompt Editor Panel */}
          <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            {selectedPrompt ? (
              <div className="space-y-5">
                <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {selectedPrompt.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {selectedPrompt.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-sky-50 text-[#08679F] border border-sky-100 text-xs px-3 py-1 rounded-full font-bold shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Version {selectedPrompt.version}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span>System Prompt Template (Supports Mustache Placeholders)</span>
                    <span className="font-mono text-[10px] text-slate-400 font-normal">
                      Mustache Template Syntax
                    </span>
                  </label>
                  <textarea
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    rows={13}
                    className="w-full border border-slate-300 rounded-xl p-4 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/50 focus:bg-white focus:border-[#08679F] focus:outline-none focus:ring-1 focus:ring-[#08679F] transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                    <Variable className="h-4 w-4 text-[#08679F] shrink-0" />
                    <span className="font-bold text-slate-700">Variables:</span>
                    <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {JSON.stringify(parseVariables(selectedPrompt.variables))}
                    </span>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#08679F] hover:bg-[#07557F] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-xs active:scale-[0.98]"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving New Version..." : "Save Prompt Version"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 py-16 text-center text-xs font-medium flex flex-col items-center gap-2">
                <FileCode2 className="h-8 w-8 text-slate-300" />
                <span>Select a prompt template from the left panel to view or edit.</span>
              </div>
            )}
          </div>
        </div>

        {/* CREATE NEW PROMPT MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200/80 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Add New System Prompt
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500">
                    Register a new prompt key for clinical AI feature integrations
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewPrompt} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Prompt Key (Unique Identifier)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LAB_INTERPRETATION"
                    required
                    className="w-full h-10 border border-slate-300 rounded-xl px-3 text-xs font-mono uppercase focus:border-[#08679F] focus:outline-none focus:ring-1 focus:ring-[#08679F]"
                    value={newPrompt.promptKey}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, promptKey: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab Report Interpreter"
                    required
                    className="w-full h-10 border border-slate-300 rounded-xl px-3 text-xs focus:border-[#08679F] focus:outline-none focus:ring-1 focus:ring-[#08679F]"
                    value={newPrompt.title}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of where this prompt is used"
                    className="w-full h-10 border border-slate-300 rounded-xl px-3 text-xs focus:border-[#08679F] focus:outline-none focus:ring-1 focus:ring-[#08679F]"
                    value={newPrompt.description}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Variables (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="patient_context, user_prompt"
                    className="w-full h-10 border border-slate-300 rounded-xl px-3 text-xs font-mono focus:border-[#08679F] focus:outline-none focus:ring-1 focus:ring-[#08679F]"
                    value={newPrompt.variables}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, variables: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Initial System Template
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="You are an expert clinical AI..."
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono focus:border-[#08679F] focus:outline-none focus:ring-1 focus:ring-[#08679F]"
                    value={newPrompt.template}
                    onChange={(e) =>
                      setNewPrompt({ ...newPrompt, template: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#08679F] text-white rounded-xl text-xs font-bold hover:bg-[#07557F] transition shadow-xs disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Create Prompt"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptManagement;