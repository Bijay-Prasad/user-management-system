const User = require("../models/User");
const bcrypt = require("bcrypt");
const { AppError } = require("../middleware/errorHandler");

exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await User.countDocuments();

        // Get users with pagination
        const users = await User.find()
            .select("-password")
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.toggleStatus = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent user from deactivating themselves
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own account status"
            });
        }

        // Toggle status
        user.status = user.status === "active" ? "inactive" : "active";
        await user.save();

        res.json({
            success: true,
            message: `User ${user.status === "active" ? "activated" : "deactivated"} successfully`,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { fullName, email } = req.body;
        const userId = req.user.id;

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email already in use"
                });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...(fullName && { fullName }),
                ...(email && { email })
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user with password
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        next(error);
    }
};