const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cookie = require("cookie"); // HIGHLIGHT: Install this: npm install cookie

const authenticateSocket = async (socket, next) => {
  try {
    // HIGHLIGHT: Get the cookies from the handshake headers
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("Authentication error: No cookies found"));
    }

    // HIGHLIGHT: Parse the cookies and look for your accessToken
    const cookies = cookie.parse(cookieHeader);
    const token = cookies.accessToken; // Ensure this matches your cookie name

    if (!token) {
      return next(new Error("Authentication error: No token in cookies"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select("-passwordHash");
    
    if (!user || user.isBlocked) {
      return next(new Error("Authentication error: User not found or blocked"));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    // HIGHLIGHT: Log the specific error for debugging
    console.error("Socket Auth Error:", error.message);
    next(new Error("Authentication error: Invalid token"));
  }
};

module.exports = authenticateSocket;