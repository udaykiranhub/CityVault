// // routes/authRoutes.js
// const express = require("express");
// const router = express.Router();

// const authController = require("../controllers/authController");
// const { protect } = require("../middleware/authMiddleware");

// // Auth routes
// router.post("/login", authController.login);
// router.post("/request-otp", authController.requestOtp);
// router.post("/verify-otp", authController.verifyOtp);
// router.get("/me", protect, authController.getProfile);

// module.exports = router;


// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Auth routes
router.post("/login", authController.login);
router.post("/request-otp", authController.requestOtp);
router.post("/verify-otp", authController.verifyOtp);
router.get("/me", protect, authController.getProfile);

module.exports = router;