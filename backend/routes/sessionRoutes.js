// backend/routes/sessionRoutes.js
import express from "express";
import { authRequired } from "../middleware/auth.js";
import {
  listSessions,
  createSession,
  renameSession,
  deleteSession,
  getSessionMessages,
  postMessage
} from "../controllers/sessionController.js";

const router = express.Router();

router.get("/", authRequired, listSessions);
router.post("/", authRequired, createSession);
router.patch("/:sessionId", authRequired, renameSession);
router.delete("/:sessionId", authRequired, deleteSession);

router.get("/:sessionId/messages", authRequired, getSessionMessages);
router.post("/:sessionId/messages", authRequired, postMessage);

export default router;