

// controllers/adminUserController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');

const generateRandomPassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Generate unique email
const generateUniqueEmail = (phone, name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  return `user${phone}@cityvault.com`;
};




// const createUserByAdmin = async (req, res) => {
//   try {
//     const { name, phone, role, department, email } = req.body;

//     if (!name || !phone || !role || !email)
//       return res.status(400).json({ message: "Missing fields" });

//     if (!["User", "HOD", "Commissioner"].includes(role))
//       return res.status(400).json({ message: "Invalid role" });

//     const existingPhone = await User.findOne({ phone });
//     if (existingPhone)
//       return res.status(400).json({ message: "Phone already registered" });

//     const existingEmail = await User.findOne({ email });
//     if (existingEmail)
//       return res.status(400).json({ message: "Email already registered" });

//     // Generate UUID as password
//     const uuidPassword = uuidv4();
//     const hashed = await bcrypt.hash(uuidPassword, 10);

//     const newUser = await User.create({
//       name,
//       phone,
//       email,
//       role,
//       password: hashed, // Store bcrypt hash for login
//       generatedPassword: uuidPassword, // Store plain UUID for admin
//       passwordCreatedAt: new Date(),
//       department: role === "HOD" ? department : null,
//       isVerified: true,
//     });

//     res.status(201).json({
//       message: `${role} created successfully by admin`,
//       userId: newUser._id,
//       generatedPassword: uuidPassword,
//       email: email
//     });
//   } catch (err) {
//     console.error("Create user error:", err);
//     res.status(500).json({ message: "Failed to create user" });
//   }
// };



const createUserByAdmin = async (req, res) => {
  try {
    const { name, phone, role, department, email } = req.body;

    if (!name || !phone || !role || !email)
      return res.status(400).json({ message: "Missing fields" });

    if (!["User", "HOD", "Commissioner"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    // Department validation based on role
    if (role === "HOD" && !department) {
      return res.status(400).json({ 
        message: "Department is required for HOD role" 
      });
    }

    // For regular Users, department is optional but can be assigned
    if (role === "User" && !department) {
      // Allow Users without department, but admin can assign if needed
      console.log("User created without department - can be assigned later");
    }

    // For Commissioner, typically no department needed
    if (role === "Commissioner" && department) {
      return res.status(400).json({ 
        message: "Commissioner role should not have a department" 
      });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return res.status(400).json({ message: "Phone already registered" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ message: "Email already registered" });

    // Generate memorable password (8 characters, easy to remember)
    const memorablePassword = generateMemorablePassword();
    const hashed = await bcrypt.hash(memorablePassword, 10);

    const newUser = await User.create({
      name,
      phone,
      email,
      role,
      password: hashed,
      generatedPassword: memorablePassword,
      passwordCreatedAt: new Date(),
      department: department || null, // All roles can have department (except Commissioner)
      isVerified: true,
    });

    // Custom messages based on role and department
    let noteMessage = "";
    if (role === "HOD") {
      noteMessage = `HOD created for ${department} department. Share this password with the user.`;
    } else if (role === "User" && department) {
      noteMessage = `User created in ${department} department. Share this password with the user.`;
    } else if (role === "User" && !department) {
      noteMessage = "User created (no department assigned). Share this password with the user.";
    } else if (role === "Commissioner") {
      noteMessage = "Commissioner created. Share this password with the user.";
    }

    res.status(201).json({
      message: `${role} created successfully by admin`,
      userId: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      generatedPassword: memorablePassword,
      note: noteMessage
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// Generate memorable password (8 characters, easy to remember)
const generateMemorablePassword = () => {
  const vowels = 'aeiou';
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const numbers = '23456789';
  const specialChars = '!@#$';
  
  let password = '';
  
  // Pattern: Consonant + Vowel + Consonant + Number + Special + Consonant + Vowel + Number
  password += consonants[Math.floor(Math.random() * consonants.length)];
  password += vowels[Math.floor(Math.random() * vowels.length)];
  password += consonants[Math.floor(Math.random() * consonants.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  password += consonants[Math.floor(Math.random() * consonants.length)];
  password += vowels[Math.floor(Math.random() * vowels.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  return password;
};
// ==========================
// ADMIN → UPDATE USER
// ==========================
const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow role change to Admin
    if (updates.role === "Admin")
      return res.status(403).json({ message: "Cannot assign Admin role" });

    // If updating password, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// ==========================
// ADMIN → DELETE USER
// ==========================
const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.role === "Admin")
      return res.status(403).json({ message: "Cannot delete admin" });

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// ==========================
// ADMIN → GET ALL USERS
// ==========================
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find()
//       .select("-password -otp -resetPasswordToken")
//       .sort({ createdAt: -1 });

//     res.json({
//       message: "Users retrieved successfully",
//       count: users.length,
//       users
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to retrieve users" });
//   }
// };
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -otp -resetPasswordToken") // Still exclude the bcrypt password
      .sort({ createdAt: -1 });

    const usersWithPasswords = users.map(user => ({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      department: user.department,
      generatedPassword: user.generatedPassword || "Not available",
      passwordAge: user.passwordCreatedAt ? 
        Math.floor((Date.now() - user.passwordCreatedAt) / (1000 * 60 * 60 * 24)) + ' days ago' : 
        "Unknown",
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      message: "Users retrieved successfully",
      count: users.length,
      users: usersWithPasswords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

// ==========================
// ADMIN → GET USER BY ID
// ==========================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password -otp -resetPasswordToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User retrieved successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve user" });
  }
};

// ==========================
// ADMIN → GET USERS BY ROLE
// ==========================
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    if (!["User", "HOD", "Commissioner", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const users = await User.find({ role })
      .select("-password -otp -resetPasswordToken")
      .sort({ createdAt: -1 });

    res.json({
      message: `${role}s retrieved successfully`,
      count: users.length,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve users by role" });
  }
};

// ==========================
// ADMIN → GET USERS STATISTICS
// ==========================
const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      message: "Statistics retrieved successfully",
      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        usersByRole,
        recentUsersLast7Days: recentUsers
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve statistics" });
  }
};

// ==========================
// ADMIN → TOGGLE USER ACTIVE STATUS
// ==========================
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "Admin") {
      return res.status(403).json({ message: "Cannot deactivate admin account" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user status" });
  }
};

// ==========================
// ADMIN → SEARCH USERS
// ==========================
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } }
      ]
    })
    .select("-password -otp -resetPasswordToken")
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      message: "Search completed successfully",
      count: users.length,
      searchQuery: query,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
};

// ==========================
// ADMIN → GET RECENTLY CREATED USERS
// ==========================
const getRecentUsers = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const users = await User.find({
      createdAt: { $gte: startDate }
    })
    .select("-password -otp -resetPasswordToken")
    .sort({ createdAt: -1 })
    .limit(100);

    res.json({
      message: `Recently created users (last ${days} days)`,
      count: users.length,
      period: `${days} days`,
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve recent users" });
  }
};

module.exports = {
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
};