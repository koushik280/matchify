const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getMessagesCount,getMessages } = require("../controllers/messageController");

router.get("/messages/:matchId", protect, getMessages);
router.get("/messages/count", protect, getMessagesCount);


module.exports=router;