import Message from "../models/Message.js";
import { generateWithGemini } from "../utils/geminiClient.js";

/**
 * Simple empathetic fallback if LLM fails.
 */
const fallbackReply = (userMsg) => {
  const msg = userMsg.toLowerCase();
  if (/(sad|down|upset|depressed|lonely|cry|breakup)/.test(msg)) {
    return "I'm really sorry you're feeling this way. 💛 Want to tell me a bit more about what's making you feel sad? I'm here to listen.";
  }
  if (/^(hi|hii|hiii|hello|hey)\b/.test(msg)) {
    return "Hey! 👋 I’m here. How can I help you today?";
  }
  return "Hmm, I’m having a small hiccup right now, but I’m here with you. Could you rephrase or give me a bit more detail?";
};

export const chatWithMemory = async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "userId and message are required." });
  }

  try {
    // Get last 8 messages for short context window
    const history = await Message.find({ userId })
      .sort({ timestamp: -1 })
      .limit(8);

    const context = history
      .reverse()
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const systemPreamble =
      "You are a helpful, concise assistant. Use the conversation history to stay in context. If the user is sad, be empathetic. Keep answers short.";

    const prompt = `${systemPreamble}\n\nConversation so far:\n${context}\nuser: ${message}\nassistant:`;

    // Try Gemini
    let botReply;
    try {
      botReply = await generateWithGemini(prompt);
    } catch (geminiErr) {
      console.error(geminiErr);
      botReply = fallbackReply(message);
    }

    // Store both messages
    await Message.create({ userId, role: "user", content: message });
    await Message.create({ userId, role: "assistant", content: botReply });

    res.json({ reply: botReply });
  } catch (err) {
    console.error("Chat controller error:", err);
    // Last-resort fallback
    return res.json({
      reply:
        "I’m having trouble right now, but I’m still here. Could you try again in a moment?"
    });
  }
};
