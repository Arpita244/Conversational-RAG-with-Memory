import axios from "axios";

const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=`;

export const embedText = async (text) => {
  const { data } = await axios.post(
    `${EMBED_URL}${process.env.GEMINI_API_KEY}`,
    { content: { parts: [{ text }] } },
    { headers: { "Content-Type": "application/json" } }
  );
  const vec = data?.embedding?.values;
  if (!vec?.length) throw new Error("No embedding returned");
  return vec;
};

export const cosineSim = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
};
