// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  requestOtp,
  verifyOtp,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);

// Protected
router.get("/me", protect, getProfile);

module.exports = router;
