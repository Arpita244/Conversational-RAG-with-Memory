import Document from "../models/Document.js";
import { chunkText } from "../utils/textUtils.js";
import { embedText } from "../utils/geminiClient.js";

export async function ingestText(req, res) {
  try {
    const { title, text } = req.body;
    const userId = req.user.userId;

    if (!title || !text) return res.status(400).json({ error: "title & text required" });

    const chunksRaw = chunkText(text, 900);
    const chunks = [];

    for (let i = 0; i < chunksRaw.length; i++) {
      const vec = await embedText(chunksRaw[i]);
      chunks.push({ text: chunksRaw[i], vector: vec, chunkIndex: i });
    }

    const doc = await Document.create({ userId, title, chunks });
    res.json({ ok: true, documentId: doc._id.toString(), chunks: chunks.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}
