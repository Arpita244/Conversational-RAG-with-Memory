import axios from "axios";

export const generateWithGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const { data } = await axios.post(
    url,
    { contents: [{ role: "user", parts: [{ text: prompt }] }] },
    { headers: { "Content-Type": "application/json" } }
  );
  const text =
    data?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("\n") ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "";
  if (!text) throw new Error("Gemini returned no text");
  return text.trim();
};
