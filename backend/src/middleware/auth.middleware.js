const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Check Authorization header first (for localStorage), then cookie
    let token = null;

    // Extract token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    }

    // Fallback to cookie if no Authorization header
    if (!token && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError" ? "Token expired" : "Invalid token"
        });
    }
};