const express = require("express");
const router = express.Router();
const {
  register,
  login,
  requestOtp,   // only if you define it
  verifyOtp,
  getProfile
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/request-otp", requestOtp);  // optional
router.post("/verify-otp", verifyOtp);

// Protected
router.get("/me", protect, getProfile);

module.exports = router;
