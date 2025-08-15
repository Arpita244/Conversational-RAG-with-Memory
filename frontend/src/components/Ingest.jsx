import React, { useState } from "react";
import { ingestText } from "../api";

export default function Ingest() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const submit = async () => {
    if (!title.trim() || !text.trim()) return;
    const res = await ingestText(title.trim(), text.trim());
    setResult(res);
    setTitle("");
    setText("");
  };

  return (
    <div className="ingest-wrap">
      <div className="ingest-card">
        <h3>Add knowledge (RAG)</h3>
        <input placeholder="Title (e.g., Course notes)" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <textarea placeholder="Paste text here…" rows={10} value={text} onChange={(e)=>setText(e.target.value)} />
        <button className="primary" onClick={submit}>Ingest</button>
        {result && (
          <div className="ingest-result">
            ✅ Ingested {result.chunks} chunks (doc id: {result.documentId})
          </div>
        )}
        <p className="tip">These chunks will be retrieved and cited in your answers.</p>
      </div>
    </div>
  );
}
