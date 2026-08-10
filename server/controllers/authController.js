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

        // Insert User
        const result = await db.query(
            `
            INSERT INTO users
            (
                full_name,
                email,
                password_hash,
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

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required."
            });
        }

        // Find user by email
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = result.rows[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({
                message: "Your account has been deactivated."
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        console.log("========== LOGIN DEBUG ==========");

        console.log("User ID:", user.id);

        console.log("User Email:", user.email);

        console.log("User Role:", user.role);

        console.log("=================================");

        // Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
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

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};