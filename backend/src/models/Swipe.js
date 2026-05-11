const mongoose = require('mongoose');

const swipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'pass'], required: true }
}, { timestamps: true });

// Prevent duplicate swipe (same user on same target)
swipeSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });
swipeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Swipe', swipeSchema);
