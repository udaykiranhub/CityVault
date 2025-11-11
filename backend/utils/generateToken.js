// utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const payload = { id: userId };
  const secret = process.env.JWT_SECRET || "change_this_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;
