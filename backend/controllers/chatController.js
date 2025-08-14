// backend/controllers/chatController.js
import Message from "../models/Message.js";
import Metric from "../models/Metric.js";
import UserProfile from "../models/UserProfile.js";
import { embedText } from "../utils/embeddings.js";
import { generateWithGemini } from "../utils/geminiClient.js";
import { similaritySearchDocs, similaritySearchMemory } from "../utils/vectorStore.js";
import { extractFacts, upsertFactsToProfile, buildPersonaBlock } from "../utils/memoryManager.js";

const fallback = (msg) => {
  if (/(hi|hello|hey)/i.test(msg)) return "Hey! 👋 I remember our chats—how can I help?";
  if (/sad|depress|upset|lonely/i.test(msg)) return "I’m sorry you’re feeling that way ❤️. Want to talk more?";
  return "I’m having a small trouble, but I remember our past chats. Could you rephrase?";
};

export const chatWithMemory = async (req, res) => {
  const start = Date.now();
  const { userId, message, topKDocs = 4, topKMemory = 4 } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "userId and message required" });

  try {
    // load user profile for personalization (may be null)
    const profile = await UserProfile.findOne({ userId }).lean();

    // 1) extract facts & update profile
    try { const facts = extractFacts(message); if (facts.length) await upsertFactsToProfile(userId, facts); } catch(e){ console.warn("fact extract failed", e.message); }

    // 2) embed user message (for future recall)
    let userEmbedding = [];
    try { userEmbedding = await embedText(message); } catch(e){ console.warn("embed fail", e.message); }

    await Message.create({ userId, role: "user", content: message, embedding: userEmbedding });

    // 3) recent window
    const recent = await Message.find({ userId }).sort({ timestamp: -1 }).limit(8).lean();
    const recentBlock = recent.reverse().map(m=>`${m.role}: ${m.content}`).join("\n");

    // 4) retrieve recollections
    let recalled = [];
    try { recalled = await similaritySearchMemory({ userId, query: message, topK: topKMemory }); } catch(e){ console.warn("memory search fail", e.message); }
    const recalledBlock = recalled.map((r,i)=>`Mem${i+1} (${new Date(r.timestamp).toLocaleString()}): ${r.role}: ${r.content}`).join("\n");

    // 5) retrieve doc sources
    let docs = [];
    try { docs = await similaritySearchDocs({ query: message, topK: topKDocs }); } catch(e){ console.warn("doc search fail", e.message); }
    const sourcesBlock = docs.map((d,i)=>`S${i+1} [${d.title} #${d.chunkIndex} | score=${d.score.toFixed(3)}]:\n${d.text}`).join("\n\n");

    // 6) persona: include displayName explicitly if present, plus personaBlock facts
    const personaFactsBlock = await buildPersonaBlock(userId, 5);
    const displayName = profile?.displayName || "";
    const displayNameBlock = displayName ? `User displayName: ${displayName}\n` : "";

    // 7) system + prompt
    const system = `You are a helpful assistant. Use the user's profile and conversation history to personalize replies.
- If the user's displayName is provided, address them by name naturally at least once in your reply when appropriate.
- Use persona facts to adapt tone and suggestions.
- Cite RAG sources inline as [S1],[S2] when using them.
- NEVER say "I don't have memory of past conversations".`;

    const prompt = `${system}

[Profile]
${displayNameBlock}${personaFactsBlock || "(no stored persona facts)"}

[Recent]
${recentBlock || "(no recent)"}

[Recalled]
${recalledBlock || "(none)"}

[RAG]
${sourcesBlock || "(none)"}

User: ${message}
Assistant:`;

    // 8) generate
    let reply;
    let usedPersonalization = false;
    try {
      reply = await generateWithGemini(prompt);

      // MARK: Did reply mention the displayName? simple check
      if (displayName) {
        const nameToken = displayName.split(" ")[0].toLowerCase();
        if (nameToken && reply.toLowerCase().includes(nameToken)) usedPersonalization = true;
      }
      // also check if any persona fact values appear in reply (very basic)
      if (!usedPersonalization && personaFactsBlock) {
        const personaVals = personaFactsBlock.split("\n").map(l => l.split(":")[1]).filter(Boolean).map(s=>s.trim().toLowerCase());
        for (const v of personaVals) {
          if (!v) continue;
          const token = v.split(" ")[0];
          if (token && reply.toLowerCase().includes(token)) { usedPersonalization = true; break; }
        }
      }
    } catch (err) {
      console.error("Gemini error:", err.message);
      reply = fallback(message);
    }

    // 9) store assistant message
    await Message.create({ userId, role: "assistant", content: reply, embedding: [] });

    // 10) metrics
    const latencyMs = Date.now() - start;
    await Metric.create({ userId, action: "chat", latencyMs, personalizedUsed: usedPersonalization });

    // 11) respond - include personalizedGreeting when we used the displayName or when profile.displayName exists
    const personalizedGreeting = (displayName && usedPersonalization) ? { name: displayName } : null;

    res.json({
      reply,
      sources: docs.map(d=>({ title: d.title, docId: d.docId, chunkIndex: d.chunkIndex, score: Number(d.score.toFixed(3)) })),
      memories: recalled.map(r=>({ role: r.role, content: r.content, score: Number(r.score.toFixed(3)) })),
      personalizedUsed: usedPersonalization,
      personalizedGreeting,
      metrics: { latencyMs }
    });

  } catch (err) {
    console.error("chat fatal:", err);
    return res.json({ reply: fallback(message), sources: [], memories: [], personalizedUsed: false, personalizedGreeting: null });
  }
};
