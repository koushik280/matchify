const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect routes – verify access token
 * Usage: router.get('/profile', protect, getProfile)
 */

const protect = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken; // 👈 read from cookie
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user || user.isBlocked) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or blocked user" });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = { protect };
