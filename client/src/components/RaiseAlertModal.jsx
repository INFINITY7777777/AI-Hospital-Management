import { useState } from "react";
// Change this line: Use the central api instance instead of raw axios
import api from "../services/api"; 

const RaiseAlertModal = ({ isOpen, onClose, patientId, patientName, onAlertSent }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "critical"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      setError("Please enter an alert message.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Replaced raw axios.post with api.post
      // Requests now hit http://localhost:5000/api/notifications and auto-attach Bearer token
      await api.post("/notifications", {
        patientId,
        title: formData.title.trim() || `Critical Alert - ${patientName}`,
        message: formData.message.trim(),
        type: formData.type
      });

      setLoading(false);
      setFormData({ title: "", message: "", type: "critical" });
      if (onAlertSent) onAlertSent();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to trigger patient alert.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
            ⚠️ Raise Critical Patient Alert
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-semibold text-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-semibold uppercase text-gray-500">
              Patient
            </label>
            <input
              type="text"
              value={patientName || ""}
              disabled
              className="w-full px-3 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed font-medium"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase text-gray-500">
              Alert Level
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="critical">🚨 Critical (Urgent Response Needed)</option>
              <option value="warning">⚠️ Warning (Clinical Priority)</option>
              <option value="info">ℹ️ Info (General Broadcast)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase text-gray-500">
              Alert Title (Optional)
            </label>
            <input
              type="text"
              name="title"
              placeholder={`Default: Critical Alert - ${patientName}`}
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold uppercase text-gray-500">
              Alert Details / Reason *
            </label>
            <textarea
              name="message"
              rows="4"
              required
              placeholder="State patient condition changes, vital drops, or immediate needs..."
              value={formData.message}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Broadcasting..." : "Broadcast Alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseAlertModal;