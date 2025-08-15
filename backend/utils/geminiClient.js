import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const GENERATE_MODEL = "gemini-1.5-flash-latest";
const EMBED_MODEL = "text-embedding-004"; // Updated to a more recent model
const GENERATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GENERATE_MODEL}:generateContent`;
const EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent`;

/**
 * Generate text with Gemini API
 */
export async function generateWithGemini(prompt, retryCount = 0) {
  try {
    const { data } = await axios.post(
      `${GENERATE_URL}?key=${GEMINI_KEY}`,
      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "I couldn't generate a response this time.";
  } catch (err) {
    const status = err.response?.status;
    console.error("Gemini generate error:", JSON.stringify(err.response?.data || err, null, 2));

    if (status === 503 && retryCount < 5) {
      console.warn(`Gemini API busy. Retrying in 3s... (attempt ${retryCount + 1})`);
      await new Promise(res => setTimeout(res, 3000));
      return generateWithGemini(prompt, retryCount + 1);
    }

    if (status === 429) {
      return "Sorry, the AI service quota is exhausted. Please try again later.";
    }

    return "Sorry, I'm having trouble generating a response right now. Please try again in a few seconds.";
  }
}

/**
 * Get text embedding from Gemini API
 */
export async function embedText(text) {
  try {
    const { data } = await axios.post(
      `${EMBED_URL}?key=${GEMINI_KEY}`,
      { content: { parts: [{ text }] } },
      { headers: { "Content-Type": "application/json" } }
    );
    return Array.isArray(data?.embedding?.values) ? data.embedding.values : [];
  } catch (err) {
    console.error("Gemini embed error:", JSON.stringify(err.response?.data || err, null, 2));
    return [];
  }
}