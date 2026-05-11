const AuditLog = require("../models/AuditLog");

/**
 * Log admin action
 * @param {string} adminId - ObjectId of admin user
 * @param {string} action - e.g., 'block_user', 'delete_user', 'change_role'
 * @param {string} targetId - ObjectId of affected entity
 * @param {string} targetModel - 'User' or 'Report'
 * @param {object} details - additional data (optional)
 * @param {string} ipAddress - request IP (optional)
 */
const logAdminAction = async ({
  adminId,
  action,
  targetId,
  targetModel,
  details = {},
  ipAddress = null,
}) => {
  try {
    const log = new AuditLog({
      adminId,
      action,
      targetId,
      targetModel,
      details,
      ipAddress,
    });
    await log.save();
  } catch (error) {
    console.error("Audit log error:", error);
  }
};

module.exports = { logAdminAction };
