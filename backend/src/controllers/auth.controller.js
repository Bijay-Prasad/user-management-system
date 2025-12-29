const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/token");

exports.signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed });

    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({ message: "Signup successful" });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password)))
        return res.status(401).json({ message: "Invalid credentials" });

    if (user.status === "inactive")
        return res.status(403).json({ message: "Account inactive" });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });

    res.json({ message: "Login successful" });
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
};

exports.me = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
};