module.exports = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({
            success: false,
            message: `Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)} role required.`
        });
    }
    next();
};