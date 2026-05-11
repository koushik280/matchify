const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const admin = require("../config/firebase");
const User = require("../models/User");

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile (basic info)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user object (from protect middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * @swagger
 * /users/notification-token:
 *   post:
 *     summary: Store or update the user's FCM (Firebase Cloud Messaging) token for push notifications
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM device token
 *     responses:
 *       200:
 *         description: Token stored successfully
 *       400:
 *         description: Token missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
