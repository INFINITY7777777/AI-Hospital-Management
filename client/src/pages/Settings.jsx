import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const [settings, setSettings] = useState({ hospital_name: "", notifications_enabled: true, theme_preference: "light" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/settings").then((res) => {
      if (res.data.settings) setSettings(res.data.settings);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">⚙️ System Settings</h1>
            <p className="text-xs text-gray-500">Configure application preferences and system environment</p>
          </div>

          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-xl space-y-4">
            {saved && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl">Settings saved successfully!</div>}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Hospital / Clinic Name</label>
              <input
                type="text"
                className="w-full p-2.5 border rounded-xl text-xs"
                value={settings.hospital_name || ""}
                onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-gray-700">System Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                className="w-4 h-4"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-blue-700">
              Save Preferences
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}