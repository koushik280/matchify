const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    userId1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Unique compound index to prevent duplicate matches
matchSchema.index({ userId1: 1, userId2: 1 }, { unique: true });
matchSchema.index({ userId1: 1, lastMessageAt: -1 });
matchSchema.index({ userId2: 1, lastMessageAt: -1 });

module.exports = mongoose.model("Match", matchSchema);
