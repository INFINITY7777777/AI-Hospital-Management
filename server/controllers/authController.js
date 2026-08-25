const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      mpin,
      role,
      phone,
      specialization,
      registration_number,
      department
    } = req.body;

    // Check required fields
    if (!full_name || !email || !password || !mpin || !role) {
      return res.status(400).json({
        message: "Please fill all required fields."
      });
    }

    // Check if email already exists
    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered."
      });
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // Hash MPIN
    const mpinHash = await bcrypt.hash(mpin, 10);

    // Insert User - Target 'password' column per schema
    const result = await db.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        password,
        mpin_hash,
        role,
        phone,
        specialization,
        registration_number,
        department
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)

      RETURNING
        id,
        full_name,
        email,
        role;
      `,
      [
        full_name,
        email,
        passwordHash,
        mpinHash,
        role,
        phone,
        specialization,
        registration_number,
        department
      ]
    );

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// Code for User Login 
const loginUser = async (req, res) => {
  try {
    const { email, password, mpin } = req.body;

    if (!email || (!password && !mpin)) {
      return res.status(400).json({
        message: "Email and either MPIN or Password are required."
      });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: "Your account has been deactivated." });
    }

    let isAuthorized = false;

    // Check MPIN if provided
    if (mpin) {
      if (!user.mpin_hash) {
        return res.status(400).json({
          message: "MPIN not configured. Please use your password."
        });
      }
      isAuthorized = await bcrypt.compare(mpin, user.mpin_hash);
    } 
    // Check Password fallback
    else if (password) {
      isAuthorized = await bcrypt.compare(password, user.password);
    }

    if (!isAuthorized) {
      return res.status(401).json({
        message: mpin ? "Invalid MPIN." : "Invalid password."
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser
};