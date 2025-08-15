import UserProfile from "../models/User.js";

export const extractFacts = (text) => {
  const facts = [];
  const fav = text.match(/my (?:favorite|favourite) ([a-z]+) is ([\w\s-]{2,40})/i);
  if (fav) facts.push({ key: `favorite_${fav[1].toLowerCase()}`, value: fav[2].trim() });
  const like = text.match(/\bI (?:prefer|like|love|enjoy) ([\w\s-]{2,40})/i);
  if (like) facts.push({ key: "preference", value: like[1].trim() });
  const role = text.match(/\bI(?:'m| am) (?:a|an)?\s*([A-Za-z ]{2,40})\b/i);
  if (role) facts.push({ key: "self_description", value: role[1].trim() });
  const map = new Map(); facts.forEach(f => map.set(`${f.key}:${f.value}`, f));
  return Array.from(map.values());
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
