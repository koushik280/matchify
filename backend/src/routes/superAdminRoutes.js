const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");
const AuditLog = require("../models/AuditLog");

// Only superadmin
router.use(protect);
router.use(restrictTo("superadmin"));

/**
 * @swagger
 * /superadmin/audit-logs:
 *   get:
 *     summary: Get audit logs of admin actions (superadmin only)
 *     tags: [SuperAdmin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Paginated audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       403:
 *         description: Superadmin role required
 */
router.get("/audit-logs", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("adminId", "name email");
    const total = await AuditLog.countDocuments();
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Audit logs error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
