require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoute");
const userRoutes = require("./src/routes/userRoute");
const profileRoutes = require("./src/routes/profileRoutes");
const swipeRoutes = require("./src/routes/swipeRoutes");
const adminRoutes = require('./src/routes/adminRoutes');
const messageRoutes=require("./src/routes/chatRoutes")
const superAdminRoutes = require('./src/routes/superAdminRoutes');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authenticateSocket = require("./src/sockets/authSocket");
const chatSocketHandler = require("./src/sockets/chatSocket");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin:"https://matchify-livid.vercel.app",
    credentials: true,
  },
});

io.use(authenticateSocket);
io.on("connection", (socket) => {
  console.log(`User ${socket.user._id} connected via socket`);
  chatSocketHandler(io, socket);
});

// Global Middleware
app.use(helmet()); // security headers
app.use(
  cors({
    origin: "https://matchify-livid.vercel.app",
    credentials: true, // allow cookies
  }),
);

app.use(express.json()); // parse JSON bodies
app.use(cookieParser()); // parse cookies
app.use(morgan("dev")); // log requests

// Rate limiting (prevent brute force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/auth", limiter); // apply to auth routes only

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", swipeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/message',messageRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
