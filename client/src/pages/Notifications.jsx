import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import GlobalSearchModal from "../components/GlobalSearchModal";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

export default function Notifications() {
  // ==========================================================
  // STATE
  // ==========================================================
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  // Global Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 3D Tilt & Spotlight state for main container
  const mainCardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMoveCard = (e) => {
    if (!mainCardRef.current) return;
    const rect = mainCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setCardRotate({ x: rotateX, y: rotateY });
  };

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================
  const fetchNotifications = async () => {
    try {
      setError("");
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err.response?.data?.error || "Failed to fetch notifications"
      );
    }
  };

  // ==========================================================
  // INITIAL LOAD & KEYBOARD SHORTCUT (Ctrl/Cmd + K)
  // ==========================================================
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ==========================================================
  // MARK ONE AS READ
  // ==========================================================
  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) return;

    try {
      setActionLoading(true);
      await api.put(`/notifications/${notification.id}/read`);
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      alert(
        err.response?.data?.error || "Failed to mark notification as read"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.is_read);
    if (unreadNotifications.length === 0) return;

    try {
      setActionLoading(true);
      await api.put("/notifications/read-all");
      setNotifications((previous) =>
        previous.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      alert(
        err.response?.data?.error || "Failed to mark all notifications as read"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // DELETE NOTIFICATION
  // ==========================================================
  const handleDelete = async (notification) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await api.delete(`/notifications/${notification.id}`);
      setNotifications((previous) =>
        previous.filter((item) => item.id !== notification.id)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert(
        err.response?.data?.error || "Failed to delete notification"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // FILTER NOTIFICATIONS
  // ==========================================================
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.is_read;
    if (filter === "read") return notification.is_read;
    return true;
  });

  // ==========================================================
  // COUNTS & FORMATTERS
  // ==========================================================
  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount = notifications.filter((n) => n.is_read).length;

  const formatDate = (date) => {
    if (!date) return "Unknown time";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "critical":
        return {
          badge: "border-rose-200/80 bg-rose-50 text-rose-700",
          icon: "🚨",
        };
      case "warning":
        return {
          badge: "border-amber-200/80 bg-amber-50 text-amber-700",
          icon: "⚠️",
        };
      case "info":
        return {
          badge: "border-sky-200/80 bg-sky-50 text-sky-700",
          icon: "ℹ️",
        };
      default:
        return {
          badge: "border-slate-200/80 bg-slate-100 text-slate-700",
          icon: "🔔",
        };
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans text-slate-900 antialiased">
      {/* Interactive Medical + Canvas Hover Effect */}
      <MedicalPlusBackground />

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <div className="relative z-10">
        {/* Top Navbar with search click handler connected */}
        <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 perspective-[1000px]">
          {/* Main Content Wrapper with 3D Spotlight Tilt */}
          <div
            ref={mainCardRef}
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

            {/* BACK TO DASHBOARD */}
            <div className="relative z-10">
              <Link
                to="/dashboard"
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
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

            {/* HEADER & ACTIONS */}
            <div className="relative z-10 flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Notifications
                </h1>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  View and manage your clinical alerts and system updates.
                </p>
              </div>

              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || actionLoading}
                className="group relative overflow-hidden inline-flex h-9 items-center justify-center rounded-xl bg-[#08679F] px-4 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#07557F] hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-[#08679F]/20"
              >
                <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                <span className="relative z-10">Mark All as Read</span>
              </button>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="relative z-10 rounded-xl border border-rose-200/80 bg-rose-50/90 p-4 text-xs font-medium text-rose-700 backdrop-blur-md">
                {error}
              </div>
            )}

            {/* SUMMARY CARDS */}
            <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="group/card rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-[#08679F]/30 hover:shadow-md">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Notifications
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalNotifications}
                </p>
              </div>

              <div className="group/card rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-md">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Unread
                </p>
                <p className="mt-2 text-2xl font-bold text-rose-600">
                  {unreadCount}
                </p>
              </div>

              <div className="group/card rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-md">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Read
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {readCount}
                </p>
              </div>
            </div>

            {/* FILTERS */}
            <div className="relative z-10 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5 backdrop-blur-md flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  filter === "all"
                    ? "bg-white text-[#08679F] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({totalNotifications})
              </button>

              <button
                onClick={() => setFilter("unread")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  filter === "unread"
                    ? "bg-white text-[#08679F] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Unread ({unreadCount})
              </button>

              <button
                onClick={() => setFilter("read")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  filter === "read"
                    ? "bg-white text-[#08679F] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Read ({readCount})
              </button>
            </div>

            {/* NOTIFICATION LIST */}
            {loading ? (
              <div className="relative z-10 rounded-[22px] border border-slate-200/80 bg-white/70 p-12 text-center text-xs font-medium text-slate-400 backdrop-blur-md">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="relative z-10 rounded-[22px] border border-slate-200/80 bg-white/70 p-12 text-center backdrop-blur-md">
                <div className="text-4xl mb-3">🔔</div>
                <h2 className="text-sm font-bold text-slate-800">
                  No notifications found
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  {filter === "unread"
                    ? "You have no unread notifications."
                    : filter === "read"
                    ? "You have no read notifications."
                    : "You don't have any notifications right now."}
                </p>
              </div>
            ) : (
              <div className="relative z-10 space-y-3">
                {filteredNotifications.map((n) => {
                  const typeStyle = getTypeStyle(n.type);

                  return (
                    <div
                      key={n.id}
                      className={`rounded-[22px] border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        n.is_read
                          ? "border-slate-200/80 bg-white/80 backdrop-blur-md"
                          : "border-sky-200/80 bg-sky-50/40 backdrop-blur-md"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Type Badge */}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${typeStyle.badge}`}
                            >
                              <span>{typeStyle.icon}</span>
                              <span className="capitalize">
                                {n.type || "Notification"}
                              </span>
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                                n.is_read
                                  ? "border-slate-200 bg-slate-100 text-slate-600"
                                  : "border-sky-200 bg-sky-50 text-[#08679F]"
                              }`}
                            >
                              {n.is_read ? "Read" : "Unread"}
                            </span>
                          </div>

                          {/* Title & Message */}
                          <h2 className="text-sm font-bold text-slate-900">
                            {n.title}
                          </h2>
                          <p className="text-xs font-medium text-slate-600 leading-relaxed">
                            {n.message}
                          </p>

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-medium text-slate-400 pt-1">
                            {n.patient_name && (
                              <span>
                                <strong className="text-slate-600">Patient:</strong>{" "}
                                {n.patient_name}
                              </span>
                            )}
                            {n.sender_name && (
                              <span>
                                <strong className="text-slate-600">From:</strong>{" "}
                                {n.sender_name}
                                {n.sender_role ? ` (${n.sender_role})` : ""}
                              </span>
                            )}
                            <span>
                              <strong className="text-slate-600">Time:</strong>{" "}
                              {formatDate(n.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                          {!n.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(n)}
                              disabled={actionLoading}
                              className="rounded-xl bg-[#08679F]/10 px-3 py-1.5 text-xs font-semibold text-[#08679F] transition-all hover:bg-[#08679F] hover:text-white disabled:opacity-50"
                            >
                              Mark Read
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(n)}
                            disabled={actionLoading}
                            className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-600 hover:text-white disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
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