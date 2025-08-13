import React, { useState } from "react";
import { ingestText } from "../api/ingestApi";

export default function Ingest() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleIngest = async () => {
    if (!title.trim() || !text.trim()) return;
    setLoading(true);
    try {
      const res = await ingestText(title.trim(), text.trim());
      setResult(res);
      setTitle("");
      setText("");
    } catch (e) {
      setResult({ error: "Failed to ingest" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "24px auto", padding: 16 }}>
      <h3>Add Knowledge (RAG Ingestion)</h3>
      <input
        placeholder="Title (e.g., Python Basics Guide)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 8, borderRadius: 8, border: "1px solid #ddd" }}
      />
      <textarea
        placeholder="Paste your knowledge text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
      />
      <div style={{ marginTop: 10 }}>
        <button
          onClick={handleIngest}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #059669",
            background: loading ? "#6ee7b7" : "#10b981",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Ingesting…" : "Ingest"}
        </button>
      </div>
      {result && (
        <pre style={{ background: "#f9fafb", padding: 12, borderRadius: 8, marginTop: 10 }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
