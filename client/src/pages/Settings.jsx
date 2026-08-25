import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    department: "",
    avatar_url: "",
    is_mpin_enabled: false,
  });
  const [settings, setSettings] = useState({
    hospital_name: "General Hospital",
    hospital_phone: "",
    hospital_address: "",
    timezone: "UTC",
    auto_logout_hours: 8,
    inapp_notifications: true,
    email_notifications: true,
  });

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [mpinInput, setMpinInput] = useState("");
  const [adminMpinVerify, setAdminMpinVerify] = useState("");
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchSettingsData = async () => {
      try {
        const res = await api.get("/settings");
        if (!isMounted) return;

        if (res.data.profile) setProfile(res.data.profile);
        if (res.data.settings) setSettings(res.data.settings);

        if (res.data.profile?.role === "admin") {
          const usersRes = await api.get("/settings/users");
          if (isMounted) {
            setUsersList(usersRes.data.users || []);
          }
        }
      } catch (err) {
        console.error("[Settings Fetch Error]:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettingsData();

    return () => {
      isMounted = false;
    };
  }, []);

  const notify = (msg, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    } else {
      setStatusMsg(msg);
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings/profile", profile);
      notify("Profile details updated!");
    } catch (err) {
      notify(err.response?.data?.error || "Failed to update profile", true);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings/password", passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      notify("Password updated successfully!");
    } catch (err) {
      notify(err.response?.data?.error || "Password change failed", true);
    }
  };

  const handleMpinSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings/mpin", { mpin: mpinInput });
      setMpinInput("");
      setProfile((prev) => ({ ...prev, is_mpin_enabled: true }));
      notify("Security MPIN configured successfully!");
    } catch (err) {
      notify(err.response?.data?.error || "MPIN setup failed", true);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings/preferences", settings);
      notify("System preferences and working shift timeout saved!");
    } catch (err) {
      notify(err.response?.data?.error || "Failed to update preferences", true);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    if (!adminMpinVerify) {
      return notify("Admin Security MPIN required in header field below to modify roles!", true);
    }
    try {
      await api.put(
        "/settings/user-role",
        { targetUserId, newRole },
        { headers: { mpin: adminMpinVerify } }
      );
      setUsersList((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u)));
      notify("User role successfully updated!");
    } catch (err) {
      notify(err.response?.data?.error || "Role update rejected by security", true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // Changed from "/login" to matching root login route
  };
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">⚙️ Settings & System Security</h1>
              <p className="text-xs text-gray-500">Configure profile, shift inactivity rules, branding, and role access</p>
            </div>
            <button onClick={handleLogout} className="bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-rose-100">
              Logout
            </button>
          </div>

          {statusMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-medium border border-emerald-200">{statusMsg}</div>}
          {errorMsg && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium border border-rose-200">{errorMsg}</div>}

          <div className="flex space-x-2 border-b border-gray-200 pb-2">
            {[
              { id: "profile", label: "Profile" },
              { id: "security", label: "Password & MPIN" },
              { id: "system", label: "Branding & Shift Timeout" },
              { id: "notifications", label: "Notifications" },
              ...(profile.role === "admin" ? [{ id: "community", label: "Community & Roles (Admin)" }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === tab.id ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-xs text-gray-400 p-4">Loading system settings...</p>
          ) : (
            <div className="max-w-2xl">
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                    <input className="w-full p-2.5 border rounded-xl text-xs" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email (Read Only)</label>
                    <input className="w-full p-2.5 border rounded-xl text-xs bg-gray-100 text-gray-500 cursor-not-allowed" value={profile.email || ""} disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input className="w-full p-2.5 border rounded-xl text-xs" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                      <input className="w-full p-2.5 border rounded-xl text-xs" value={profile.department || ""} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-blue-700">Save Profile</button>
                </form>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-gray-800 uppercase">Change Password</h3>
                    <input type="password" placeholder="Current Password" required className="w-full p-2.5 border rounded-xl text-xs" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                    <input type="password" placeholder="New Password" required className="w-full p-2.5 border rounded-xl text-xs" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                    <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-blue-700">Update Password</button>
                  </form>

                  <form onSubmit={handleMpinSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-gray-800 uppercase">Security MPIN Setup</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${profile.is_mpin_enabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {profile.is_mpin_enabled ? "MPIN Active" : "Not Configured"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Configure a 4-6 digit MPIN for quick authorization and sensitive actions.</p>
                    <input type="password" maxLength={6} placeholder="Enter 4-6 Digit MPIN" required className="w-full p-2.5 border rounded-xl text-xs tracking-widest font-mono" value={mpinInput} onChange={(e) => setMpinInput(e.target.value)} />
                    <button type="submit" className="w-full bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-900">Set MPIN</button>
                  </form>
                </div>
              )}

              {activeTab === "system" && (
                <form onSubmit={handlePreferencesSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase">Hospital Branding & Inactivity Rules</h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Hospital / Clinic Name</label>
                    <input className="w-full p-2.5 border rounded-xl text-xs" value={settings.hospital_name || ""} onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
                      <input className="w-full p-2.5 border rounded-xl text-xs" value={settings.hospital_phone || ""} onChange={(e) => setSettings({ ...settings, hospital_phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Timezone</label>
                      <select className="w-full p-2.5 border rounded-xl text-xs" value={settings.timezone || "UTC"} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
                        <option value="UTC">UTC</option>
                        <option value="EST">EST</option>
                        <option value="PST">PST</option>
                        <option value="IST">IST</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Auto Logout / Shift Inactivity Duration</label>
                    <select className="w-full p-2.5 border rounded-xl text-xs" value={settings.auto_logout_hours || 8} onChange={(e) => setSettings({ ...settings, auto_logout_hours: parseInt(e.target.value) })}>
                      <option value={1}>1 Hour Inactivity</option>
                      <option value={4}>4 Hours (Half Shift)</option>
                      <option value={8}>8 Hours (Full Working Shift)</option>
                      <option value={12}>12 Hours (Extended Shift)</option>
                      <option value={24}>24 Hours (Full Day)</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-blue-700">Save Preferences</button>
                </form>
              )}

              {activeTab === "notifications" && (
                <form onSubmit={handlePreferencesSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase">Alert Preferences</h3>
                  <label className="flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span>In-App Dashboard Alerts</span>
                    <input type="checkbox" checked={settings.inapp_notifications} onChange={(e) => setSettings({ ...settings, inapp_notifications: e.target.checked })} />
                  </label>
                  <label className="flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span>Email Alerts & Inventory Updates</span>
                    <input type="checkbox" checked={settings.email_notifications} onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })} />
                  </label>
                  <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-blue-700">Save Notification Settings</button>
                </form>
              )}

              {activeTab === "community" && profile.role === "admin" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 space-y-2">
                    <p className="font-semibold">⚠️ Admin MPIN Required for Role Mutation</p>
                    <input
                      type="password"
                      placeholder="Enter Admin MPIN to authorize changes"
                      className="w-full p-2 border rounded-xl text-xs font-mono"
                      value={adminMpinVerify}
                      onChange={(e) => setAdminMpinVerify(e.target.value)}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                          <th className="p-3">User</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">MPIN Status</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => (
                          <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="p-3">
                              <p className="font-semibold text-gray-800">{u.name}</p>
                              <p className="text-[10px] text-gray-400">{u.email}</p>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold uppercase">{u.role}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${u.is_mpin_enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                {u.is_mpin_enabled ? "Configured" : "None"}
                              </span>
                            </td>
                            <td className="p-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                disabled={u.id === profile.id}
                                className="p-1.5 border rounded-lg text-xs bg-white disabled:bg-gray-100"
                              >
                                <option value="staff">Staff</option>
                                <option value="doctor">Doctor</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}