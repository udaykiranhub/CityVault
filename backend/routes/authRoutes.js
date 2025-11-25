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
const departmentController = require("../controllers/departmentController"); // New file
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Auth routes
router.post("/login", authController.login);
router.post("/request-otp", authController.requestOtp);
router.post("/verify-otp", authController.verifyOtp);
router.get("/me", protect, authController.getProfile);



// Department routes (for authenticated users)
router.get("/my-department", protect, departmentController.getMyDepartment);
router.get("/department-users", protect, departmentController.getMyDepartmentUsers);
router.get("/departments", protect, departmentController.getDepartmentsList);
router.get("/department/:phone", protect, departmentController.getDepartmentByPhone);

module.exports = router;