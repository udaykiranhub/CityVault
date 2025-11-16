
const express = require("express");
const router = express.Router();

const { registerAdmin } = require("../controllers/adminController");
const { 
  createUserByAdmin, 
  updateUserByAdmin, 
  deleteUserByAdmin,
  getAllUsers,
  getUserById,
  getUsersByRole,
  getUserStatistics,
  toggleUserStatus,
  searchUsers,
  getRecentUsers
} = require("../controllers/adminUserController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Admin registration route
router.post("/register-admin", registerAdmin);

// User management routes
router.post("/users", protect, authorizeRoles("Admin"), createUserByAdmin);
router.put("/users/:id", protect, authorizeRoles("Admin"), updateUserByAdmin);
router.delete("/users/:id", protect, authorizeRoles("Admin"), deleteUserByAdmin);

// NEW ROUTES - User retrieval and management
router.get("/users", protect, authorizeRoles("Admin"), getAllUsers);
router.get("/users/recent", protect, authorizeRoles("Admin"), getRecentUsers);
router.get("/users/search", protect, authorizeRoles("Admin"), searchUsers);
router.get("/users/statistics", protect, authorizeRoles("Admin"), getUserStatistics);
router.get("/users/role/:role", protect, authorizeRoles("Admin"), getUsersByRole);
router.get("/users/:id", protect, authorizeRoles("Admin"), getUserById);
router.patch("/users/:id/toggle-status", protect, authorizeRoles("Admin"), toggleUserStatus);

module.exports = router;