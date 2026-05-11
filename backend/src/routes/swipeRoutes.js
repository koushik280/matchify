const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getDiscoveryFeed,
  createSwipe,
  getMatches,
  getNearbyUsers,
} = require("../controllers/swipeController");

const { getMessages } = require("../controllers/messageController");
// All routes require authentication
router.use(protect);

// GET /api/discover - get swipe feed
router.get("/discover", getDiscoveryFeed);

// POST /api/swipe - record a swipe
router.post("/swipe", createSwipe);

// GET /api/matches - get user's matches
router.get("/matches", getMatches);

router.get("/messages/:matchId", getMessages);

router.get('/discover/nearby', getNearbyUsers);

module.exports = router;
