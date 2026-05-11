const User = require("../models/User");
const Match = require("../models/Match");
const Message = require("../models/Message");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

/**
 * Generate Access Token (short-lived, e.g., 15 minutes)
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {string} JWT access token
 */

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

/**
 * Generate Refresh Token (long-lived, e.g., 7 days)
 * @param {string} userId
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Register a new user
 * Expected req.body: { email, password, name, age, bio?, interests? }
 */
const register = async (req, res) => {
  try {
    // 1. Check for validation errors from express-validator middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password, name, age, bio, interests } = req.body;

    // 2. Check if user already exists (email unique)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // 3. Hash password using bcrypt with salt rounds = 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create new user (minimal fields – profile can be completed later)
    const newUser = new User({
      email,
      passwordHash,
      name,
      age: age || null,
      bio: bio || "",
      interests: interests || [],
      photos: [], // will be added later via profile update
      role: "user",
      isVerified: false,
      isBlocked: false,
    });

    await newUser.save();

    // 5. Generate tokens
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // 6. Store refresh token in database (for token rotation later)
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // 7. Set bothtoken as HTTP-only cookie (secure, not accessible via JS)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // prevents XSS
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 8. Send response (do NOT send passwordHash or refreshToken)
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isVerified: newUser.isVerified,
      profileCompleted: newUser.photos.length > 0 && newUser.age && newUser.bio,
    };

    res.status(201).json({
      success: true,
      accessToken, // client uses this for API calls
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Login existing user
 * Expected req.body: { email, password }
 */
const login = async (req, res) => {
  try {
    // 1. Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // 2. Find user by email (include passwordHash field explicitly)
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 3. Check if account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Contact support.",
      });
    }

    // 4. Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 5. Generate new tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 6. Store new refresh token in DB (overwrites old one – simple rotation)
    user.refreshToken = refreshToken;
    await user.save();

    // 7. Set both token as HTTP-only cookie

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 8. Send response (sanitized user)
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      profileCompleted: user.photos.length > 0 && user.age && user.bio,
    };

    res.status(200).json({
      success: true,
      accessToken,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
/**
 * Refresh access token using refresh token from cookie
 * Expected: refreshToken in HTTP-only cookie
 */
const refresh = async (req, res) => {
  try {
    // 1. Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    // 2. Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // 3. Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken: refreshToken,
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Refresh token not found in database",
      });
    }

    // 4. Check if account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked",
      });
    }

    // 5. Generate new tokens (rotate)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // 6. Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // 7. Set both token as cookie

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 8. Send new access token
    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.body;

    // If the interceptor loop is happening, req.user might be missing
    if (!req.user) {
      return res.status(204).send(); // Session already gone
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshToken: null },
      $pull: { fcmTokens: token }, // This pulls the specific browser token
    });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
const getMe = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    // Count active matches
    const matchesCount = await Match.countDocuments({
      $or: [{ userId1: userId }, { userId2: userId }],
      isActive: true,
    });

    // Count messages sent by this user
    const messagesCount = await Message.countDocuments({ senderId: userId });

    // Convert to plain object and add fields
    const userObj = user.toObject();
    userObj.matchesCount = matchesCount;
    userObj.messagesCount = messagesCount;

    // req.user is set by protect middleware
    res.json({ success: true, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = {
  register,
  generateAccessToken,
  generateRefreshToken,
  login,
  refresh,
  logout,
  getMe,
};
