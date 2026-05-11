const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const admin = require("../config/firebase");
const User=require("../models/User")

// GET /api/users/me – returns current user profile
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// POST /api/users/notification-token
router.post("/notification-token", protect, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res
        .status(400)
        .json({ success: false, message: "Token required" });
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { fcmTokens: token },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
