import { useEffect, useState } from "react";


import api from "../services/api";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";


// ==========================================================
// NOTIFICATIONS PAGE
// ==========================================================

function Notifications() {

    // ==========================================================
    // STATE
    // ==========================================================

    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");

    const [filter, setFilter] = useState("all");


    // ==========================================================
    // FETCH NOTIFICATIONS
    // ==========================================================

    const fetchNotifications = async () => {

        try {

            setError("");

            const response = await api.get(
                "/notifications"
            );

            setNotifications(
                response.data.notifications || []
            );

        }

        catch (error) {

            console.error(
                "Error fetching notifications:",
                error
            );

            setError(
                error.response?.data?.error ||
                "Failed to fetch notifications"
            );

        }

    };


    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    useEffect(() => {

        const loadNotifications = async () => {

            setLoading(true);

            await fetchNotifications();

            setLoading(false);

        };

        loadNotifications();

    }, []);


    // ==========================================================
    // MARK ONE AS READ
    // ==========================================================

    const handleMarkAsRead = async (notification) => {

        if (notification.is_read) {

            return;

        }

        try {

            setActionLoading(true);

            await api.put(
                `/notifications/${notification.id}/read`
            );

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notification.id
                        ? {
                            ...item,
                            is_read: true
                        }
                        : item
                )
            );

        }

        catch (error) {

            console.error(
                "Error marking notification as read:",
                error
            );

            alert(
                error.response?.data?.error ||
                "Failed to mark notification as read"
            );

        }

        finally {

            setActionLoading(false);

        }

    };


    // ==========================================================
    // MARK ALL AS READ
    // ==========================================================

    const handleMarkAllAsRead = async () => {

        const unreadNotifications =
            notifications.filter(
                (notification) =>
                    !notification.is_read
            );

        if (unreadNotifications.length === 0) {

            return;

        }

        try {

            setActionLoading(true);

            await api.put(
                "/notifications/read-all"
            );

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    is_read: true
                }))
            );

        }

        catch (error) {

            console.error(
                "Error marking all notifications as read:",
                error
            );

            alert(
                error.response?.data?.error ||
                "Failed to mark all notifications as read"
            );

        }

        finally {

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

        if (!confirmed) {

            return;

        }

        try {

            setActionLoading(true);

            await api.delete(
                `/notifications/${notification.id}`
            );

            setNotifications((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== notification.id
                )
            );

        }

        catch (error) {

            console.error(
                "Error deleting notification:",
                error
            );

            alert(
                error.response?.data?.error ||
                "Failed to delete notification"
            );

        }

        finally {

            setActionLoading(false);

        }

    };


    // ==========================================================
    // FILTER NOTIFICATIONS
    // ==========================================================

    const filteredNotifications =
        notifications.filter((notification) => {

            if (filter === "unread") {

                return !notification.is_read;

            }

            if (filter === "read") {

                return notification.is_read;

            }

            return true;

        });


    // ==========================================================
    // COUNTS
    // ==========================================================

    const totalNotifications =
        notifications.length;

    const unreadNotifications =
        notifications.filter(
            (notification) =>
                !notification.is_read
        ).length;

    const readNotifications =
        notifications.filter(
            (notification) =>
                notification.is_read
        ).length;


    // ==========================================================
    // FORMAT DATE
    // ==========================================================

    const formatDate = (date) => {

        if (!date) {

            return "Unknown time";

        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    // ==========================================================
    // GET TYPE STYLE
    // ==========================================================

    const getTypeStyle = (type) => {

        switch (type) {

            case "critical":

                return {
                    badge:
                        "bg-red-100 text-red-700",
                    icon: "🚨"
                };

            case "warning":

                return {
                    badge:
                        "bg-yellow-100 text-yellow-700",
                    icon: "⚠️"
                };

            case "info":

                return {
                    badge:
                        "bg-blue-100 text-blue-700",
                    icon: "ℹ️"
                };

            default:

                return {
                    badge:
                        "bg-gray-100 text-gray-700",
                    icon: "🔔"
                };

        }

    };


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex">

                    <Sidebar />

                    <main className="flex-1 p-8">

                        <p className="text-gray-500">
                            Loading notifications...
                        </p>

                    </main>

                </div>

            </div>

        );

    }


    // ==========================================================
    // MAIN UI
    // ==========================================================

    return (

        <div className="min-h-screen bg-gray-100">

            <Navbar />


            <div className="flex">

                <Sidebar />


                <main className="flex-1 p-8">


                    {/* ======================================================
                        HEADER
                    ====================================================== */}

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

                        <div>

                            <h1 className="text-3xl font-bold text-gray-800">

                                Notifications

                            </h1>


                            <p className="text-gray-500 mt-1">

                                View and manage your patient alerts and notifications.

                            </p>

                        </div>


                        <div className="flex gap-3">

                            <button

                                onClick={handleMarkAllAsRead}

                                disabled={
                                    unreadNotifications === 0 ||
                                    actionLoading
                                }

                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"

                            >

                                Mark All as Read

                            </button>

                        </div>

                    </div>


                    {/* ======================================================
                        ERROR
                    ====================================================== */}

                    {error && (

                        <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-6">

                            {error}

                        </div>

                    )}


                    {/* ======================================================
                        SUMMARY CARDS
                    ====================================================== */}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">


                        {/* TOTAL */}

                        <div className="bg-white rounded-xl shadow-sm p-5">

                            <p className="text-sm text-gray-500">

                                Total Notifications

                            </p>

                            <p className="text-3xl font-bold text-gray-800 mt-2">

                                {totalNotifications}

                            </p>

                        </div>


                        {/* UNREAD */}

                        <div className="bg-white rounded-xl shadow-sm p-5">

                            <p className="text-sm text-gray-500">

                                Unread

                            </p>

                            <p className="text-3xl font-bold text-red-600 mt-2">

                                {unreadNotifications}

                            </p>

                        </div>


                        {/* READ */}

                        <div className="bg-white rounded-xl shadow-sm p-5">

                            <p className="text-sm text-gray-500">

                                Read

                            </p>

                            <p className="text-3xl font-bold text-green-600 mt-2">

                                {readNotifications}

                            </p>

                        </div>

                    </div>


                    {/* ======================================================
                        FILTERS
                    ====================================================== */}

                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">

                        <div className="flex flex-wrap gap-3">

                            <button

                                onClick={() =>
                                    setFilter("all")
                                }

                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                    filter === "all"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}

                            >

                                All ({totalNotifications})

                            </button>


                            <button

                                onClick={() =>
                                    setFilter("unread")
                                }

                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                    filter === "unread"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}

                            >

                                Unread ({unreadNotifications})

                            </button>


                            <button

                                onClick={() =>
                                    setFilter("read")
                                }

                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                    filter === "read"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}

                            >

                                Read ({readNotifications})

                            </button>

                        </div>

                    </div>


                    {/* ======================================================
                        EMPTY STATE
                    ====================================================== */}

                    {filteredNotifications.length === 0 ? (

                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">

                            <div className="text-5xl mb-4">

                                🔔

                            </div>

                            <h2 className="text-xl font-semibold text-gray-700">

                                No notifications

                            </h2>

                            <p className="text-gray-500 mt-2">

                                {filter === "unread"
                                    ? "You have no unread notifications."
                                    : filter === "read"
                                        ? "You have no read notifications."
                                        : "You don't have any notifications yet."
                                }

                            </p>

                        </div>

                    ) : (

                        /* ==================================================
                           NOTIFICATION LIST
                        ================================================== */

                        <div className="space-y-4">

                            {filteredNotifications.map(
                                (notification) => {

                                    const typeStyle =
                                        getTypeStyle(
                                            notification.type
                                        );

                                    return (

                                        <div

                                            key={
                                                notification.id
                                            }

                                            className={`bg-white rounded-xl shadow-sm border p-5 transition ${
                                                notification.is_read
                                                    ? "border-gray-200"
                                                    : "border-blue-200 bg-blue-50/30"
                                            }`}

                                        >

                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">


                                                {/* ==================================================
                                                    NOTIFICATION CONTENT
                                                ================================================== */}

                                                <div className="flex-1">

                                                    <div className="flex flex-wrap items-center gap-2 mb-2">


                                                        {/* TYPE */}

                                                        <span

                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeStyle.badge}`}

                                                        >

                                                            {typeStyle.icon}

                                                            {notification.type ||
                                                                "notification"}

                                                        </span>


                                                        {/* READ STATUS */}

                                                        {!notification.is_read && (

                                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">

                                                                Unread

                                                            </span>

                                                        )}

                                                        {notification.is_read && (

                                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">

                                                                Read

                                                            </span>

                                                        )}

                                                    </div>


                                                    {/* TITLE */}

                                                    <h2 className="text-lg font-bold text-gray-800">

                                                        {notification.title}

                                                    </h2>


                                                    {/* MESSAGE */}

                                                    <p className="text-gray-600 mt-2 leading-relaxed">

                                                        {notification.message}

                                                    </p>


                                                    {/* DETAILS */}

                                                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-500">


                                                        {notification.patient_name && (

                                                            <span>

                                                                <strong className="text-gray-700">
                                                                    Patient:
                                                                </strong>{" "}

                                                                {notification.patient_name}

                                                            </span>

                                                        )}


                                                        {notification.sender_name && (

                                                            <span>

                                                                <strong className="text-gray-700">
                                                                    From:
                                                                </strong>{" "}

                                                                {notification.sender_name}

                                                                {notification.sender_role
                                                                    ? ` (${notification.sender_role})`
                                                                    : ""
                                                                }

                                                            </span>

                                                        )}


                                                        <span>

                                                            <strong className="text-gray-700">
                                                                Time:
                                                            </strong>{" "}

                                                            {formatDate(
                                                                notification.created_at
                                                            )}

                                                        </span>

                                                    </div>

                                                </div>


                                                {/* ==================================================
                                                    ACTIONS
                                                ================================================== */}

                                                <div className="flex lg:flex-col gap-2">


                                                    {/* MARK READ */}

                                                    {!notification.is_read && (

                                                        <button

                                                            onClick={() =>
                                                                handleMarkAsRead(
                                                                    notification
                                                                )
                                                            }

                                                            disabled={
                                                                actionLoading
                                                            }

                                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"

                                                        >

                                                            Mark Read

                                                        </button>

                                                    )}


                                                    {/* DELETE */}

                                                    <button

                                                        onClick={() =>
                                                            handleDelete(
                                                                notification
                                                            )
                                                        }

                                                        disabled={
                                                            actionLoading
                                                        }

                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"

                                                    >

                                                        Delete

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }

                            )}

                        </div>

                    )}

                </main>

            </div>

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default Notifications;