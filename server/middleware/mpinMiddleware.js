const bcrypt = require("bcryptjs");
const db = require("../config/db");

// Verify MPIN before allowing access to sensitive operations
const verifyMpin = async (req, res, next) => {
  const { mpin } = req.headers;
  const userId = req.user.id;

  if (!mpin) {
    return res.status(400).json({ error: "Security MPIN header is required" });
  }

  try {
    const userRes = await db.query(
      "SELECT mpin_hash, is_mpin_enabled, failed_mpin_attempts, mpin_locked_until FROM users WHERE id = $1;",
      [userId]
    );
    const user = userRes.rows[0];

    if (!user || !user.is_mpin_enabled || !user.mpin_hash) {
      return res.status(400).json({ error: "MPIN security is not set up for this account" });
    }

    if (user.mpin_locked_until && new Date(user.mpin_locked_until) > new Date()) {
      return res.status(423).json({ error: "Account locked due to too many failed MPIN attempts. Try again later." });
    }

    const isMatch = await bcrypt.compare(mpin, user.mpin_hash);
    if (!isMatch) {
      const attempts = user.failed_mpin_attempts + 1;
      let lockTime = null;
      if (attempts >= 5) {
        lockTime = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
      }
      await db.query(
        "UPDATE users SET failed_mpin_attempts = $1, mpin_locked_until = $2 WHERE id = $3;",
        [attempts, lockTime, userId]
      );
      return res.status(401).json({ error: "Invalid MPIN code" });
    }

    // Reset failed attempts on successful entry
    await db.query("UPDATE users SET failed_mpin_attempts = 0, mpin_locked_until = NULL WHERE id = $1;", [userId]);
    next();
  } catch (error) {
    console.error("[MPIN Middleware Error]:", error);
    res.status(500).json({ error: "Internal MPIN authentication failure" });
  }
};

module.exports = { verifyMpin };