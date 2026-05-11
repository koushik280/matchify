const User = require("../models/User");
const Match = require("../models/Match");
const Message = require("../models/Message");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Helper to get cookie options based on environment
const getCookieOptions = (maxAge) => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction, // ✅ true in production (HTTPS)
    sameSite: isProduction ? "none" : "lax", // ✅ 'none' for cross‑origin in production
    maxAge,
  };
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name, age, bio, interests } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      passwordHash,
      name,
      age: age || null,
      bio: bio || "",
      interests: interests || [],
      photos: [],
      role: "user",
      isVerified: false,
      isBlocked: false,
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    // ✅ Use dynamic cookie options
    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie(
      "refreshToken",
      refreshToken,
      getCookieOptions(7 * 24 * 60 * 60 * 1000),
    );

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
      accessToken,
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Contact support.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // ✅ Use dynamic cookie options
    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie(
      "refreshToken",
      refreshToken,
      getCookieOptions(7 * 24 * 60 * 60 * 1000),
    );

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

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

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

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "Account blocked" });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    // ✅ Use dynamic cookie options
    res.cookie("accessToken", newAccessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie(
      "refreshToken",
      newRefreshToken,
      getCookieOptions(7 * 24 * 60 * 60 * 1000),
    );

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

    if (!req.user) {
      return res.status(204).send(); // Session already gone
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshToken: null },
      $pull: { fcmTokens: token },
    });

    // ✅ Clear cookies with same options (to completely remove them)
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    const matchesCount = await Match.countDocuments({
      $or: [{ userId1: userId }, { userId2: userId }],
      isActive: true,
    });

    const messagesCount = await Message.countDocuments({ senderId: userId });

    const userObj = user.toObject();
    userObj.matchesCount = matchesCount;
    userObj.messagesCount = messagesCount;

    res.json({ success: true, user: userObj });
  } catch (error) {
    console.error(error);
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
