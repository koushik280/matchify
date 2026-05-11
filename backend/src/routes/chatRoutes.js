const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getMessagesCount,getMessages } = require("../controllers/messageController");
/**
 * @swagger
 * /messages/{matchId}:
 *   get:
 *     summary: Get chat history for a match
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Pagination – get messages before this timestamp
 *     responses:
 *       200:
 *         description: Messages array (oldest first)
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
 *         description: Not authorized to this match
 *       401:
 *         description: Unauthorized
 */
router.get("/messages/:matchId", protect, getMessages);
/**
 * @swagger
 * /messages/count:
 *   get:
 *     summary: Get total number of messages sent by user
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Count of sent messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/messages/count", protect, getMessagesCount);


module.exports=router;