const { body, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Signup validation rules
const validateSignup = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2 })
        .withMessage("Full name must be at least 2 characters long"),
    
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    
    body("confirmPassword")
        .notEmpty()
        .withMessage("Please confirm your password")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords do not match"),
    
    handleValidationErrors
];

// Login validation rules
const validateLogin = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("password")
        .notEmpty()
        .withMessage("Password is required"),
    
    handleValidationErrors
];

// Profile update validation rules
const validateProfileUpdate = [
    body("fullName")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("Full name must be at least 2 characters long"),
    
    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("role")
        .not().exists()
        .withMessage("Role cannot be modified"),
    
    body("status")
        .not().exists()
        .withMessage("Status cannot be modified"),
    
    body("password")
        .not().exists()
        .withMessage("Use the change password endpoint to update password"),
    
    handleValidationErrors
];

// Password change validation rules
const validatePasswordChange = [
    body("oldPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
        .custom((value, { req }) => value !== req.body.oldPassword)
        .withMessage("New password must be different from current password"),
    
    body("confirmPassword")
        .notEmpty()
        .withMessage("Please confirm your new password")
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage("Passwords do not match"),
    
    handleValidationErrors
];

module.exports = {
    validateSignup,
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange
};
