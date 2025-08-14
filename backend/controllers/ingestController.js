import { upsertDocument } from "../utils/vectorStore.js";

export const ingestText = async (req, res) => {
  try {
    const { title, text } = req.body;
    if (!title || !text) return res.status(400).json({ error: "title and text required" });
    const docId = title.toLowerCase().replace(/\s+/g,"-");
    const count = await upsertDocument({ docId, title, text });
    res.json({ ok:true, chunks: count, docId, title });
  } catch (err) {
    console.error("Ingest error:", err.message);
    res.status(500).json({ error: "ingest failed", detail: err.message });
  }
};
