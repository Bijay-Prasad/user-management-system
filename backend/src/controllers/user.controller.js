const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.getAllUsers = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const users = await User.find()
        .limit(10)
        .skip((page - 1) * 10)
        .select("-password");

    res.json(users);
};

exports.toggleStatus = async (req, res) => {
    const user = await User.findById(req.params.id);
    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();
    res.json({ message: "Status updated" });
};

exports.updateProfile = async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, req.body);
    res.json({ message: "Profile updated" });
};

exports.changePassword = async (req, res) => {
    const hashed = await bcrypt.hash(req.body.password, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashed });
    res.json({ message: "Password changed" });
};