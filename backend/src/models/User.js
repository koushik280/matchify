const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is requried"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      select: false,
    },
    googleId: { type: String, unique: true, sparse: true },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    age: { type: Number, min: 18, max: 99 },

    bio: { type: String, maxlength: 500 },

    photos: [{ type: String, required: true }],
    interests: [{ type: String, maxlength: 30 }],

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: false, default: null }, // [long, lat]
    },

    role: {
      type: String,
      enum: ["user", "moderator", "admin", "superadmin"],
      default: "user",
    },

    isVerified: { type: Boolean, default: false }, // admin or special badge
    isBlocked: { type: Boolean, default: false },
    boostExpiresAt: { type: Date, default: null }, // premium feature
    refreshToken: { type: String },
    lastActive: { type: Date, default: Date.now },
    profileViews: { type: Number, default: 0 },
    fcmTokens: [{ type: String }],
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });

// Clean up invalid location before saving
// Remove 'next' and use 'async'
userSchema.pre("save", async function () {
  // If location exists but coordinates are missing or invalid, set location to null
  if (
    this.location &&
    (!this.location.coordinates ||
      !Array.isArray(this.location.coordinates) ||
      this.location.coordinates.length !== 2)
  ) {
    this.location = undefined; // Use undefined or null depending on your schema requirements
  }
});

module.exports = mongoose.model("User", userSchema);
