const Message = require("../models/Message");
const Match = require("../models/Match");
const admin = require("../config/firebase");
const User = require("../models/User");

module.exports = (io, socket) => {
  const userId = socket.user._id;

  const joinMatchRoom = (matchId) => {
    socket.join(matchId.toString());
    console.log(`User ${userId} joined room ${matchId}`);
  };

  const leaveMatchRoom = (matchId) => {
    socket.leave(matchId.toString());
  };

  const sendMessage = async (data, callback) => {
    try {
      const { matchId, type, content } = data;

      const match = await Match.findOne({
        $or: [{ userId1: userId }, { userId2: userId }],
        _id: matchId,
        isActive: true,
      });
      if (!match) {
        return callback({ error: "Match not found or not active" });
      }

      // Create and save message
      const newMessage = new Message({
        matchId,
        senderId: userId,
        type: type || "text",
        content,
        readBy: [userId],
      });
      await newMessage.save();

      // Update match's lastMessageAt
      match.lastMessageAt = new Date();
      await match.save();

      // Emit message to everyone in the room
      io.to(matchId.toString()).emit("receive_message", {
        _id: newMessage._id,
        matchId,
        senderId: userId,
        type,
        content,
        createdAt: newMessage.createdAt,
        readBy: newMessage.readBy,
      });

      // 🔔 Send push notification to recipient (if they have FCM tokens)
      const otherUserId = match.userId1.equals(userId)
        ? match.userId2
        : match.userId1;
      const [recipient, sender] = await Promise.all([
        User.findById(otherUserId).select("fcmTokens"),
        User.findById(userId).select("name"),
      ]);

      if (
        recipient?.fcmTokens?.length &&
        otherUserId.toString() !== userId.toString()
      ) {
        const notificationPayload = {
          notification: {
            title: "New Message",
            body: `${sender.name}: ${content.substring(0, 50)}`,
          },
          tokens: recipient.fcmTokens,
          data: { matchId: matchId.toString() },
        };
        admin
          .messaging()
          .sendEachForMulticast(notificationPayload)
          .catch((err) => console.error("Push error:", err));
      }

      callback({ success: true, messageId: newMessage._id });
    } catch (error) {
      console.error("Send message error:", error);
      callback({ error: "Failed to send message" });
    }
  };

  const startTyping = ({ matchId }) => {
    socket.to(matchId.toString()).emit("user_typing", { userId, matchId });
  };

  const stopTyping = ({ matchId }) => {
    socket.to(matchId.toString()).emit("user_stop_typing", { userId, matchId });
  };

  const markAsRead = async ({ matchId, messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && !message.readBy.includes(userId)) {
        message.readBy.push(userId);
        await message.save();
        io.to(matchId.toString()).emit("message_read", { messageId, userId });
      }
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  socket.on("join_match_room", joinMatchRoom);
  socket.on("leave_match_room", leaveMatchRoom);
  socket.on("send_message", sendMessage);
  socket.on("typing_start", startTyping);
  socket.on("typing_stop", stopTyping);
  socket.on("mark_read", markAsRead);

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
  });
};
