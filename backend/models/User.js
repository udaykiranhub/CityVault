// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // hashed password (we hash in controller)
    password: { type: String, required: true, minlength: 8 },

    role: {
      type: String,
      enum: ["User", "HOD", "Commissioner"],
      default: "User",
    },

    // OTP fields for future OTP-based auth
    otp: { type: String, default: null }, // store hashed OTP
    otpExpiresAt: { type: Date, default: null },

    // Account management
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Password reset (optional)
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
