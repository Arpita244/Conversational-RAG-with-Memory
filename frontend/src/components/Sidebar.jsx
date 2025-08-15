// frontend/src/components/Sidebar.jsx
import React, { useState } from "react";
import clsx from "clsx";

export default function Sidebar({ user, sessions, activeSessionId, onSelect, onNewChat, onRename, onDelete, onSetTab, tab }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const startEdit = (s) => { setEditingId(s.sessionId); setEditTitle(s.title); };
  const saveEdit = async () => { await onRename(editingId, editTitle || "Untitled"); setEditingId(null); };

  return (
    <aside className="sidebar">
      <div className="sb-header">
        <div className="brand-mini">NerveSpark</div>
        <div className="user-pill">👤 {user.displayName}</div>
      </div>

      <div className="sb-actions">
        <button className="new-chat" onClick={onNewChat}>＋ New chat</button>
        <div className="tabs">
          <button className={clsx("tab", tab === "chat" && "active")} onClick={() => onSetTab("chat")}>Chat</button>
          <button className={clsx("tab", tab === "ingest" && "active")} onClick={() => onSetTab("ingest")}>Knowledge</button>
        </div>
      </div>

      <div className="sb-list">
        {sessions.map(s => (
          <div key={s.sessionId} className={clsx("sb-item", activeSessionId === s.sessionId && "active")} onClick={() => onSelect(s)}>
            {editingId === s.sessionId ? (
              <div className="edit-line" onClick={(e) => e.stopPropagation()}>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <button className="mini" onClick={saveEdit}>Save</button>
                <button className="mini ghost" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <div className="title">{s.title}</div>
                <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="mini ghost" onClick={() => startEdit(s)}>Rename</button>
                  <button className="mini danger" onClick={() => onDelete(s.sessionId)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
        {sessions.length === 0 && <div className="sb-empty">No sessions yet</div>}
      </div>

      <div className="sb-footer">
        <div className="hint">Personalized for <strong>{user.displayName}</strong></div>
        <div className="credit">ChatGPT-style UI • RAG + Memory</div>
      </div>
    </aside>
  );
}
