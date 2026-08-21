import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const NotificationBell = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const prevCountRef = useRef(0);
    const dropdownRef = useRef(null);

    // ==========================================================
    // AUDIO ALERT (Web Audio API Synthesizer)
    // ==========================================================
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            // First Note (High tone)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(880, ctx.currentTime);
            gain1.gain.setValueAtTime(0.15, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            // Second Note (Higher tone chime)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.12);
            gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.15);
            osc2.start(ctx.currentTime + 0.12);
            osc2.stop(ctx.currentTime + 0.35);
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

                        setTimeout(() => setToast(null), 5000);
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
    // ACTIONS: MARK AS READ
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

    return (
        <div className="relative" ref={dropdownRef}>
            
            {/* TOAST BANNER */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 flex items-start gap-3 p-4 bg-white border-l-4 border-red-500 rounded-xl shadow-2xl max-w-sm animate-bounce">
                    <div className="p-2 bg-red-100 text-red-600 rounded-full">🚨</div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900">{toast.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{toast.message}</p>
                        {toast.patientName && (
                            <span className="inline-block mt-2 text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                                Patient: {toast.patientName}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={() => setToast(null)} 
                        className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* BELL BUTTON & BADGE */}
            <button
                onClick={() => navigate("/notifications")}
                className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition outline-none"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-600 text-[10px] font-bold text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* DROPDOWN CONTAINER */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-400">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleMarkAsRead(item.id, item.patient_id)}
                                    className={`p-4 transition cursor-pointer flex gap-3 items-start ${
                                        item.is_read ? "bg-white hover:bg-gray-50 opacity-75" : "bg-blue-50/50 hover:bg-blue-50"
                                    }`}
                                >
                                    <span className="text-lg">
                                        {item.type === "critical" ? "🚨" : item.type === "warning" ? "⚠️" : "ℹ️"}
                                    </span>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-xs font-semibold ${item.is_read ? "text-gray-700" : "text-gray-900 font-bold"}`}>
                                                {item.title}
                                            </h4>
                                            {!item.is_read && (
                                                <span className="h-2 w-2 rounded-full bg-blue-600 mt-1"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                            {item.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                                            <span>From: {item.sender_name || "System"}</span>
                                            <span>•</span>
                                            <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};

export default NotificationBell;