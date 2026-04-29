const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getAuthCookieName } = require("../utils/authCookie");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token && req.cookies) {
    const cookieName = getAuthCookieName();
    const cookieToken = req.cookies[cookieName];
    if (typeof cookieToken === "string" && cookieToken.trim()) {
      token = cookieToken.trim();
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found." });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired." });
  }
};

module.exports = { protect };
