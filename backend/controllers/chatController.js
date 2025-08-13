import Message from "../models/Message.js";
import { embedText } from "../utils/embeddings.js";
import { generateWithGemini } from "../utils/geminiClient.js";
import { similaritySearchDocs, similaritySearchMemory } from "../utils/vectorStore.js";

const fallbackReply = (msg) => {
  const m = msg.toLowerCase();
  if (/^(hi|hii|hiii|hello|hey)\b/.test(m)) return "Hey! 👋 I remember our past chats. What would you like to continue with?";
  if (/(sad|down|upset|depressed|lonely|cry|breakup)/.test(m))
    return "I’m really sorry you’re feeling this way 💛. I’m here to listen. Want to share more?";
  return "I’m here and I do keep memory. Could you rephrase while I try again?";
};

export const chatWithMemory = async (req, res) => {
  const t0 = Date.now();
  const { userId, message, topKDocs = 4, topKMemory = 4 } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "userId and message are required." });

  try {
    // 1) Always store the user's turn with its embedding (so it’s available for future recall)
    let userEmbedding = [];
    try { userEmbedding = await embedText(message); } catch (e) { console.warn("Embed user msg failed:", e.message); }

    const userMsg = await Message.create({ userId, role: "user", content: message, embedding: userEmbedding });

    // 2) Fetch short recent window (recency bias)
    const recent = await Message.find({ userId }).sort({ timestamp: -1 }).limit(8).lean();
    const recentBlock = recent.reverse().map(m => `${m.role}: ${m.content}`).join("\n");

    // 3) Semantic recall of earlier turns (long-term memory)
    let recalled = [];
    try { recalled = await similaritySearchMemory({ userId, query: message, topK: topKMemory }); }
    catch (e) { console.warn("Memory search failed:", e.message); }

    const recalledBlock = recalled
      .map((r, i) => `Mem ${i + 1} (${new Date(r.timestamp).toLocaleString()}): ${r.role}: ${r.content}`)
      .join("\n");

    // 4) RAG over doc chunks
    let docs = [];
    try { docs = await similaritySearchDocs({ query: message, topK: topKDocs }); }
    catch (e) { console.warn("Doc search failed:", e.message); }

    const sourcesBlock = docs
      .map((d, i) => `Source ${i + 1} [${d.title} #${d.chunkIndex} | score=${d.score.toFixed(3)}]:\n${d.text}`)
      .join("\n\n");

    // 5) Craft prompt
    const systemPreamble =
      "You are a helpful assistant with conversation memory. You have access to prior messages and retrieved notes. " +
      "NEVER say you lack memory. If unsure, say so briefly. Be concise, friendly, and use empathy when needed. " +
      "Prefer facts from provided sources; cite them inline as [S1], [S2] etc.";

    const prompt =
`${systemPreamble}

[Recent conversation]
${recentBlock || "(no prior messages yet)"}

[Recalled earlier memories]
${recalledBlock || "(none recalled)"}

[RAG sources]
${sourcesBlock || "(no sources retrieved)"}

User: ${message}
Assistant:`;

    // 6) Generate
    let reply;
    try {
      reply = await generateWithGemini(prompt);
    } catch (err) {
      console.error("Gemini gen failed:", err.message);
      reply = fallbackReply(message);
    }

    // 7) Store assistant turn (embedding optional)
    await Message.create({ userId, role: "assistant", content: reply, embedding: [] });

    const latencyMs = Date.now() - t0;
    res.json({
      reply,
      sources: docs.map(d => ({ title: d.title, docId: d.docId, chunkIndex: d.chunkIndex, score: Number(d.score.toFixed(3)) })),
      memories: recalled.map((m) => ({ role: m.role, content: m.content })),
      metrics: { latencyMs }
    });
  } catch (err) {
    console.error("Chat controller fatal:", err);
    return res.json({ reply: fallbackReply(message), sources: [], memories: [], metrics: { error: true } });
  }
};
