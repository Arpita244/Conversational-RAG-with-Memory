import axios from "axios";

const GEN_MODEL = "gemini-1.5-flash";
const EMBED_MODEL = "text-embedding-004";

export const generateWithGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEN_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const { data } = await axios.post(url, { contents: [{ role: "user", parts: [{ text: prompt }] }] }, { headers: { "Content-Type": "application/json" } });
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "";
  if (!text) throw new Error("No text from Gemini");
  return text.trim();
};

export const embedWithGemini = async (text) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${process.env.GEMINI_API_KEY}`;
  const { data } = await axios.post(url, { content: { parts: [{ text }] } }, { headers: { "Content-Type": "application/json" } });
  const vec = data?.embedding?.values;
  if (!vec || !vec.length) throw new Error("No embedding");
  return vec;
};
