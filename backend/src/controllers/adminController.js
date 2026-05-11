const User = require("../models/User");
const { logAdminAction } = require("../utils/auditLogger");
const Report = require("../models/Report");

/**
 * Get all users with filters (admin only)
 * GET /api/admin/users?role=user&isBlocked=false&page=1&limit=20
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, isBlocked, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isBlocked !== undefined) query.isBlocked = isBlocked === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Block or unblock a user (admin/superadmin)
 * PATCH /api/admin/users/:userId/block
 * Body: { isBlocked: true/false }
 */
const toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;
    if (typeof isBlocked !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isBlocked must be boolean" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true },
    ).select("-passwordHash");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Log action
    await logAdminAction({
      adminId: req.user._id,
      action: isBlocked ? "block_user" : "unblock_user",
      targetId: userId,
      targetModel: "User",
      details: { userName: user.name, userEmail: user.email },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Toggle block error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Delete a user (superadmin only)
 * DELETE /api/admin/users/:userId
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent deleting self
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account via admin panel",
      });
    }

    await user.deleteOne();

    await logAdminAction({
      adminId: req.user._id,
      action: "delete_user",
      targetId: userId,
      targetModel: "User",
      details: { userName: user.name, userEmail: user.email },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: "User deleted permanently" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Change user role (superadmin only)
 * PATCH /api/admin/users/:userId/role
 * Body: { role: 'user'|'moderator'|'admin'|'superadmin' }
 */
const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const validRoles = ["user", "moderator", "admin", "superadmin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select("-passwordHash");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await logAdminAction({
      adminId: req.user._id,
      action: "change_role",
      targetId: userId,
      targetModel: "User",
      details: { newRole: role, oldRole: user.role },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error("Change role error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get all reports (admin/moderator)
 * GET /api/admin/reports?status=pending&page=1&limit=20
 */
const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reports = await Report.find(query)
      .populate("reporterId", "name email")
      .populate("reportedUserId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);
    res.json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Resolve a report (admin/moderator)
 * PATCH /api/admin/reports/:reportId/resolve
 * Body: { resolution: 'block_user' | 'dismiss', note: 'optional' }
 */
const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { resolution, note } = req.body;
    if (!["block_user", "dismiss"].includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: "Resolution must be block_user or dismiss",
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }
    if (report.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Report already resolved" });
    }

    // If blocking user
    if (resolution === "block_user") {
      await User.findByIdAndUpdate(report.reportedUserId, { isBlocked: true });
    }

    report.status = "resolved";
    report.resolvedBy = req.user._id;
    report.resolutionNote =
      note ||
      (resolution === "block_user" ? "User blocked" : "Report dismissed");
    await report.save();

    await logAdminAction({
      adminId: req.user._id,
      action: `resolve_report_${resolution}`,
      targetId: reportId,
      targetModel: "Report",
      details: {
        reportedUserId: report.reportedUserId,
        reason: report.reason,
        note,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Report resolved - ${resolution}`,
      report,
    });
  } catch (error) {
    console.error("Resolve report error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today },
    });
    res.json({
      success: true,
      stats: { totalUsers, blockedUsers, pendingReports, newUsersToday },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Toggle user verification (superadmin only)
 * PATCH /api/admin/users/:userId/verify
 * Body: { isVerified: true/false }
 */
const toggleUserVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;
    if (typeof isVerified !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isVerified must be boolean" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified },
      { new: true },
    ).select("-passwordHash");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await logAdminAction({
      adminId: req.user._id,
      action: isVerified ? "verify_user" : "unverify_user",
      targetId: userId,
      targetModel: "User",
      details: { userName: user.name, userEmail: user.email },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User ${isVerified ? "verified" : "unverified"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Toggle verification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  changeUserRole,
  getAllReports,
  resolveReport,
  getDashboardStats,
  toggleUserVerification,
};


