import Message from "../models/Message.js";
import Document from "../models/Document.js";
import Session from "../models/Session.js";
import UserProfile from "../models/User.js";
import { embedText, generateWithGemini } from "../utils/geminiClient.js";
import { cosineSim } from "../utils/textUtils.js";
import { extractFacts, upsertFactsToProfile, buildPersonaBlock } from "../utils/memoryManager.js";

function buildPrompt({ displayName, userQuery, recalledMemories, ragSnippets, personaBlock }) {
  let sys = `You are a helpful assistant. Personalize responses for ${displayName || "the user"}.
- If the user expresses affection (e.g., "I love you"), respond warmly and kindly while keeping it friendly.
- Use retrieved knowledge and persona facts when relevant. Cite sources inline like [1], [2].
- If the user asks "do you remember", demonstrate awareness using recalled memories or persona facts.\n\n`;

  const memoryBlock = recalledMemories
    .map((m, i) => `(${i + 1}) ${m.role}: ${m.content}`)
    .join("\n");

  const ragBlock = ragSnippets
    .map((s, i) => `[#${i + 1}] ${s.text}`)
    .join("\n");

  return `${sys}`
    + (personaBlock ? `User persona facts:\n${personaBlock}\n\n` : "")
    + (memoryBlock ? `Relevant conversational memories:\n${memoryBlock}\n\n` : "")
    + (ragBlock ? `Knowledge snippets:\n${ragBlock}\n\n` : "")
    + `User: ${userQuery}\nAssistant:`;
}

export async function chatWithMemory(req, res) {
  try {
    const { sessionId, message } = req.body;
    const { userId, displayName } = req.user;

    // 1) Validate session ownership
    const session = await Session.findOne({ sessionId, userId });
    if (!session) return res.status(403).json({ error: "Invalid session" });

    // 2) Extract facts & update profile
    try {
      const facts = extractFacts(message);
      if (facts.length) await upsertFactsToProfile(userId, facts);
    } catch (e) {
      console.warn("fact extraction failed", e.message);
    }

    // 3) Embed user message
    const qVec = await embedText(message);

    // 4) Retrieve relevant memories
// 4) Retrieve relevant memories
let memCandidates = await Message.find({ userId, sessionId })
  .sort({ timestamp: -1 })
  .limit(150)
  .lean();

// Ensure all messages have a vector fallback
memCandidates = memCandidates.map(m => ({ ...m, vector: Array.isArray(m.vector) ? m.vector : [] }));

const scoredMem = memCandidates
  .map(m => ({ ...m, score: cosineSim(qVec, m.vector) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)
  .filter(s => s.score > 0.0); // allow even small similarity for recall

// --- Fallback: include last 2 user messages even if score is zero
const fallbackMem = memCandidates
  .filter(m => m.role === "user")
  .slice(-2)
  .map(m => ({ ...m, score: 0 }));

const finalMemories = scoredMem.length ? scoredMem : fallbackMem;


    // 5) Retrieve relevant doc chunks
    const docs = await Document.find({ userId }).lean();
    const allChunks = docs.flatMap(d => d.chunks.map(c => ({ ...c, title: d.title })));
    const scoredChunks = allChunks
      .map(c => ({ ...c, score: cosineSim(qVec, Array.isArray(c.vector) ? c.vector : []) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .filter(s => s.score > 0.2);

    // 6) Build persona facts block
    let personaBlock = await buildPersonaBlock(userId, 5);

// -------------------- FIX: Add explicit recall reminder --------------------
if (message.toLowerCase().includes("do you remember")) {
  personaBlock = personaBlock
    ? personaBlock + "\n(Remember to use these persona facts to answer user's memory questions.)"
    : "User has asked to recall previous persona facts.";
}

    // 7) Build prompt
    const prompt = buildPrompt({
  displayName,
  userQuery: message,
  recalledMemories: finalMemories,
  ragSnippets: scoredChunks,
  personaBlock
});


    // 8) Call Gemini
    let reply = await generateWithGemini(prompt);

    // 9) Save messages
    await Message.create({ userId, sessionId, role: "user", content: message, vector: qVec });
    await Message.create({ userId, sessionId, role: "assistant", content: reply });

    // 10) Respond
    res.json({
      reply,
      sources: scoredChunks.map((c, idx) => ({
        title: c.title,
        chunkIndex: c.chunkIndex,
        score: +c.score.toFixed(3),
        idx: idx + 1
      })),
      memories: scoredMem.map(m => ({
        role: m.role,
        content: m.content,
        score: +m.score.toFixed(3)
      }))
    });
  } catch (e) {
    console.error("chatWithMemory error:", e);
    res.status(500).json({ error: "Server error" });
  }
}

// ===== Option 1: Add history function =====
export async function history(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const msgs = await Message.find({ userId, sessionId })
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      messages: msgs.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }))
    });
  } catch (e) {
    console.error("history error:", e);
    res.status(500).json({ error: "Server error" });
  }
}
