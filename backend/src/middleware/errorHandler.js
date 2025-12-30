// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    // Default error
    let error = {
        success: false,
        message: err.message || "Internal server error",
        statusCode: err.statusCode || 500
    };

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error.statusCode = 409;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        error.message = "Validation failed";
        error.statusCode = 400;
        error.errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === "CastError") {
        error.message = `Invalid ${err.path}: ${err.value}`;
        error.statusCode = 400;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        error.message = "Invalid token";
        error.statusCode = 401;
    }

    if (err.name === "TokenExpiredError") {
        error.message = "Token expired";
        error.statusCode = 401;
    }

    // Send error response
    const response = {
        success: false,
        message: error.message,
        statusCode: error.statusCode
    };

    // Include errors array if present
    if (error.errors) {
        response.errors = error.errors;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    res.status(error.statusCode).json(response);
};

// Custom error class for operational errors
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { errorHandler, AppError };
