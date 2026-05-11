const mongoose = require('mongoose');
const Message = require('../models/Message');
const Match = require('../models/Match');

const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { limit = 50, before } = req.query;
    const userId = req.user._id;

    // Convert matchId to ObjectId
    const matchObjectId = new mongoose.Types.ObjectId(matchId);

    // Verify user belongs to this match
    const match = await Match.findOne({
      $or: [{ userId1: userId }, { userId2: userId }],
      _id: matchObjectId,
      isActive: true,
    });
    if (!match) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // Query messages
    const query = { matchId: matchObjectId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.status(200).json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};


/**
 * Get total number of messages sent by the authenticated user
 * GET /api/messages/count
 */
const getMessagesCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Message.countDocuments({ senderId: userId });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Messages count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



module.exports = { getMessages,getMessagesCount };