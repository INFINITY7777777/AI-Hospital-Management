import { useState } from "react";
import api from "../services/api";

function PatientAIChat({ patientId, patientName }) {
    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: `Hello! I am the AI Clinical Assistant for ${patientName || "this patient"}. Ask me anything about their medical records, admissions, or clinical notes.`
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

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
                    text: error.response?.data?.error || "Unable to reach AI service right now."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 flex flex-col h-125">
            {/* Header */}
            <div className="bg-purple-600 text-white p-4 rounded-t-xl font-semibold flex items-center justify-between">
                <span>🤖 AI Patient Assistant</span>
                <span className="text-xs bg-purple-700 px-2 py-1 rounded">Free API Engine</span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                                msg.sender === "user"
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                            }`}
                        >
                            {msg.text}
                            {msg.providerUsed && (
                                <div className="text-[10px] text-gray-400 mt-1 text-right">
                                    Served by: {msg.providerUsed}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-500 p-3 rounded-lg text-sm italic">
                            Analyzing patient records...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about diagnoses, history, or notes..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default PatientAIChat;