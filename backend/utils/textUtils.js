// simple chunker for text documents
export function chunkText(text, maxChars = 800) {
  const paras = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let buf = "";
  for (const p of paras) {
    if ((buf + "\n" + p).length <= maxChars) {
      buf = buf ? buf + "\n" + p : p;
    } else {
      if (buf) chunks.push(buf);
      if (p.length > maxChars) {
        // hard split long paragraph
        for (let i = 0; i < p.length; i += maxChars) {
          chunks.push(p.slice(i, i + maxChars));
        }
        buf = "";
      } else {
        buf = p;
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

export function cosineSim(a = [], b = []) {
  if (!a.length || !b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}
