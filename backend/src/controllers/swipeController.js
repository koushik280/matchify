const User = require("../models/User");
const Swipe = require("../models/Swipe");
const Match = require("../models/Match");
const admin = require("../config/firebase");

/**
 * Get discovery feed (candidates to swipe)
 * GET /api/discover?limit=10&cursor=...
 */
const getDiscoveryFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);
    const cursor = req.query.cursor;

    // Get IDs already swiped by current user
    const swipedUsers = await Swipe.find({ userId: currentUserId }).distinct(
      "targetUserId",
    );

    // Build query – exclude self AND already swiped
    const query = {
      _id: { $ne: currentUserId, $nin: swipedUsers },
      isBlocked: false,
      "photos.0": { $exists: true },
      age: { $gte: 18, $lte: 99 },
    };

    // Optional age preference
    if (req.user.age) {
      query.age = { $gte: req.user.age - 5, $lte: req.user.age + 5 };
    }

    // Cursor pagination
    if (cursor) {
      query._id.$lt = cursor;
    }

    const candidates = await User.find(query)
      .select("name age photos interests bio")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = candidates.length > limit;
    const users = hasMore ? candidates.slice(0, limit) : candidates;
    const nextCursor = hasMore ? users[users.length - 1]._id : null;

    if (users.length > 0) {
      const candidateIds = users.map((user) => user._id);
      await User.updateMany(
        { _id: { $in: candidateIds } },
        { $inc: { profileViews: 1 } },
      );
    }

    res.status(200).json({
      success: true,
      data: users,
      pagination: { nextCursor, hasMore, limit },
    });
  } catch (error) {
    console.error("Discovery feed error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
/**
 * Record a swipe (like or pass)
 * POST /api/swipe
 * Body: { targetUserId, type: 'like' | 'pass' }
 */
const createSwipe = async (req, res) => {
  try {
    const { targetUserId, type } = req.body;
    const currentUserId = req.user._id;

    // Validation
    if (!targetUserId || !["like", "pass"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid swipe data" });
    }

    if (targetUserId === currentUserId.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot swipe on yourself" });
    }

    // Check if target user exists and is not blocked
    const targetUser = await User.findById(targetUserId);
    if (!targetUser || targetUser.isBlocked) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or blocked" });
    }

    // Check for duplicate swipe (unique index will catch, but we can check manually)
    const existingSwipe = await Swipe.findOne({
      userId: currentUserId,
      targetUserId,
    });
    if (existingSwipe) {
      return res
        .status(409)
        .json({ success: false, message: "Already swiped on this user" });
    }

    // Create swipe record
    const swipe = new Swipe({
      userId: currentUserId,
      targetUserId,
      type,
    });
    await swipe.save();

    let match = null;
    let isMutual = false;

    // If it's a 'like', check for mutual like
    if (type === "like") {
      // Check if target user also liked current user
      const mutualSwipe = await Swipe.findOne({
        userId: targetUserId,
        targetUserId: currentUserId,
        type: "like",
      });

      if (mutualSwipe) {
        isMutual = true;
        // Create a new match
        match = new Match({
          userId1: currentUserId,
          userId2: targetUserId,
          isActive: true,
          lastMessageAt: new Date(),
        });
        await match.save();

        const otherUserId = match.userId1.equals(currentUserId)
          ? match.userId2
          : match.userId1;
        const otherUser = await User.findById(otherUserId);
        if (otherUser.fcmTokens && otherUser.fcmTokens.length > 0) {
          const message = {
            notification: {
              title: "New Match!",
              body: `${req.user.name} liked you back!`,
            },
            tokens: otherUser.fcmTokens,
          };
          admin.messaging().sendEachForMulticast(message).catch(console.error);
        }
      }
    }

    // Prepare response
    const response = {
      success: true,
      swipe: { id: swipe._id, type },
      isMutual,
    };
    if (match) {
      response.match = { id: match._id, createdAt: match.createdAt };
    }

    res.status(201).json(response);
  } catch (error) {
    // Handle duplicate key error (MongoError code 11000)
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Already swiped on this user" });
    }
    console.error("Swipe error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get list of matches for current user
 * GET /api/matches
 */
const getMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const matches = await Match.find({
      $or: [{ userId1: userId }, { userId2: userId }],
      isActive: true,
    })
      .populate("userId1", "name photos age")
      .populate("userId2", "name photos age");

    const formattedMatches = matches
      .map((match) => {
        const otherUser = match.userId1._id.equals(userId)
          ? match.userId2
          : match.userId1;
        // Fallback if otherUser is unexpectedly null/undefined
        if (!otherUser || !otherUser.name) {
          console.warn("Invalid match data:", match);
          return null;
        }
        return {
          matchId: match._id,
          userId: otherUser._id,
          name: otherUser.name,
          photo: otherUser.photos?.[0] || null,
          age: otherUser.age,
          matchedAt: match.createdAt,
          lastMessageAt: match.lastMessageAt,
        };
      })
      .filter((m) => m !== null); // remove malformed matches

    res.json({ success: true, data: formattedMatches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get nearby users (within radius) who haven't been swiped
 * GET /api/discover/nearby?radius=10&limit=20
 * radius in kilometers (default 10)
 */
const getNearbyUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const radius = parseFloat(req.query.radius) || 10;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    // Ensure current user has a valid location
    if (
      !req.user.location ||
      !req.user.location.coordinates ||
      req.user.location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please update your location first (PATCH /api/profile/location)",
      });
    }

    // Get already swiped user IDs
    const swipedUsers = await Swipe.find({ userId: currentUserId }).distinct(
      "targetUserId",
    );

    const nearbyUsers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: req.user.location.coordinates,
          },
          distanceField: "distance",
          maxDistance: radius * 1000,
          spherical: true,
          query: {
            _id: { $ne: currentUserId, $nin: swipedUsers },
            isBlocked: false,
            "photos.0": { $exists: true },
            "location.coordinates": { $exists: true, $ne: null },
          },
        },
      },
      { $match: { age: { $gte: 18, $lte: 99 } } },
      { $sort: { distance: 1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          age: 1,
          photos: 1,
          bio: 1,
          interests: 1,
          distance: 1,
        },
      },
    ]);

    // Convert distance from meters to kilometers (string with 1 decimal)
    const formatted = nearbyUsers.map((user) => ({
      ...user,
      distanceKm: (user.distance / 1000).toFixed(1),
    }));

    res.json({
      success: true,
      data: formatted,
      radius,
      count: formatted.length,
    });
  } catch (error) {
    console.error("Nearby users error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
};

module.exports = { getDiscoveryFeed, createSwipe, getMatches, getNearbyUsers };
