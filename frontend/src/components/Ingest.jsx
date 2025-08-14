import React, { useState } from "react";
import { ingestText } from "../api";

export default function Ingest() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleIngest = async () => {
    if (!title.trim() || !text.trim()) return;
    setLoading(true);
    try {
      const data = await ingestText(title.trim(), text.trim());
      setRes(data);
      setTitle(""); setText("");
    } catch (e) { setRes({ error: true, message: e.message }); }
    setLoading(false);
  };

  return (
    <div className="card">
      <h3>Ingest Knowledge</h3>
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <textarea rows={10} placeholder="Paste text..." value={text} onChange={e=>setText(e.target.value)} />
      <button onClick={handleIngest} disabled={loading}>{loading? "Ingesting…":"Ingest"}</button>
      {res && <pre style={{marginTop:12,background:"#f7fafc",padding:10}}>{JSON.stringify(res,null,2)}</pre>}
    </div>
  );
}
