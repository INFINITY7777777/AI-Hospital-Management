import { useCallback, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Trash2,
  Building,
  Mail,
  User,
  RefreshCw,
  AlertCircle,
  UserPlus,
  Lock,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deactivatingUserId, setDeactivatingUserId] = useState(null);

  // Admin MPIN state
  const [adminMpin, setAdminMpin] = useState("");
  const [isMpinVerified, setIsMpinVerified] = useState(false);
  const [verifyingMpin, setVerifyingMpin] = useState(false);

  // 3D Tilt & Spotlight state for main card container
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMoveCard = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;

    setCardRotate({ x: rotateX, y: rotateY });
  };

  const getErrorMessage = (error, fallback) =>
    error.response?.data?.error ||
    error.response?.data?.message ||
    fallback;

  const fetchUsers = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg("");

    try {
      const response = await api.get("/admin/users");
      if (!Array.isArray(response.data)) {
        throw new Error("Unexpected response received while loading users.");
      }
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setErrorMsg(getErrorMessage(error, "Failed to load active users."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleVerifyMpin = async (e) => {
    e.preventDefault();
    if (!adminMpin || adminMpin.length < 4) {
      setErrorMsg("Please enter a valid 4 to 6 digit Admin MPIN.");
      return;
    }

    setVerifyingMpin(true);
    setErrorMsg("");

    try {
      await api.post("/admin/verify-mpin", { mpin: adminMpin });
      setIsMpinVerified(true);
      await fetchUsers();
    } catch (error) {
      console.error("MPIN Verification Failed:", error);
      setErrorMsg(getErrorMessage(error, "Invalid Admin MPIN. Access denied."));
    } finally {
      setVerifyingMpin(false);
    }
  };

  const refreshUsers = () => {
    if (isMpinVerified) {
      fetchUsers(true);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const currentUser = users.find((user) => user.id === userId);
    if (!currentUser || currentUser.role === newRole) return;

    setUpdatingUserId(userId);
    setErrorMsg("");

    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
      setErrorMsg(getErrorMessage(error, "Failed to update role."));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeactivate = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this user account?"
    );
    if (!confirmed) return;

    setDeactivatingUserId(userId);
    setErrorMsg("");

    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      setErrorMsg(getErrorMessage(error, "Failed to deactivate user."));
    } finally {
      setDeactivatingUserId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans text-slate-900 antialiased py-8 px-4 sm:px-6 lg:px-8">
      {/* Interactive Medical + Canvas Hover Effect */}
      <MedicalPlusBackground />

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-6 perspective-[1000px]">
        {/* Main Glass Card container with 3D Tilt */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMoveCard}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setCardRotate({ x: 0, y: 0 });
          }}
          style={{
            transform: isHovered
              ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(5px)`
              : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
            transition: isHovered
              ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
              : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
          }}
          className="animate-login-card relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8 space-y-6 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
        >
          {/* Dynamic Spotlight Glow effect */}
          <div
            className="pointer-events-none absolute -inset-px rounded-[26px] opacity-0 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
            }}
          />

          {/* Card Border Light Highlight */}
          <div
            className="pointer-events-none absolute -inset-px rounded-[26px] opacity-0 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
              maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
              padding: "1px",
            }}
          />

          {/* Back to dashboard button */}
          <div className="relative z-10">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/90 border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.99]"
            >
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Page header */}
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#08679F]" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  User &amp; Role Management
                </h1>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Manage active medical staff, system authorizations, and account states
              </p>
            </div>

            {isMpinVerified && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/register")}
                  type="button"
                  className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-[#08679F] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#065380] active:scale-95 cursor-pointer"
                >
                  <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  <UserPlus className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Add Staff Member</span>
                </button>

                <button
                  onClick={refreshUsers}
                  type="button"
                  disabled={refreshing}
                  className="rounded-xl bg-slate-100/80 p-2 text-slate-600 transition-all hover:bg-slate-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  title="Refresh List"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50/80 px-3.5 py-1.5 text-xs font-bold text-[#08679F] shadow-xs backdrop-blur-md">
                  <ShieldCheck className="h-4 w-4" />
                  Total Active: {users.length}
                </span>
              </div>
            )}
          </div>

          {/* Error alert */}
          {errorMsg && (
            <div className="relative z-10 flex items-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50/90 p-4 text-xs font-semibold text-rose-800 shadow-xs backdrop-blur-md">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg("")}
                className="ml-auto text-rose-700 underline underline-offset-2 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ADMIN MPIN VERIFICATION SECTION */}
          <div className="relative z-10 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-6 shadow-xs backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <Lock className="h-4 w-4 text-amber-700" />
              <span>Admin MPIN Verification Required</span>
            </div>

            {!isMpinVerified ? (
              <form onSubmit={handleVerifyMpin} className="flex gap-3 max-w-md">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter Admin MPIN"
                  value={adminMpin}
                  onChange={(e) => setAdminMpin(e.target.value.replace(/\D/g, ""))}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-4 font-mono text-sm tracking-widest text-slate-800 outline-none transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#08679F] focus:ring-2 focus:ring-[#08679F]/20"
                />
                <button
                  type="submit"
                  disabled={verifyingMpin || !adminMpin}
                  className="group relative overflow-hidden inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#08679F] px-5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#065380] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  <span className="relative z-10">{verifyingMpin ? "Verifying..." : "Verify MPIN"}</span>
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Admin MPIN verified successfully. Active user access granted.</span>
              </div>
            )}
          </div>

          {/* USERS TABLE - ONLY DISPLAYED WHEN VERIFIED */}
          {isMpinVerified && (
            <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xs backdrop-blur-md">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#08679F] border-t-transparent" />
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Loading active users...
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        <th className="p-4">User Details</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Department</th>
                        <th className="p-4">Assigned Role</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-[#08679F]">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">
                                  {user.full_name}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400">
                                  ID: #{user.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-medium text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span>{user.email}</span>
                            </div>
                          </td>

                          <td className="p-4 font-medium text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Building className="h-3.5 w-3.5 text-slate-400" />
                              <span>{user.department || "N/A"}</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <select
                              value={user.role}
                              disabled={
                                updatingUserId === user.id ||
                                deactivatingUserId === user.id
                              }
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value)
                              }
                              className="h-8 cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold capitalize text-slate-700 focus:border-[#08679F] focus:outline-none focus:ring-1 focus:ring-[#08679F] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="admin">Admin</option>
                              <option value="doctor">Doctor</option>
                              <option value="nurse">Nurse</option>
                              <option value="staff">Staff</option>
                              <option value="support staff">Support Staff</option>
                            </select>

                            {updatingUserId === user.id && (
                              <span className="ml-2 text-[10px] text-slate-500">
                                Saving...
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <button
                              type="button"
                              disabled={
                                deactivatingUserId === user.id ||
                                updatingUserId === user.id
                              }
                              onClick={() => handleDeactivate(user.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200/80 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>
                                {deactivatingUserId === user.id
                                  ? "Deactivating..."
                                  : "Deactivate"}
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}

                      {users.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-xs font-medium text-slate-400"
                          >
                            No active user accounts found in system.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animation styles */}
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

export default UserManagement;