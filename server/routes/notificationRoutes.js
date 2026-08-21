// ==========================================================
// NOTIFICATION ROUTES
// ==========================================================

const express = require("express");

const router = express.Router();


// ==========================================================
// AUTH
// ==========================================================

const {

    verifyToken,

    authorizeRoles

} = require("../middleware/authMiddleware");


// ==========================================================
// CONTROLLER
// ==========================================================

const {

    createNotification,

    getNotifications,

    getUnreadNotificationCount,

    markNotificationAsRead,

    markNotificationAsUnread,

    markAllNotificationsAsRead,

    deleteNotification

} = require("../controllers/notificationController");


// ==========================================================
// CREATE NOTIFICATION
// POST /api/notifications
// ==========================================================

router.post(

    "/",

    verifyToken,

    authorizeRoles(

        "admin",
        "doctor",
        "staff"

    ),

    createNotification

);


// ==========================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// ==========================================================

router.get(

    "/",

    verifyToken,

    authorizeRoles(

        "admin",
        "doctor",
        "staff"

    ),

    getNotifications

);


// ==========================================================
// GET UNREAD COUNT
//
// IMPORTANT:
// This route must come BEFORE /:id/read
// ==========================================================

router.get(

    "/unread-count",

    verifyToken,

    authorizeRoles(

        "admin",
        "doctor",
        "staff"

    ),

    getUnreadNotificationCount

);


// ==========================================================
// MARK ALL AS READ
//
// IMPORTANT:
// This route must come BEFORE /:id/read
// ==========================================================

router.put(

    "/read-all",

    verifyToken,

    authorizeRoles(

        "admin",
        "doctor",
        "staff"

    ),

    markAllNotificationsAsRead

);



// ==========================================================
// MARK ONE AS READ
// PUT /api/notifications/:id/read
// ==========================================================

router.put(

    "/:id/read",

    verifyToken,

    authorizeRoles(

        "admin",
        "doctor",
        "staff"

    ),

    markNotificationAsRead

);

// ==========================================================
// MARK NOTIFICATION AS UNREAD
// PUT /api/notifications/:id/unread
// ==========================================================

router.put(

    "/:id/unread",

    verifyToken,

    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),

    markNotificationAsUnread

);

// ==========================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// ==========================================================

router.delete(

    "/:id",

    verifyToken,

    authorizeRoles(

        "admin",
        "doctor",
        "staff"

    ),

    deleteNotification

);


// ==========================================================
// EXPORT ROUTER
// ==========================================================

module.exports = router;