import express from "express";
import { chatWithMemory } from "../controllers/chatController.js";

const router = express.Router();
router.post("/", chatWithMemory);

export default router;
