// backend/controllers/sessionController.js
import { v4 as uuid } from "uuid";
import Session from "../models/Session.js";
import Message from "../models/Message.js";
import Document from "../models/Document.js";
import { embedText, generateWithGemini } from "../utils/geminiClient.js";
import { cosineSim } from "../utils/textUtils.js";

/* list sessions for the logged-in user */
export const listSessions = async (req, res) => {
  const { userId } = req.user;
  const sessions = await Session.find({ userId }).sort({ updatedAt: -1 }).lean();
  res.json(sessions.map(s => ({ sessionId: s.sessionId, title: s.title })));
};

/* create session */
export const createSession = async (req, res) => {
  const { userId } = req.user;
  const { title } = req.body;
  const s = await Session.create({ userId, sessionId: uuid(), title: title || "New Chat" });
  res.json({ sessionId: s.sessionId, title: s.title });
};

/* rename */
export const renameSession = async (req, res) => {
  const { userId } = req.user;
  const { sessionId } = req.params;
  const { title } = req.body;
  const s = await Session.findOneAndUpdate({ userId, sessionId }, { $set: { title } }, { new: true });
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json({ sessionId: s.sessionId, title: s.title });
};

/* delete session and messages */
export const deleteSession = async (req, res) => {
  const { userId } = req.user;
  const { sessionId } = req.params;
  const s = await Session.findOneAndDelete({ userId, sessionId });
  if (!s) return res.status(404).json({ error: "Not found" });
  await Message.deleteMany({ userId, sessionId });
  res.json({ ok: true });
};

/* get messages */
export const getSessionMessages = async (req, res) => {
  const { userId } = req.user;
  const { sessionId } = req.params;
  const msgs = await Message.find({ userId, sessionId }).sort({ timestamp: 1 }).lean();
  res.json({ messages: msgs.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })) });
};

/* post a new message and run RAG+generation */
export const postMessage = async (req, res) => {
  try {
    const { userId, displayName } = req.user;
    const { sessionId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });

    // ensure session belongs to user
    const sess = await Session.findOne({ userId, sessionId });
    if (!sess) return res.status(403).json({ error: "Invalid session" });

    // embed user query
    const qVec = await embedText(content).catch(() => []);

    // retrieve top-k memories (latest user's messages across this session)
    const memCandidates = await Message.find({ userId, sessionId }).sort({ timestamp: -1 }).limit(200).lean();
    const scoredMem = memCandidates
      .map(m => ({ ...m, score: cosineSim(qVec, m.vector || []) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, 5)
      .filter(m => m.score > 0.12);

    // retrieve RAG doc chunks for user
    const docs = await Document.find({ userId }).lean();
    const allChunks = [];
    for (const d of docs) for (const c of d.chunks) allChunks.push({ ...c, title: d.title });
    const scoredChunks = allChunks
      .map(c => ({ ...c, score: cosineSim(qVec, c.vector || []) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, 4)
      .filter(c => c.score > 0.2);

    // build prompt
    const memoryBlock = scoredMem.map((m,i) => `(${i+1}) ${m.role}: ${m.content}`).join("\n");
    const ragBlock = scoredChunks.map((c,i) => `[#${i+1}] ${c.title}: ${c.text.slice(0,400)}`).join("\n\n");

    const prompt = `You are a helpful assistant for ${displayName || "the user"}.
Use these persona memories and knowledge snippets to answer. Cite sources if used.

${memoryBlock ? `Recalled memories:\n${memoryBlock}\n\n` : ""}
${ragBlock ? `Knowledge:\n${ragBlock}\n\n` : ""}

User: ${content}
Assistant:`;

    // Save user message
    await Message.create({ userId, sessionId, role: "user", content, vector: qVec });

    // call Gemini
    const reply = await generateWithGemini(prompt).catch(err => {
      console.error("gemini error", err);
      return "Sorry — I'm having trouble generating a response right now.";
    });

    // store assistant message (no vector)
    await Message.create({ userId, sessionId, role: "assistant", content: reply });

    // return aggregated response
    res.json({
      reply,
      sources: scoredChunks.map((c, idx) => ({ title: c.title, chunkIndex: c.chunkIndex, score: +c.score.toFixed(3), idx: idx+1 })),
      memories: scoredMem.map(m => ({ role: m.role, content: m.content, score: +m.score.toFixed(3) }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};