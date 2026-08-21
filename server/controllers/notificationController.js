const db = require("../config/db");

// Helper function to set anti-caching HTTP headers for real-time polling endpoints
const setNoCacheHeaders = (res) => {
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Surrogate-Control": "no-store"
    });
};

// ==========================================================
// CREATE CRITICAL PATIENT NOTIFICATION
// POST /api/notifications
// ==========================================================

const createNotification = async (req, res) => {
    const client = await db.connect();
    try {
        const { patientId, title, message, type } = req.body;
        const senderId = req.user.id;

        if (!patientId) return res.status(400).json({ error: "Patient ID is required." });
        if (!message || !message.trim()) return res.status(400).json({ error: "Notification message is required." });

        // Query patient validation using client
        const patientResult = await client.query(
            `SELECT id, patient_name FROM patients WHERE id = $1`,
            [patientId]
        );
        if (patientResult.rows.length === 0) return res.status(404).json({ error: "Patient not found." });
        const patient = patientResult.rows[0];

        // Query sender details using client
        const senderResult = await client.query(
            `SELECT id, full_name, role FROM users WHERE id = $1`,
            [senderId]
        );
        if (senderResult.rows.length === 0) return res.status(401).json({ error: "Authenticated user not found." });
        const sender = senderResult.rows[0];

        // Fetch target notification receivers
        const usersResult = await client.query(
            `SELECT id FROM users WHERE COALESCE(is_active, TRUE) = TRUE AND LOWER(TRIM(role)) IN ('admin', 'doctor', 'staff')`
        );

        // MODIFIED: Retain all active team members (including the logged-in sender)
        const targetUsers = usersResult.rows;
        
        if (targetUsers.length === 0) {
            return res.status(200).json({ success: true, message: "No active team members found to notify." });
        }

        // Parameterized bulk insertion setup
        const valueStrings = [];
        const queryParams = [];
        let paramIndex = 1;

        const alertTitle = title?.trim() || `Critical Alert - ${patient.patient_name}`;
        const alertType = type?.trim() || "critical";
        const alertMessage = message.trim();

        targetUsers.forEach(user => {
            valueStrings.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5})`);
            queryParams.push(user.id, senderId, patient.id, alertTitle, alertMessage, alertType);
            paramIndex += 6;
        });

        // Execute transaction safely
        await client.query("BEGIN");
        const insertQuery = `
            INSERT INTO notifications (user_id, sender_id, patient_id, title, message, type)
            VALUES ${valueStrings.join(", ")}
            RETURNING *;
        `;
        const result = await client.query(insertQuery, queryParams);
        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message: "Critical patient alert sent successfully.",
            patient: { id: patient.id, name: patient.patient_name },
            sender: { id: sender.id, name: sender.full_name, role: sender.role },
            notificationsCreated: result.rows.length
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("[Create Notification Error]:", error);
        return res.status(500).json({ error: "Failed to create notification." });
    } finally {
        client.release();
    }
};

// ==========================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// ==========================================================

const getNotifications = async (req, res) => {
    try {
        setNoCacheHeaders(res);

        const userId = req.user.id;

        const result = await db.query(
            `
            SELECT
                n.id,
                n.user_id,
                n.sender_id,
                n.patient_id,
                n.title,
                n.message,
                n.type,
                n.is_read,
                n.created_at,
                n.updated_at,
                sender.full_name AS sender_name,
                sender.role AS sender_role,
                patient.patient_name AS patient_name
            FROM notifications n
            LEFT JOIN users sender ON sender.id = n.sender_id
            LEFT JOIN patients patient ON patient.id = n.patient_id
            WHERE n.user_id = $1
            ORDER BY n.created_at DESC
            LIMIT 50
            `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            notifications: result.rows
        });
    } catch (error) {
        console.error("[Get Notifications Error]:", error);
        return res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

// ==========================================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// ==========================================================

const getUnreadNotificationCount = async (req, res) => {
    try {
        setNoCacheHeaders(res);

        const userId = req.user.id;

        const result = await db.query(
            `
            SELECT
                COUNT(*) AS unread_count
            FROM notifications
            WHERE user_id = $1
            AND is_read = FALSE
            `,
            [userId]
        );

        return res.status(200).json({
            unreadCount: Number(result.rows[0].unread_count)
        });
    } catch (error) {
        console.error("[Unread Notification Count Error]:", error);
        return res.status(500).json({ error: "Failed to fetch unread notification count" });
    }
};

// ==========================================================
// MARK NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// ==========================================================

const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            `
            UPDATE notifications
            SET
                is_read = TRUE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            AND user_id = $2
            RETURNING *
            `,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Notification not found" });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification: result.rows[0]
        });
    } catch (error) {
        console.error("[Mark Notification Read Error]:", error);
        return res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

// ==========================================================
// MARK NOTIFICATION AS UNREAD
// PUT /api/notifications/:id/unread
// ==========================================================

const markNotificationAsUnread = async (req, res) => {

    try {

        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            `
            UPDATE notifications
            SET
                is_read = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            AND user_id = $2
            RETURNING *
            `,
            [id, userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Notification not found"
            });

        }

        return res.status(200).json({

            message: "Notification marked as unread",

            notification: result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "[Mark Notification Unread Error]:",
            error
        );

        return res.status(500).json({

            error: "Failed to mark notification as unread"

        });

    }

};

// ==========================================================
// MARK ALL NOTIFICATIONS AS READ
// PUT /api/notifications/read-all
// ==========================================================

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `
            UPDATE notifications
            SET
                is_read = TRUE,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1
            AND is_read = FALSE
            `,
            [userId]
        );

        return res.status(200).json({
            message: "All notifications marked as read",
            updatedCount: result.rowCount
        });
    } catch (error) {
        console.error("[Mark All Notifications Read Error]:", error);
        return res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
};

// ==========================================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// ==========================================================

const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            `
            DELETE FROM notifications
            WHERE id = $1
            AND user_id = $2
            RETURNING *
            `,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Notification not found" });
        }

        return res.status(200).json({
            message: "Notification deleted successfully",
            notification: result.rows[0]
        });
    } catch (error) {
        console.error("[Delete Notification Error]:", error);
        return res.status(500).json({ error: "Failed to delete notification" });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    deleteNotification
};