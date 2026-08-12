const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const app = express();

require("./database");

app.use(cors({
    origin: "http://localhost:5000",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================
// SESSION
// ===============================

app.use(session({
    secret: "taskflow-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));


// ===============================
// STATIC FILES
// ===============================

app.use(express.static(path.join(__dirname, "public")));


// ===============================
// API ROUTES
// ===============================

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("       TASKFLOW SERVER STARTED");
    console.log("======================================");
    console.log(`Website: http://localhost:${PORT}`);
    console.log("======================================");
    console.log("");
});