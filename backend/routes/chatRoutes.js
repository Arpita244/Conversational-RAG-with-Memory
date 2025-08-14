import express from "express";
import { chatWithMemory } from "../controllers/chatController.js";
import Message from "../models/Message.js";
const router = express.Router();

router.post("/", chatWithMemory);

// fetch last N turns as history for frontend
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ userId }).sort({ timestamp: 1 }).lean();
    res.json({ success: true, messages });
  } catch (err) {
    console.error("history err", err);
    res.status(500).json({ success: false, error: "failed" });
  }
});

export default router;
