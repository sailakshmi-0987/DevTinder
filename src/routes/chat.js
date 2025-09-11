const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
router.get("/:userId/:otherId", async (req, res) => {
  try {
    const { userId, otherId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId }
      ]
    }).sort({ time: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load chat history" });
  }
});

module.exports = router;
