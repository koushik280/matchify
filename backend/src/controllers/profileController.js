const User = require("../models/User");
const Match = require("../models/Match");
const Message = require("../models/Message");
const { cloudinary } = require("../config/cloudinary");

/**
 * Get current user's profile
 * GET /api/profile/me
 */
const getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    // Count active matches
    const matchesCount = await Match.countDocuments({
      $or: [{ userId1: userId }, { userId2: userId }],
      isActive: true,
    });
    const messagesCount = await Message.countDocuments({ senderId: userId });
    const userObj = user.toObject();
    userObj.matchesCount = matchesCount;
    userObj.messagesCount = messagesCount;

    // req.user is already attached by protect middleware
    res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update profile fields (except photos)
 * PATCH /api/profile/update
 */
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      "name",
      "bio",
      "age",
      "interests",
      "location",
      "photos",
    ];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Validate age if present
    if (updates.age && (updates.age < 18 || updates.age > 99)) {
      return res
        .status(400)
        .json({ success: false, message: "Age must be 18-99" });
    }

    // Validate interests array
    if (updates.interests && !Array.isArray(updates.interests)) {
      return res
        .status(400)
        .json({ success: false, message: "Interests must be an array" });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
      { returnDocument: "after", runValidators: true },
    ).select("-passwordHash");

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Upload a new profile photo
 * POST /api/profile/upload-photo
 * Expects multipart/form-data with field name "photo"
 */
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Cloudinary URL is available at req.file.path
    const photoUrl = req.file.path;

    // Add photo to user's photos array
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { photos: photoUrl } },
      { new: true },
    ).select("-passwordHash");

    res.status(200).json({
      success: true,
      message: "Photo uploaded successfully",
      user: user,
    });
  } catch (error) {
    console.error("Upload photo error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

/**
 * Delete a profile photo
 * DELETE /api/profile/delete-photo
 * Body: { photoUrl: "https://res.cloudinary.com/..." }
 */
const deletePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    if (!photoUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Photo URL required" });
    }

    const user = req.user;

    // Check if photo exists in user's array
    if (!user.photos.includes(photoUrl)) {
      return res
        .status(404)
        .json({ success: false, message: "Photo not found in profile" });
    }

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/matchify/profiles/filename.jpg
    const publicId = photoUrl.split("/").slice(-2).join("/").split(".")[0];
    // Example: 'matchify/profiles/filename'

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from user's photos array
    user.photos = user.photos.filter((url) => url !== photoUrl);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Photo deleted",
      user: user,
    });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

/**
 * Reorder photos (optional)
 * PATCH /api/profile/reorder-photos
 * Body: { order: [url1, url2, ...] }
 */
const reorderPhotos = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order) || order.length !== req.user.photos.length) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order array" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { photos: order },
      { new: true },
    ).select("-passwordHash");

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Reorder photos error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update current user's location
 * PATCH /api/profile/location
 * Body: { longitude, latitude }
 */
const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Longitude and latitude are required",
      });
    }

    // Validate ranges: long -180 to 180, lat -90 to 90
    if (
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
      { new: true },
    ).select("-passwordHash");

    res.status(200).json({
      success: true,
      message: "Location updated",
      user,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  uploadPhoto,
  deletePhoto,
  reorderPhotos,
  updateLocation,
};
