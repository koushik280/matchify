const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  getMe,
} = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("../middlewares/validators");
const { protect } = require("../middlewares/authMiddleware");
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               bio:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: User created, returns user and sets cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post("/register", validateRegister, register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, sets cookies and returns user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account blocked
 */
router.post("/login", validateLogin, login);
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: No refresh token provided
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", refresh);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user, clear cookies and remove FCM token
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM token to remove
 *     responses:
 *       200:
 *         description: Logout successful
 *       204:
 *         description: Already logged out (no user in request)
 */
router.post("/logout", protect, logout);
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile with match and message counts
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getMe);

module.exports = router;
