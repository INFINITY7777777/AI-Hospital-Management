import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Building2,
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
  Save,
  RotateCcw,
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
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [mpinForm, setMpinForm] = useState({ currentMpin: "", newMpin: "" });
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
      return notify(
        "Please select a user and specify a temporary password.",
        true
      );
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Password & MPIN", icon: ShieldCheck },
    { id: "system", label: "Branding & Shift Timeout", icon: Building2 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-800">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-[22px] border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚙️</span>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Settings & System Security
                  </h1>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                  Configure account credentials, security MPIN, shift timeouts, and hospital branding
                </p>
              </div>

              <button
                onClick={handleLogout}
                type="button"
                className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 h-10 px-4 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.99] cursor-pointer shrink-0"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Feedback Alerts */}
            {statusMsg && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-800 text-xs font-semibold rounded-2xl border border-rose-200 shadow-xs">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#08679F] text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="bg-white rounded-[22px] border border-slate-200/80 p-12 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#08679F] border-t-transparent"></div>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Loading system configurations...
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {/* TAB 1: PROFILE */}
                {activeTab === "profile" && (
                  <form
                    onSubmit={handleProfileSubmit}
                    className="bg-white p-6 sm:p-8 rounded-[22px] border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-5"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        User Profile Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                            value={profile.name || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Email Address{" "}
                          <span className="text-slate-400 font-normal">
                            (Read Only)
                          </span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 cursor-not-allowed"
                            value={profile.email || ""}
                            disabled
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                            value={profile.phone || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Department
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                            value={profile.department || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                department: e.target.value,
                              })
                            }
                            placeholder="e.g. Cardiology"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full h-10 bg-[#08679F] hover:bg-[#07557F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#08679F]/20 transition-all duration-150 active:scale-[0.99] cursor-pointer"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Profile Details</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: SECURITY */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    {/* Password Form */}
                    <form
                      onSubmit={handlePasswordSubmit}
                      className="bg-white p-6 sm:p-8 rounded-[22px] border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4"
                    >
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Change Password
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Current Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="password"
                              placeholder="••••••••"
                              required
                              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                              value={passwords.currentPassword}
                              onChange={(e) =>
                                setPasswords({
                                  ...passwords,
                                  currentPassword: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            New Password
                          </label>
                          <div className="relative">
                            <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="password"
                              placeholder="••••••••"
                              required
                              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                              value={passwords.newPassword}
                              onChange={(e) =>
                                setPasswords({
                                  ...passwords,
                                  newPassword: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full h-10 bg-[#08679F] hover:bg-[#07557F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#08679F]/20 transition-all duration-150 active:scale-[0.99] cursor-pointer"
                        >
                          <Lock className="h-4 w-4" />
                          <span>Update Password</span>
                        </button>
                      </div>
                    </form>

                    {/* Security MPIN Form */}
                    <form
                      onSubmit={handleMpinSubmit}
                      className="bg-white p-6 sm:p-8 rounded-[22px] border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Security MPIN
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            profile.is_mpin_enabled
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                              : "bg-amber-50 border border-amber-200 text-amber-700"
                          }`}
                        >
                          {profile.is_mpin_enabled
                            ? "MPIN Active"
                            : "Not Configured"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.is_mpin_enabled && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Current MPIN
                            </label>
                            <div className="relative">
                              <Smartphone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                              <input
                                type="password"
                                maxLength={6}
                                placeholder="••••"
                                required
                                className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 tracking-widest shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                                value={mpinForm.currentMpin}
                                onChange={(e) =>
                                  setMpinForm({
                                    ...mpinForm,
                                    currentMpin: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}

                        <div className={!profile.is_mpin_enabled ? "sm:col-span-2" : ""}>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {profile.is_mpin_enabled
                              ? "New 4–6 Digit MPIN"
                              : "Enter 4–6 Digit MPIN"}
                          </label>
                          <div className="relative">
                            <Smartphone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="password"
                              maxLength={6}
                              placeholder="••••"
                              required
                              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 tracking-widest shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                              value={mpinForm.newMpin}
                              onChange={(e) =>
                                setMpinForm({
                                  ...mpinForm,
                                  newMpin: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-all duration-150 active:scale-[0.99] cursor-pointer"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>
                            {profile.is_mpin_enabled
                              ? "Update Security MPIN"
                              : "Set Security MPIN"}
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* ADMIN RECOVERY TOOL */}
                    {profile.role === "admin" && (
                      <form
                        onSubmit={handleAdminPasswordReset}
                        className="bg-white p-6 sm:p-8 rounded-[22px] border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4"
                      >
                        <div className="border-b border-slate-100 pb-3">
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Admin Recovery: Reset User Password
                          </h2>
                          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                            Reset credentials for any registered user account
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Select User Account
                            </label>
                            <select
                              value={resetTargetUser}
                              onChange={(e) => setResetTargetUser(e.target.value)}
                              required
                              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 cursor-pointer"
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
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              New Temporary Password
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. AdminPass123"
                              value={tempPasswordInput}
                              onChange={(e) =>
                                setTempPasswordInput(e.target.value)
                              }
                              required
                              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all duration-150 active:scale-[0.99] cursor-pointer"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Reset User Password</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* TAB 3: SYSTEM */}
                {activeTab === "system" && (
                  <form
                    onSubmit={handlePreferencesSubmit}
                    className="bg-white p-6 sm:p-8 rounded-[22px] border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Hospital Branding & Shift Rules
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Hospital / Clinic Name
                        </label>
                        <input
                          type="text"
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                          value={settings.hospital_name || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              hospital_name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Hospital Phone
                        </label>
                        <input
                          type="text"
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                          value={settings.hospital_phone || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              hospital_phone: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          System Timezone
                        </label>
                        <select
                          className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 cursor-pointer"
                          value={settings.timezone || "UTC"}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              timezone: e.target.value,
                            })
                          }
                        >
                          <option value="UTC">
                            UTC (Coordinated Universal Time)
                          </option>
                          <option value="EST">EST (Eastern Standard Time)</option>
                          <option value="PST">PST (Pacific Standard Time)</option>
                          <option value="IST">IST (Indian Standard Time)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Auto Logout Timeout
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                          <select
                            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs transition-all focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 cursor-pointer"
                            value={settings.auto_logout_hours || 8}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                auto_logout_hours: parseInt(e.target.value),
                              })
                            }
                          >
                            <option value={1}>1 Hour Inactivity</option>
                            <option value={4}>4 Hours (Half Shift)</option>
                            <option value={8}>8 Hours (Full Working Shift)</option>
                            <option value={12}>12 Hours (Extended Shift)</option>
                            <option value={24}>24 Hours (Full Day)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full h-10 bg-[#08679F] hover:bg-[#07557F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#08679F]/20 transition-all duration-150 active:scale-[0.99] cursor-pointer"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save System Preferences</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}