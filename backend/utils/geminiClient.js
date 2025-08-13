import axios from "axios";

/**
 * Robust Gemini call with:
 * - Correct endpoint (query param key)
 * - Body shape that works across v1beta models
 * - Defensive parsing + useful error throw
 */
export const generateWithGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  try {
    const { data } = await axios.post(
      url,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // Defensive extraction
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join("\n") ||
      null;

    if (!text) {
      throw new Error("Gemini returned no text");
    }
    return text.trim();
  } catch (err) {
    // Propagate the error so controller can apply fallback
    const detail = err?.response?.data || err.message || err.toString();
    throw new Error(`Gemini API error: ${JSON.stringify(detail)}`);
  }
};
