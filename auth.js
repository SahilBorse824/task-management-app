const express = require("express");
const router = express.Router();

const db = require("../database");


// ===============================
// REGISTER
// ===============================

router.post("/register", (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [name.trim(), email.trim(), password],
        function (err) {

            if (err) {

                if (err.message.includes("UNIQUE")) {
                    return res.status(400).json({
                        success: false,
                        message: "Email already registered."
                    });
                }

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Registration failed."
                });
            }

            res.json({
                success: true,
                message: "Registration successful."
            });

        }
    );

});


// ===============================
// LOGIN
// ===============================

router.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    const sql = `
        SELECT id, name, email
        FROM users
        WHERE email = ? AND password = ?
    `;

    db.get(
        sql,
        [email.trim(), password],
        (err, user) => {

            if (err) {

                console.error("Login database error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database error during login."
                });
            }

            if (!user) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }


            // Store user in session
            req.session.user = user;

            req.session.save((sessionError) => {

                if (sessionError) {

                    console.error(
                        "Session save error:",
                        sessionError
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to create login session."
                    });
                }


                console.log(
                    `User logged in: ${user.email}`
                );


                res.json({
                    success: true,
                    message: "Login successful.",
                    user: user
                });

            });

        }
    );

});


// ===============================
// LOGOUT
// ===============================

router.post("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Logout failed."
            });

        }

        res.clearCookie("connect.sid");

        res.json({
            success: true,
            message: "Logged out successfully."
        });

    });

});


// ===============================
// CURRENT USER
// ===============================

router.get("/me", (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({
            success: false,
            message: "Not logged in."
        });

    }

    res.json({
        success: true,
        user: req.session.user
    });

});


module.exports = router;