// controllers/authController.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
    if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email" });
    if (password.length < 8) return res.status(400).json({ message: "Password too short (min 8)" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "User",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

// Get current user profile (protected)
exports.getProfile = async (req, res) => {
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
};

// Request OTP (for future OTP-based login/verify) - generates numeric OTP, stores hashed OTP + expiry
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpPlain = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6-digit
    const salt = await bcrypt.genSalt(10);
    const otpHashed = await bcrypt.hash(otpPlain, salt);

    user.otp = otpHashed;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: send otpPlain via email/SMS provider. For dev, we return it (remove in production)
    res.json({ message: "OTP generated (send via email/SMS in prod)", otp: otpPlain });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP generation failed" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email }).select("+otp +otpExpiresAt +password");
    if (!user || !user.otp) return res.status(400).json({ message: "No OTP requested" });

    if (user.otpExpiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });

    const match = await bcrypt.compare(otp, user.otp);
    if (!match) return res.status(400).json({ message: "Invalid OTP" });

    // OTP valid -> clear otp and optionally mark verified / issue token
    user.otp = null;
    user.otpExpiresAt = null;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);
    res.json({ message: "OTP verified", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
