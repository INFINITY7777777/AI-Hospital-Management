import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import GlobalSearchModal from "../components/GlobalSearchModal";

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
    <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
      {/* Top Navbar with search click handler connected */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* ======================================================
            BACK TO DASHBOARD
        ====================================================== */}
        <div>
          <Link
            to="/dashboard"
            className="
              inline-flex h-9 items-center gap-2 rounded-xl
              border border-slate-200 bg-white px-3.5
              text-xs font-semibold text-slate-700
              shadow-sm transition-all duration-150
              hover:border-slate-300 hover:bg-slate-50
              focus:outline-none focus:ring-4 focus:ring-slate-100
            "
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

        {/* ======================================================
            HEADER & ACTIONS
        ====================================================== */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
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
            className="
              inline-flex h-9 items-center justify-center rounded-xl
              bg-[#08679F] px-4 text-xs font-semibold text-white
              shadow-md shadow-[#08679F]/20 transition-all duration-150
              hover:bg-[#07557F] active:scale-[0.99]
              disabled:cursor-not-allowed disabled:opacity-50
              focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
            "
          >
            Mark All as Read
          </button>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="rounded-xl border border-rose-200/80 bg-rose-50 p-4 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Notifications
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalNotifications}
            </p>
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Unread
            </p>
            <p className="mt-2 text-2xl font-bold text-rose-600">
              {unreadCount}
            </p>
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Read
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {readCount}
            </p>
          </div>
        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              filter === "all"
                ? "bg-[#08679F] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({totalNotifications})
          </button>

          <button
            onClick={() => setFilter("unread")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              filter === "unread"
                ? "bg-[#08679F] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => setFilter("read")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              filter === "read"
                ? "bg-[#08679F] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Read ({readCount})
          </button>
        </div>

        {/* ======================================================
            NOTIFICATION LIST
        ====================================================== */}
        {loading ? (
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-12 text-center text-xs font-medium text-slate-400">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-12 text-center">
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
          <div className="space-y-3">
            {filteredNotifications.map((n) => {
              const typeStyle = getTypeStyle(n.type);

              return (
                <div
                  key={n.id}
                  className={`rounded-[22px] border p-5 transition-all shadow-[0_8px_30px_rgba(15,23,42,0.03)] ${
                    n.is_read
                      ? "border-slate-200/80 bg-white"
                      : "border-sky-200/80 bg-sky-50/20"
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
                          className="
                            rounded-xl bg-[#08679F]/10 px-3 py-1.5 text-xs font-semibold
                            text-[#08679F] transition-all hover:bg-[#08679F] hover:text-white
                            disabled:opacity-50
                          "
                        >
                          Mark Read
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(n)}
                        disabled={actionLoading}
                        className="
                          rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold
                          text-rose-600 transition-all hover:bg-rose-600 hover:text-white
                          disabled:opacity-50
                        "
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
      </main>
    </div>
  );
}