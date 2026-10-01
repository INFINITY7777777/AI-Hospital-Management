import { useState, useRef, useEffect } from "react";
import api from "../services/api";

function PatientAIChat({ patientId, patientName }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hello! I am the AI Clinical Assistant for ${
        patientName || "this patient"
      }. Ask me anything about their medical records, admissions, or clinical notes.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await api.post("/ai/patient-chat", {
        patientId,
        prompt: userText
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.data.response,
          providerUsed: res.data.provider
        }
      ]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            error.response?.data?.error ||
            "Unable to reach AI service right now."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col h-130 overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-linear-to-r from-[#08679F] to-[#065381] text-white p-4 px-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
              CLINICAL INTELLIGENCE
            </h3>
            <p className="text-sm font-bold leading-none mt-0.5">
              AI Patient Assistant
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold tracking-wider uppercase bg-white/15 text-white border border-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
          AI Engine Active
        </span>
      </div>

      {/* Chat Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[82%] p-3.5 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed transition-all ${
                msg.sender === "user"
                  ? "bg-[#08679F] text-white rounded-2xl rounded-tr-sm shadow-sm font-medium"
                  : "bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
              }`}
            >
              {msg.text}
              {msg.providerUsed && (
                <div className="text-[10px] text-slate-400 mt-2 font-semibold pt-1 border-t border-slate-100 flex items-center justify-end gap-1">
                  <span>Engine:</span>
                  <span className="text-slate-600">{msg.providerUsed}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 border border-slate-200/80 p-3.5 rounded-2xl rounded-tl-sm text-xs font-medium flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#08679F] animate-ping" />
              Analyzing medical records and timeline...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about diagnoses, history, or notes..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-[#08679F] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#065381] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <span>Send</span>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default PatientAIChat;