const db = require("../config/db");

// Get settings for logged-in user
const getSettings = async (req, res) => {
  const userId = req.user.id;
  try {
    let result = await db.query(
      "SELECT * FROM user_settings WHERE user_id = $1;",
      [userId]
    );

    if (result.rows.length === 0) {
      result = await db.query(
        "INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *;",
        [userId]
      );
    }

    res.status(200).json({ settings: result.rows[0] });
  } catch (error) {
    console.error("[Settings Fetch Error]:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  const userId = req.user.id;
  const { hospital_name, notifications_enabled, theme_preference } = req.body;

  try {
    const result = await db.query(
      `UPDATE user_settings 
       SET hospital_name = $1, notifications_enabled = $2, theme_preference = $3, updated_at = NOW()
       WHERE user_id = $4 RETURNING *;`,
      [hospital_name, notifications_enabled, theme_preference, userId]
    );
    res.status(200).json({ settings: result.rows[0] });
  } catch (error) {
    console.error("[Settings Update Error]:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

module.exports = { getSettings, updateSettings };