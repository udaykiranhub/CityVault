// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendOtpMsg91 = require("../utils/sendOtpMsg91"); // MSG91 helper

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ======================
// LOGIN (STEP 1: PASSWORD VALIDATION)
// ======================
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ phone });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate OTP after password validation
    const otpPlain = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6-digit
    console.log("OTP is :",otpPlain)
    const salt = await bcrypt.genSalt(10);
    const otpHashed = await bcrypt.hash(otpPlain, salt);

    user.otp = otpHashed;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP via MSG91
    const success = await sendOtpMsg91(phone, otpPlain);
    console.log("Success of Msg91:", success);

    if (!success) return res.status(500).json({ message: "Failed to send OTP" });

    res.json({
      message: "OTP sent to your registered phone. Please verify to complete login.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ======================
// VERIFY OTP (STEP 2: FINAL LOGIN)
// ======================
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ phone }).select("+otp +otpExpiresAt");
    if (!user || !user.otp)
      return res.status(400).json({ message: "No OTP requested" });

    if (user.otpExpiresAt < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    const match = await bcrypt.compare(otp, user.otp);
    if (!match)
      return res.status(400).json({ message: "Invalid OTP" });

    // Clear OTP fields
    user.otp = null;
    user.otpExpiresAt = null;
    user.isVerified = true;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: "OTP verified. Login successful!",
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ======================
// REQUEST OTP
// ======================
const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpPlain = (Math.floor(100000 + Math.random() * 900000)).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHashed = await bcrypt.hash(otpPlain, salt);

    user.otp = otpHashed;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const success = await sendOtpMsg91(phone, otpPlain);
    if (!success) return res.status(500).json({ message: "Failed to send OTP" });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
};

// ======================
// GET CURRENT USER PROFILE
// ======================
const getProfile = async (req, res) => {
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
};

// Export all functions properly - REMOVE THE CIRCULAR DEPENDENCY
module.exports = {
  login,
  verifyOtp,
  requestOtp,
  getProfile
};