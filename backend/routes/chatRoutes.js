import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { chatWithMemory, history } from "../controllers/chatController.js";

const router = Router();

// POST - send chat message
router.post("/", authRequired, chatWithMemory);

// GET - fetch chat history for a session
router.get("/history/:sessionId", authRequired, history);

export default router;
