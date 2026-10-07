import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Building2,
  Bell,
  Users,
  LogOut,
  KeyRound,
  Lock,
  Smartphone,
  Clock,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Save,
  RotateCcw
} from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
  const [mpinForm, setMpinForm] = useState({ currentMpin: "", newMpin: "" });
  const [adminMpinVerify, setAdminMpinVerify] = useState("");
  const [usersList, setUsersList] = useState([]);

  // Admin Reset Password State
  const [resetTargetUser, setResetTargetUser] = useState("");
  const [tempPasswordInput, setTempPasswordInput] = useState("");

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
      const res = await api.put("/settings/profile", profile);
      if (res.data.profile) {
        setProfile((prev) => ({ ...prev, ...res.data.profile }));
      }
      notify("Profile details updated successfully!");
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
      await api.put("/settings/mpin", mpinForm);
      setMpinForm({ currentMpin: "", newMpin: "" });
      setProfile((prev) => ({ ...prev, is_mpin_enabled: true }));
      notify("Security MPIN updated successfully!");
    } catch (err) {
      notify(err.response?.data?.error || "MPIN setup failed", true);
    }
  };

  const handleAdminPasswordReset = async (e) => {
    e.preventDefault();
    if (!resetTargetUser || !tempPasswordInput) {
      return notify("Please select a user and specify a temporary password.", true);
    }

    try {
      const res = await api.put("/auth/admin/reset-password", {
        targetUserId: resetTargetUser,
        tempPassword: tempPasswordInput,
      });

      setTempPasswordInput("");
      setResetTargetUser("");
      notify(res.data.message || "Password reset successfully!");
    } catch (err) {
      notify(err.response?.data?.error || "Admin password reset failed.", true);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings/preferences", settings);
      notify("System preferences saved successfully!");
    } catch (err) {
      notify(err.response?.data?.error || "Failed to update preferences", true);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    if (!adminMpinVerify) {
      return notify("Admin Security MPIN required below to modify user roles!", true);
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
    navigate("/");
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Password & MPIN", icon: ShieldCheck },
    { id: "system", label: "Branding & Shift Timeout", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    ...(profile.role === "admin" ? [{ id: "community", label: "Community & Roles", icon: Users }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#F6F8FC] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Settings & System Security
                </h1>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Configure account details, shift inactivity rules, clinical branding, and role access
              </p>
            </div>

            <button
              onClick={handleLogout}
              type="button"
              className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {statusMsg && (
            <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#08679F] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#08679F] border-t-transparent"></div>
              <p className="mt-2 text-xs font-medium text-slate-500">Loading system configurations...</p>
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              {/* TAB 1: PROFILE */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      User Profile Details
                    </h2>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                        value={profile.name || ""}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address <span className="text-slate-400 font-normal">(Read Only)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 font-medium cursor-not-allowed"
                        value={profile.email || ""}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                          value={profile.phone || ""}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                          value={profile.department || ""}
                          onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                          placeholder="e.g. Cardiology"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-[#08679F] hover:bg-[#07557F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Profile Details</span>
                  </button>
                </form>
              )}

              {/* TAB 2: SECURITY */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  {/* Password Form */}
                  <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Change Password</h2>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 bg-[#08679F] hover:bg-[#07557F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Update Password</span>
                    </button>
                  </form>

                  {/* Security MPIN Form */}
                  <form onSubmit={handleMpinSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Security MPIN</h2>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          profile.is_mpin_enabled
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : "bg-amber-50 border border-amber-200 text-amber-700"
                        }`}
                      >
                        {profile.is_mpin_enabled ? "MPIN Active" : "Not Configured"}
                      </span>
                    </div>

                    {profile.is_mpin_enabled && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Current MPIN</label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="password"
                            maxLength={6}
                            placeholder="••••"
                            required
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono tracking-widest"
                            value={mpinForm.currentMpin}
                            onChange={(e) => setMpinForm({ ...mpinForm, currentMpin: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {profile.is_mpin_enabled ? "New 4–6 Digit MPIN" : "Enter 4–6 Digit MPIN"}
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          maxLength={6}
                          placeholder="••••"
                          required
                          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono tracking-widest"
                          value={mpinForm.newMpin}
                          onChange={(e) => setMpinForm({ ...mpinForm, newMpin: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>{profile.is_mpin_enabled ? "Update Security MPIN" : "Set Security MPIN"}</span>
                    </button>
                  </form>

                  {/* ADMIN RECOVERY TOOL */}
                  {profile.role === "admin" && (
                    <form onSubmit={handleAdminPasswordReset} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Admin Recovery: Reset Forgotten User Password
                        </h2>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                          Reset credentials for any user account (including your own)
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Select User Account</label>
                          <select
                            value={resetTargetUser}
                            onChange={(e) => setResetTargetUser(e.target.value)}
                            required
                            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                          >
                            <option value="">Select Account</option>
                            {usersList.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.email}) - {u.role}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">New Temporary Password</label>
                          <input
                            type="text"
                            placeholder="Enter new password (e.g. AdminPass123)"
                            value={tempPasswordInput}
                            onChange={(e) => setTempPasswordInput(e.target.value)}
                            required
                            className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Reset User Password</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: SYSTEM */}
              {activeTab === "system" && (
                <form onSubmit={handlePreferencesSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Hospital Branding & Shift Rules
                    </h2>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Name</label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                      value={settings.hospital_name || ""}
                      onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Phone</label>
                      <input
                        type="text"
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                        value={settings.hospital_phone || ""}
                        onChange={(e) => setSettings({ ...settings, hospital_phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">System Timezone</label>
                      <select
                        className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                        value={settings.timezone || "UTC"}
                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      >
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="EST">EST (Eastern Standard Time)</option>
                        <option value="PST">PST (Pacific Standard Time)</option>
                        <option value="IST">IST (Indian Standard Time)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Auto Logout Timeout</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <select
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-medium"
                        value={settings.auto_logout_hours || 8}
                        onChange={(e) => setSettings({ ...settings, auto_logout_hours: parseInt(e.target.value) })}
                      >
                        <option value={1}>1 Hour Inactivity</option>
                        <option value={4}>4 Hours (Half Shift)</option>
                        <option value={8}>8 Hours (Full Working Shift)</option>
                        <option value={12}>12 Hours (Extended Shift)</option>
                        <option value={24}>24 Hours (Full Day)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-[#08679F] hover:bg-[#07557F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save System Preferences</span>
                  </button>
                </form>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <form onSubmit={handlePreferencesSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Alert & Communication Settings
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div>
                        <span className="block text-xs font-bold text-slate-800">In-App Dashboard Alerts</span>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-[#08679F]"
                        checked={settings.inapp_notifications}
                        onChange={(e) => setSettings({ ...settings, inapp_notifications: e.target.checked })}
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div>
                        <span className="block text-xs font-bold text-slate-800">Email Notifications</span>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-[#08679F]"
                        checked={settings.email_notifications}
                        onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-[#08679F] hover:bg-[#07557F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Notification Settings</span>
                  </button>
                </form>
              )}

              {/* TAB 5: ADMIN COMMUNITY */}
              {activeTab === "community" && profile.role === "admin" && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      User Management & Access Control
                    </h2>
                  </div>

                  <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Admin MPIN Verification Required</span>
                    </div>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Enter Admin MPIN"
                      className="w-full h-9 px-3 rounded-lg border border-amber-300/80 bg-white text-xs font-mono tracking-widest text-slate-800"
                      value={adminMpinVerify}
                      onChange={(e) => setAdminMpinVerify(e.target.value)}
                    />
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold">
                          <th className="p-3">User</th>
                          <th className="p-3">Current Role</th>
                          <th className="p-3">MPIN Status</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <p className="font-bold text-slate-800">{u.name}</p>
                              <p className="text-[10px] font-medium text-slate-400">{u.email}</p>
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100 uppercase">
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.is_mpin_enabled
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}
                              >
                                {u.is_mpin_enabled ? "Configured" : "None"}
                              </span>
                            </td>
                            <td className="p-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                disabled={u.id === profile.id}
                                className="h-8 px-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 disabled:bg-slate-100"
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