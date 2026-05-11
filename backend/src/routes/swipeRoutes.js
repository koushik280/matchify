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

/**
 * @swagger
 * /discover:
 *   get:
 *     summary: Get swipe feed (candidates not swiped yet)
 *     tags: [Swipes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Pagination cursor (last user _id)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 *                     hasMore:
 *                       type: boolean
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/discover", getDiscoveryFeed);

/**
 * @swagger
 * /swipe:
 *   post:
 *     summary: Like or pass a user
 *     tags: [Swipes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - type
 *             properties:
 *               targetUserId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [like, pass]
 *     responses:
 *       201:
 *         description: Swipe recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SwipeResponse'
 *       409:
 *         description: Already swiped on this user
 *       400:
 *         description: Invalid request (e.g., self swipe)
 */
router.post("/swipe", createSwipe);

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get list of active matches (mutual likes)
 *     tags: [Swipes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *       401:
 *         description: Unauthorized
 */
router.get("/matches", getMatches);
/**
 * @swagger
 * /messages/{matchId}:
 *   get:
 *     summary: Get chat history for a specific match
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the match
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to fetch (pagination)
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages older than this timestamp (for pagination)
 *     responses:
 *       200:
 *         description: List of messages (oldest first)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       403:
 *         description: Not authorized to view this match
 *       401:
 *         description: Unauthorized
 */
router.get("/messages/:matchId", getMessages);
/**
 * @swagger
 * /discover/nearby:
 *   get:
 *     summary: Get nearby users within radius (requires location)
 *     tags: [Swipes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Radius in kilometers
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of nearby users with distance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: User location not set
 */
router.get("/discover/nearby", getNearbyUsers);

module.exports = router;
