const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");
const {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  changeUserRole,
  getAllReports,
  resolveReport,
  getDashboardStats,
  toggleUserVerification,
} = require("../controllers/adminController");
const { getAnalytics } = require("../controllers/analyticsController");
// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo("admin", "superadmin"));

// User management
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination and filters
 *     tags: [Admin]
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
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, moderator, admin, superadmin]
 *       - in: query
 *         name: isBlocked
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Paginated users list
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
 *                     $ref: '#/components/schemas/User'
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
 */
router.get("/users", getAllUsers);
/**
 * @swagger
 * /admin/users/{userId}/block:
 *   patch:
 *     summary: Block or unblock a user (admin or superadmin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isBlocked
 *             properties:
 *               isBlocked:
 *                 type: boolean
 *                 description: true to block, false to unblock
 *     responses:
 *       200:
 *         description: User blocked/unblocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: isBlocked must be boolean
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 */
router.patch("/users/:userId/block", toggleBlockUser);
/**
 * @swagger
 * /admin/users/{userId}/verify:
 *   patch:
 *     summary: Verify or unverify a user (superadmin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVerified
 *             properties:
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Verification status changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Superadmin role required
 */
router.patch("/users/:userId/verify", toggleUserVerification);
/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Permanently delete a user (superadmin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 *       403:
 *         description: Superadmin role required
 */
router.delete("/users/:userId", restrictTo("superadmin"), deleteUser); // only superadmin
/**
 * @swagger
 * /admin/users/{userId}/role:
 *   patch:
 *     summary: Change user role (superadmin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, moderator, admin, superadmin]
 *     responses:
 *       200:
 *         description: Role updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Superadmin role required
 */
router.patch("/users/:userId/role", restrictTo("superadmin"), changeUserRole); 
/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics (total users, blocked, pending reports, new today)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistics object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   $ref: '#/components/schemas/AdminStats'
 *       403:
 *         description: Admin role required
 */
router.get("/stats", getDashboardStats);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get analytics data for admin dashboard (user growth, activity, role distribution)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AnalyticsData'
 *       403:
 *         description: Admin role required
 */
router.get("/analytics", getAnalytics);
/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: Get all pending reports (admin/moderator)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, resolved, dismissed]
 *           default: pending
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated reports list
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
 *                     $ref: '#/components/schemas/Report'
 *       403:
 *         description: Admin/moderator role required
 */
router.get("/reports", getAllReports);
/**
 * @swagger
 * /admin/reports/{reportId}/resolve:
 *   patch:
 *     summary: Resolve a report (block user or dismiss)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution
 *             properties:
 *               resolution:
 *                 type: string
 *                 enum: [block_user, dismiss]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report resolved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Report already resolved
 *       403:
 *         description: Admin/moderator role required
 */
router.patch("/reports/:reportId/resolve", resolveReport);

module.exports = router;
