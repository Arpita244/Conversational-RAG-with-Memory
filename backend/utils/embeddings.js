import { embedWithGemini } from "./geminiClient.js";

// wrapper kept for compatibility
export const embedText = async (text) => {
  return embedWithGemini(text);
};

export const cosineSim = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
};
