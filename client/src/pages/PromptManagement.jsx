import { useEffect, useState, useCallback, useRef } from "react";
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
import MedicalPlusBackground from "../components/MedicalPlusBackground";

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

  // Card 3D Tilt & Spotlight states for panels
  const headerCardRef = useRef(null);
  const [headerMousePos, setHeaderMousePos] = useState({ x: 0, y: 0 });
  const [headerCardRotate, setHeaderCardRotate] = useState({ x: 0, y: 0 });
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const leftCardRef = useRef(null);
  const [leftMousePos, setLeftMousePos] = useState({ x: 0, y: 0 });
  const [leftCardRotate, setLeftCardRotate] = useState({ x: 0, y: 0 });
  const [isLeftHovered, setIsLeftHovered] = useState(false);

  const rightCardRef = useRef(null);
  const [rightMousePos, setRightMousePos] = useState({ x: 0, y: 0 });
  const [rightCardRotate, setRightCardRotate] = useState({ x: 0, y: 0 });
  const [isRightHovered, setIsRightHovered] = useState(false);

  const handleMouseMove = (e, ref, setMousePos, setCardRotate) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setCardRotate({ x: rotateX, y: rotateY });
  };

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
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 flex items-center justify-center">
        {/* Interactive Medical + Canvas Hover Effect */}
        <MedicalPlusBackground />

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
        </div>

        {/* Sidebar */}
        <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
          <Sidebar />
        </div>

        <div className="relative z-10 p-8 text-center bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] max-w-md mx-auto my-6 font-sans animate-login-card">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#08679F] border-t-transparent"></div>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Loading AI Prompt Management Studio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900">
      {/* Interactive Medical + Canvas Hover Effect */}
      <MedicalPlusBackground />

      {/* Background decoration matching Login Page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      {/* Sidebar override */}
      <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto space-y-6 font-sans">
        {/* Top Header Navigation Bar with 3D Tilt & Spotlight */}
        <div className="perspective-[1000px]">
          <div
            ref={headerCardRef}
            onMouseMove={(e) => handleMouseMove(e, headerCardRef, setHeaderMousePos, setHeaderCardRotate)}
            onMouseEnter={() => setIsHeaderHovered(true)}
            onMouseLeave={() => {
              setIsHeaderHovered(false);
              setHeaderCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isHeaderHovered
                ? `rotateX(${headerCardRotate.x}deg) rotateY(${headerCardRotate.y}deg) translateZ(10px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isHeaderHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="animate-login-card relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 p-6 rounded-[22px] border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Spotlight Glow Effect */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isHeaderHovered ? 1 : 0,
                background: `radial-gradient(500px circle at ${headerMousePos.x}px ${headerMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />
            {/* Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isHeaderHovered ? 1 : 0,
                background: `radial-gradient(350px circle at ${headerMousePos.x}px ${headerMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10 flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#08679F] bg-slate-100/80 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 px-3 py-2 rounded-xl transition-all active:scale-95"
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
              className="group relative overflow-hidden z-10 inline-flex items-center justify-center gap-2 bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-[#08679F]/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)] active:translate-y-0 active:scale-[0.98] self-start md:self-auto"
            >
              <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              <Plus className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Create New Prompt</span>
            </button>
          </div>
        </div>

        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Prompt List */}
          <div className="perspective-[1000px]">
            <div
              ref={leftCardRef}
              onMouseMove={(e) => handleMouseMove(e, leftCardRef, setLeftMousePos, setLeftCardRotate)}
              onMouseEnter={() => setIsLeftHovered(true)}
              onMouseLeave={() => {
                setIsLeftHovered(false);
                setLeftCardRotate({ x: 0, y: 0 });
              }}
              style={{
                transform: isLeftHovered
                  ? `rotateX(${leftCardRotate.x}deg) rotateY(${leftCardRotate.y}deg) translateZ(10px)`
                  : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                transition: isLeftHovered
                  ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                  : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
              }}
              className="animate-login-card relative overflow-hidden p-5 rounded-[22px] border border-slate-200/80 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl space-y-3 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
            >
              {/* Spotlight Glow Effect */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                style={{
                  opacity: isLeftHovered ? 1 : 0,
                  background: `radial-gradient(500px circle at ${leftMousePos.x}px ${leftMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                }}
              />
              {/* Border Light Highlight */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                style={{
                  opacity: isLeftHovered ? 1 : 0,
                  background: `radial-gradient(350px circle at ${leftMousePos.x}px ${leftMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                  maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                }}
              />

              <div className="relative z-10 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Layers className="h-3.5 w-3.5 text-[#08679F]" />
                <span>System Prompt Keys ({prompts.length})</span>
              </div>

              <div className="relative z-10 space-y-2.5">
                {prompts.map((p) => {
                  const isSelected = selectedPrompt?.prompt_key === p.prompt_key;
                  return (
                    <div
                      key={p.prompt_key}
                      onClick={() => selectPrompt(p)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-[#08679F] bg-sky-50/80 shadow-xs translate-x-1"
                          : "border-slate-200/80 bg-white/70 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-bold text-slate-900 text-xs line-clamp-1">
                          {p.title || p.prompt_key}
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md shrink-0 border border-slate-200/60">
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
            </div>
          </div>

          {/* Prompt Editor Panel */}
          <div className="md:col-span-2 perspective-[1000px]">
            <div
              ref={rightCardRef}
              onMouseMove={(e) => handleMouseMove(e, rightCardRef, setRightMousePos, setRightCardRotate)}
              onMouseEnter={() => setIsRightHovered(true)}
              onMouseLeave={() => {
                setIsRightHovered(false);
                setRightCardRotate({ x: 0, y: 0 });
              }}
              style={{
                transform: isRightHovered
                  ? `rotateX(${rightCardRotate.x}deg) rotateY(${rightCardRotate.y}deg) translateZ(10px)`
                  : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                transition: isRightHovered
                  ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                  : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
              }}
              className="animate-login-card relative overflow-hidden bg-white/80 border border-slate-200/80 rounded-[22px] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
            >
              {/* Spotlight Glow Effect */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                style={{
                  opacity: isRightHovered ? 1 : 0,
                  background: `radial-gradient(600px circle at ${rightMousePos.x}px ${rightMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                }}
              />
              {/* Border Light Highlight */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                style={{
                  opacity: isRightHovered ? 1 : 0,
                  background: `radial-gradient(400px circle at ${rightMousePos.x}px ${rightMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                  maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                }}
              />

              {selectedPrompt ? (
                <div className="relative z-10 space-y-5">
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
                      className="w-full border border-slate-300 rounded-xl p-4 font-mono text-xs leading-relaxed text-slate-800 bg-white/70 focus:bg-white focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 outline-none transition-all duration-150"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <Variable className="h-4 w-4 text-[#08679F] shrink-0" />
                      <span className="font-bold text-slate-700">Variables:</span>
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {JSON.stringify(parseVariables(selectedPrompt.variables))}
                      </span>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="group relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#08679F] hover:bg-[#07557F] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)] active:translate-y-0 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#08679F]/20"
                    >
                      <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                      <Save className="h-4 w-4 relative z-10" />
                      <span className="relative z-10">
                        {saving ? "Saving New Version..." : "Save Prompt Version"}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 text-slate-400 py-16 text-center text-xs font-medium flex flex-col items-center gap-2">
                  <FileCode2 className="h-8 w-8 text-slate-300" />
                  <span>Select a prompt template from the left panel to view or edit.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CREATE NEW PROMPT MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-xl rounded-[22px] shadow-2xl max-w-lg w-full p-6 border border-slate-200/80 space-y-5 animate-login-card">
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
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
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
                    className="w-full h-10 border border-slate-300 rounded-xl px-3 text-xs font-mono uppercase bg-white/80 focus:bg-white focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 transition-all duration-150"
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
                    className="w-full h-10 border border-slate-300 rounded-xl px-3 text-xs bg-white/80 focus:bg-white focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 transition-all duration-150"
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
                    className="w-full h-10 border border-slate-300 rounded-xl px-3 text-xs bg-white/80 focus:bg-white focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 transition-all duration-150"
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
                    className="w-full h-10 border border-slate-300 rounded-xl px-3 text-xs font-mono bg-white/80 focus:bg-white focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 transition-all duration-150"
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
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono bg-white/80 focus:bg-white focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 transition-all duration-150"
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
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#08679F] text-white rounded-xl text-xs font-bold hover:bg-[#07557F] transition-all shadow-md shadow-[#08679F]/20 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Create Prompt"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Animation keyframes matching Login Page */}
      <style>{`
        @keyframes loginCardIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-login-card {
          animation: loginCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-login-card {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default PromptManagement;