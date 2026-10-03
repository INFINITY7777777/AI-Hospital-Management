import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, X, ShieldAlert, AlertTriangle, Info, Check, ExternalLink } from "lucide-react";
import api from "../services/api";

const NotificationBell = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const prevCountRef = useRef(0);
    const dropdownRef = useRef(null);
    const audioCtxRef = useRef(null);

    // ==========================================================
    // INITIALIZE & UNLOCK AUDIO CONTEXT ON FIRST USER CLICK
    // ==========================================================
    useEffect(() => {
        const initAudio = () => {
            if (!audioCtxRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    audioCtxRef.current = new AudioContext();
                }
            }

            if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
                audioCtxRef.current.resume();
            }

            // Remove listener once unlocked
            window.removeEventListener("click", initAudio);
            window.removeEventListener("keydown", initAudio);
        };

        window.addEventListener("click", initAudio);
        window.addEventListener("keydown", initAudio);

        return () => {
            window.removeEventListener("click", initAudio);
            window.removeEventListener("keydown", initAudio);
        };
    }, []);

    // ==========================================================
    // AUDIO ALERT SYNTHESIZER
    // ==========================================================
    const playNotificationSound = async () => {
        try {
            if (!audioCtxRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) audioCtxRef.current = new AudioContext();
            }

            const ctx = audioCtxRef.current;
            if (!ctx) return;

            // Ensure context is running (overcomes browser autoplay restrictions)
            if (ctx.state === "suspended") {
                await ctx.resume();
            }

            const now = ctx.currentTime;

            // First Tone (High Bell - 880 Hz)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(880, now);
            gain1.gain.setValueAtTime(0.2, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            // Second Tone (Higher Chime - 1318 Hz)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(1318.51, now + 0.12);
            gain2.gain.setValueAtTime(0.25, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc1.start(now);
            osc1.stop(now + 0.2);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.4);
        } catch (e) {
            console.error("Audio playback error:", e);
        }
    };

    // ==========================================================
    // POLLING & DATA FETCHING EFFECT
    // ==========================================================
    useEffect(() => {
        let isMounted = true;

        const fetchNotificationsData = async () => {
            try {
                const [listRes, countRes] = await Promise.all([
                    api.get("/notifications"),
                    api.get("/notifications/unread-count")
                ]);

                if (isMounted && listRes.data?.success) {
                    const fetchedList = listRes.data.notifications || [];
                    setNotifications(fetchedList);

                    const newUnreadCount = countRes.data?.unreadCount || 0;

                    if (newUnreadCount > prevCountRef.current && fetchedList.length > 0) {
                        playNotificationSound();
                        
                        const newestAlert = fetchedList[0];
                        setToast({
                            title: newestAlert.title,
                            message: newestAlert.message,
                            type: newestAlert.type,
                            patientName: newestAlert.patient_name
                        });

                        setTimeout(() => setToast(null), 6000);
                    }

                    setUnreadCount(newUnreadCount);
                    prevCountRef.current = newUnreadCount;
                }
            } catch (error) {
                console.error("[Notification Bell] Fetch Error:", error);
            }
        };

        // Initial Fetch
        fetchNotificationsData();

        // 8-second polling interval
        const interval = setInterval(fetchNotificationsData, 8000);

        // Click outside handler
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            isMounted = false;
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // ==========================================================
    // ACTIONS: MARK AS READ & NAVIGATION
    // ==========================================================
    const handleMarkAsRead = async (id, patientId) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(item => item.id === id ? { ...item, is_read: true } : item)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            if (patientId) navigate(`/patients/${patientId}`);
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put("/notifications/read-all");
            setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const handleOpenMoreActions = () => {
        setIsOpen(false);
        navigate("/notifications");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            
            {/* ==========================================================
                REACT PORTAL: FLOATS TOAST DIRECTLY ON BODY (BOTTOM RIGHT)
            ========================================================== */}
            {toast && createPortal(
                <div 
                    className="
                        fixed bottom-6 right-6 z-99999 
                        flex w-full max-w-sm items-start gap-3.5 
                        overflow-hidden rounded-2xl border border-slate-200 
                        bg-white p-4 shadow-2xl
                        transition-all duration-300 ease-out
                    "
                    style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: toast.type === "critical" ? "#f43f5e" : toast.type === "warning" ? "#f59e0b" : "#3b82f6"
                    }}
                >
                    {/* Icon */}
                    <div className={`
                        flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border
                        ${toast.type === "critical" ? "bg-rose-50 border-rose-100 text-rose-600" : toast.type === "warning" ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-sky-50 border-sky-100 text-sky-600"}
                    `}>
                        {toast.type === "critical" ? (
                            <ShieldAlert className="h-5 w-5" />
                        ) : toast.type === "warning" ? (
                            <AlertTriangle className="h-5 w-5" />
                        ) : (
                            <Info className="h-5 w-5" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-bold text-slate-900">
                            {toast.title}
                        </h4>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
                            {toast.message}
                        </p>

                        {toast.patientName && (
                            <span className="mt-2 inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                                Patient: {toast.patientName}
                            </span>
                        )}
                    </div>

                    {/* Close Button */}
                    <button 
                        type="button"
                        onClick={() => setToast(null)} 
                        className="
                            flex h-7 w-7 shrink-0 items-center justify-center 
                            rounded-lg text-slate-400 
                            transition-all duration-150 
                            hover:bg-slate-100 hover:text-slate-700 
                            active:scale-95
                        "
                        aria-label="Close notification"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>,
                document.body
            )}

            {/* ==========================================================
                NOTIFICATION BELL BUTTON & BADGE
            ========================================================== */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="
                    relative flex h-10 w-10 items-center justify-center 
                    rounded-2xl border border-slate-200/80 bg-white/80 
                    text-slate-600 backdrop-blur-md shadow-sm
                    transition-all duration-200 
                    hover:border-slate-300 hover:bg-slate-50 hover:text-[#08679f] 
                    active:scale-95 focus:outline-none
                "
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* ==========================================================
                DROPDOWN MENU
            ========================================================== */}
            {isOpen && (
                <div className="absolute right-0 z-50 mt-3 w-80 sm:w-96 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-2xl">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3.5">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-[#08679f]/10 px-2 py-0.5 text-[10px] font-bold text-[#08679f]">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>

                        {/* Top-Right Mark All as Read Button */}
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#08679f] hover:underline"
                            >
                                <Check className="h-3.5 w-3.5" />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-xs font-medium text-slate-400">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleMarkAsRead(item.id, item.patient_id)}
                                    className={`
                                        flex items-start gap-3 p-3.5 transition-all duration-150 cursor-pointer
                                        ${item.is_read ? "bg-white hover:bg-slate-50 opacity-80" : "bg-sky-50/40 hover:bg-sky-50/80"}
                                    `}
                                >
                                    <div className="mt-0.5">
                                        {item.type === "critical" ? (
                                            <ShieldAlert className="h-4 w-4 text-rose-500" />
                                        ) : item.type === "warning" ? (
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        ) : (
                                            <Info className="h-4 w-4 text-sky-500" />
                                        )}
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`text-xs ${item.is_read ? "font-semibold text-slate-700" : "font-bold text-slate-900"}`}>
                                                {item.title}
                                            </h4>
                                            {!item.is_read && (
                                                <span className="h-2 w-2 rounded-full bg-[#08679f] shrink-0" />
                                            )}
                                        </div>

                                        <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-600 line-clamp-2">
                                            {item.message}
                                        </p>

                                        <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                            <span>From: {item.sender_name || "System"}</span>
                                            <span>•</span>
                                            <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer - Full Page Link */}
                    <div className="border-t border-slate-100 bg-slate-50/50 p-2.5 text-center">
                        <button
                            type="button"
                            onClick={handleOpenMoreActions}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-[#08679f] transition-all hover:bg-white hover:shadow-sm active:scale-[0.99]"
                        >
                            <span>See All Notifications & Management</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default NotificationBell;