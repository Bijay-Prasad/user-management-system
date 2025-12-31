const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL // Production URL from env
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "User Management System API",
        status: "running",
        version: "1.0.0"
    });
});

// API routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;