const User = require("../models/User");


// ==========================
// USER → GET MY DEPARTMENT
// ==========================
const getMyDepartment = async (req, res) => {
  try {
    const user = req.user; // From auth middleware

    res.json({
      message: "Department retrieved successfully",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        department: user.department,
        hasDepartment: !!user.department,
        departmentInfo: user.department ? 
          `You are in ${user.department} department` : 
          "No department assigned"
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve department" });
  }
};

// ==========================
// USER → GET DEPARTMENT BY PHONE
// ==========================
const getDepartmentByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await User.findOne({ phone: parseInt(phone) })
      .select("name phone role department isActive");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    res.json({
      message: "Department retrieved successfully",
      user: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        department: user.department,
        hasDepartment: !!user.department,
        departmentStatus: user.department ? 
          `${user.name} is in ${user.department} department` : 
          `${user.name} has no department assigned`
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve department" });
  }
};

// ==========================
// USER → GET ALL DEPARTMENTS LIST
// ==========================
const getDepartmentsList = async (req, res) => {
  try {
    const departments = await User.aggregate([
      { $match: { department: { $ne: null } } }, // Only users with departments
      {
        $group: {
          _id: "$department",
          userCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort alphabetically
    ]);

    res.json({
      message: "Departments list retrieved successfully",
      count: departments.length,
      departments: departments.map(dept => ({
        name: dept._id,
        userCount: dept.userCount
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve departments list" });
  }
};

// ==========================
// USER → GET USERS IN MY DEPARTMENT
// ==========================
const getMyDepartmentUsers = async (req, res) => {
  try {
    const currentUser = req.user;

    if (!currentUser.department) {
      return res.status(404).json({ 
        message: "You are not assigned to any department" 
      });
    }

    const users = await User.find({ 
      department: currentUser.department,
      isActive: true 
    })
    .select("name phone email role")
    .sort({ role: -1, name: 1 }); // HOD first, then alphabetical

    const hod = users.find(user => user.role === "HOD");
    const colleagues = users.filter(user => 
      user.role === "User" && user._id.toString() !== currentUser._id.toString()
    );

    res.json({
      message: `Users in ${currentUser.department} department retrieved successfully`,
      department: currentUser.department,
      hod: hod ? {
        name: hod.name,
        phone: hod.phone,
        email: hod.email
      } : null,
      colleagues: colleagues.map(user => ({
        name: user.name,
        phone: user.phone,
        email: user.email
      })),
      totalColleagues: colleagues.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve department users" });
  }
};



// Export all department functions
module.exports = {
  getMyDepartment,
  getDepartmentByPhone,
  getDepartmentsList,
  getMyDepartmentUsers
};