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

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Submit a report against a user
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportedUserId
 *               - reason
 *             properties:
 *               reportedUserId:
 *                 type: string
 *                 description: MongoDB ObjectId of the user being reported
 *                 example: "69f571eeb1f0f73f32735a47"
 *               reason:
 *                 type: string
 *                 enum: [spam, fake_profile, harassment, underage, other]
 *                 description: Reason for reporting
 *                 example: "spam"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional additional details
 *                 example: "This user sent inappropriate messages"
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Report submitted successfully"
 *       400:
 *         description: Missing required fields or self‑report attempted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized (not logged in)
 *       404:
 *         description: Reported user not found
 *       500:
 *         description: Server error
 */
router.post("/reports", protect, async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: reportedUserId and reason",
      });
    }

    // Prevent self-report
    if (reportedUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself",
      });
    }

    // Check if reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const report = new Report({
      reporterId: req.user._id,
      reportedUserId,
      reason,
      description: description || "",
      status: "pending",
    });

    await report.save();
    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
    });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
