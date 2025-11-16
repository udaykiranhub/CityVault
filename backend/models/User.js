// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
 generatedPassword: { 
      type: String, 
      default: null 
    },
    passwordCreatedAt: {
      type: Date,
      default: Date.now
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
    },
    email: { 
      type: String, 
      default: null, 
      trim: true,
      unique: true 
    },
    password: { type: String, required: true, minlength: 8 },

    role: {
      type: String,
      enum: ["User", "HOD", "Commissioner", "Admin"],
      default: "User",
    },

    department: { type: String, default: null }, // only for HOD

    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
