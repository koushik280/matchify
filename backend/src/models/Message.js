const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: ["text", "voice", "gif"], default: "text" },
    content: { type: String, required: true }, // text, URL of voice/gif
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // users who have read it
    deliveredAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Index for pagination (matchId + createdAt descending)
messageSchema.index({ matchId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
