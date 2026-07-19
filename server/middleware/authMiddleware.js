/***********************************************************************
 * File Name : authMiddleware.js
 * Purpose   : Protect routes using JWT Authentication
 * Author    : Shashank (AI-Powered Hospital Management System)
 *
 * Description:
 * This middleware checks whether the user is logged in by verifying
 * the JWT token sent in the request header.
 *
 * If the token is valid:
 *      ✔ Allow access to the requested API
 *
 * If the token is invalid or missing:
 *      ✘ Block the request
 ***********************************************************************/

// ========================= IMPORT REQUIRED LIBRARY =========================

// JWT is used to verify login tokens
const jwt = require("jsonwebtoken");


// ========================= JWT AUTHENTICATION MIDDLEWARE =========================

const verifyToken = (req, res, next) => {

    // ------------------------------------------------------------------
    // STEP 1 : Read the Authorization Header
    //
    // Example Header:
    // Authorization : Bearer eyJhbGciOiJIUzI1NiIs...
    // ------------------------------------------------------------------

    const authHeader = req.headers.authorization;


    // ------------------------------------------------------------------
    // STEP 2 : Check whether token exists
    // ------------------------------------------------------------------

    if (!authHeader) {

        return res.status(401).json({
            success: false,
            message: "Access Denied! No token was provided."
        });

    }


    // ------------------------------------------------------------------
    // STEP 3 : Extract only the JWT Token
    //
    // Header Value:
    // Bearer eyJhbGciOiJIUzI1NiIs...
    //
    // We only need:
    // eyJhbGciOiJIUzI1NiIs...
    // ------------------------------------------------------------------

    const token = authHeader.split(" ")[1];


    // ------------------------------------------------------------------
    // STEP 4 : Verify JWT Token
    // ------------------------------------------------------------------

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // --------------------------------------------------------------
        // STEP 5 : Save Logged-in User Information
        //
        // Example:
        // req.user.id
        // req.user.role
        //
        // Any protected API can use this information.
        // --------------------------------------------------------------

        req.user = decoded;


        // --------------------------------------------------------------
        // STEP 6 : Allow the request to continue
        // --------------------------------------------------------------

        next();

    } catch (error) {

        // --------------------------------------------------------------
        // JWT is Invalid / Expired
        // --------------------------------------------------------------

        return res.status(401).json({

            success: false,

            message: "Invalid or Expired Token."

        });

    }

};


// ========================= EXPORT MIDDLEWARE =========================

// This makes the middleware available to other files.

module.exports = verifyToken;