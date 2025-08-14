import DocChunk from "../models/DocChunk.js";
import Message from "../models/Message.js";
import { embedText, cosineSim } from "./embeddings.js";

/* chunking: paragraph-first, fallback fixed */
export const simpleChunk = (text, maxChars = 800) => {
  const paras = text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  const chunks = [];
  for (const p of paras) {
    if (p.length <= maxChars) chunks.push(p);
    else for (let i = 0; i < p.length; i += maxChars) chunks.push(p.slice(i, i+maxChars));
  }
  return chunks;
};

export const upsertDocument = async ({ docId, title, text }) => {
  const chunks = simpleChunk(text);
  const docs = [];
  let idx = 0;
  for (const chunk of chunks) {
    const embedding = await embedText(chunk);
    docs.push({ docId, title, chunkIndex: idx++, text: chunk, embedding });
  }
  await DocChunk.deleteMany({ docId });
  await DocChunk.insertMany(docs);
  return docs.length;
};

export const similaritySearchDocs = async ({ query, topK = 4 }) => {
  const qVec = await embedText(query);
  const all = await DocChunk.find({}, { embedding: 1, text: 1, title: 1, docId: 1, chunkIndex: 1 }).lean();
  const scored = all.map(d => ({ ...d, score: cosineSim(qVec, d.embedding) })).sort((a,b)=>b.score-a.score);
  return scored.slice(0, topK);
};

export const similaritySearchMemory = async ({ userId, query, topK = 4 }) => {
  const qVec = await embedText(query);
  const all = await Message.find({ userId }, { embedding: 1, content: 1, role: 1, timestamp: 1 }).lean();
  const withEmb = all.filter(m => m.embedding?.length);
  const scored = withEmb.map(m => ({ ...m, score: cosineSim(qVec, m.embedding) })).sort((a,b)=>b.score-a.score);
  return scored.slice(0, Math.min(topK, scored.length));
};
