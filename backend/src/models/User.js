const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user"
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        lastLogin: Date,
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Index for faster email queries
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);