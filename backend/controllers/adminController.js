// controllers/adminController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==========================
// ADMIN REGISTER (ONLY ONE)
// ==========================
exports.registerAdmin = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password)
      return res.status(400).json({ message: "Missing fields" });

    // check if admin already exists
    const adminExists = await User.findOne({ role: "Admin" });
    if (adminExists) {
      return res.status(403).json({
        message: "Admin already exists. Only one admin allowed.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      phone,
      password: hashed,
      role: "Admin",
      isVerified: true,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      adminId: admin._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin registration failed" });
  }
};

