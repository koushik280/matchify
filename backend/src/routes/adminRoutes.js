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
router.get("/users", getAllUsers);
router.patch("/users/:userId/block", toggleBlockUser);
router.patch("/users/:userId/verify", toggleUserVerification);
router.delete("/users/:userId", restrictTo("superadmin"), deleteUser); // only superadmin
router.patch("/users/:userId/role", restrictTo("superadmin"), changeUserRole); // only superadmin
router.get("/stats", getDashboardStats);
router.get("/analytics", getAnalytics);
// Report management
router.get("/reports", getAllReports);
router.patch("/reports/:reportId/resolve", resolveReport);

module.exports = router;
