const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, required: true }, // e.g., 'block_user', 'delete_user', 'change_role'
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },
    targetModel: { type: String, required: true, enum: ["User", "Report"] },
    details: { type: mongoose.Schema.Types.Mixed }, // flexible extra data
    ipAddress: { type: String },
  },
  { timestamps: true },
);

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ targetId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
