import UserProfile from "../models/UserProfile.js";

/* simple heuristic fact extractor (replace with LLM extractor for better accuracy) */
export const extractFacts = (text) => {
  const facts = [];
  const fav = text.match(/my (?:favorite|favourite) (?:color|food|movie|song|language) is ([\w\s]+)/i);
  if (fav) facts.push({ key: `favorite_${fav[0].split(" ")[2]||"thing"}`, value: fav[1].trim() });
  const prof = text.match(/\bI(?:'m| am) (a|an)?\s*([A-Za-z ]{2,40})\b/i);
  if (prof) {
    const cand = prof[2].trim();
    if (cand.length <= 40) facts.push({ key: "self_description", value: cand });
  }
  const like = text.match(/\bI (?:prefer|like|love|enjoy) ([\w\s]+)/i);
  if (like) facts.push({ key: "preference", value: like[1].trim() });
  return Array.from(new Map(facts.map(f=>[f.key,f])).values());
};

export const upsertFactsToProfile = async (userId, extractedFacts=[]) => {
  if (!extractedFacts.length) return null;
  const profile = (await UserProfile.findOne({ userId })) || new UserProfile({ userId, facts: [] });
  for (const f of extractedFacts) {
    const existing = profile.facts.find(p => p.key === f.key && p.value === f.value);
    if (existing) { existing.lastSeen = new Date(); existing.salience = Math.min(1, existing.salience + 0.05); }
    else profile.facts.push({ key: f.key, value: f.value, salience: 0.8, firstSeen: new Date(), lastSeen: new Date() });
  }
  profile.updatedAt = new Date();
  await profile.save();
  return profile;
};

export const buildPersonaBlock = async (userId, limit=5) => {
  const profile = await UserProfile.findOne({ userId }).lean();
  if (!profile) return "";
  const sorted = (profile.facts || []).slice().sort((a,b)=> (b.salience - a.salience)).slice(0, limit);
  if (!sorted.length) return "";
  const lines = sorted.map(f => `- ${f.key.replace(/_/g," ")}: ${f.value} (salience:${Number(f.salience.toFixed(2))})`);
  return `User profile facts:\n${lines.join("\n")}\n`;
};
