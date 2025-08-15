import React, { useEffect, useRef, useState } from "react";
import { sendMessage, fetchHistory, updateProfile } from "../api";
import { v4 as uuid } from "uuid";

export default function ChatUI() {
  const [messages, setMessages] = useState([]); // chat turns
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef(null);
  const [username, setUsername] = useState(localStorage.getItem("ns_username") || "");
  const [showProfilePrompt, setShowProfilePrompt] = useState(!localStorage.getItem("ns_username"));
  const [displayNameInput, setDisplayNameInput] = useState("");

  const [userId] = useState(() => {
    const existing = localStorage.getItem("ns_user_id");
    if (existing) return existing;
    const id = uuid(); localStorage.setItem("ns_user_id", id); return id;
  });

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchHistory(userId);
        if (data?.success) {
          setMessages(data.messages.map(m => ({ role: m.role, content: m.content })));
        }
      } catch (e) { console.warn("history load failed", e.message); }
    };
    loadHistory();
  }, [userId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleCreateProfile = async () => {
    const name = (displayNameInput || "").trim();
    if (!name) return alert("Please enter a display name");
    try {
      await updateProfile(userId, { displayName: name, facts: [] });
      setUsername(name);
      localStorage.setItem("ns_username", name);
      setShowProfilePrompt(false);
    } catch (err) {
      console.error("Failed to create profile", err);
      alert("Could not create profile — try again");
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput(""); setLoading(true);

    try {
      const data = await sendMessage(userId, text);
      const { reply, sources, memories, personalizedUsed, personalizedGreeting } = data;
      if (personalizedGreeting?.name && !username) {
        setUsername(personalizedGreeting.name);
        localStorage.setItem("ns_username", personalizedGreeting.name);
      }
      setMessages(prev => [...prev, { role: "assistant", content: reply, sources, memories, personalizedUsed }]);
    } catch (err) {
      console.error("send error", err);
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Network issue — please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-card">
      <div className="chat-header">
        <h3>Chat</h3>
        <div className="meta">{username ? `Welcome back, ${username}` : "Welcome — please create a profile"}</div>
      </div>

      {showProfilePrompt && (
        <div className="card profile-card">
          <h4>Create your profile</h4>
          <p>Enter a display name so the assistant can personalize replies for you.</p>
          <input placeholder="Display name (e.g., Arpita)" value={displayNameInput} onChange={e => setDisplayNameInput(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button onClick={handleCreateProfile}>Create Profile</button>
          </div>
        </div>
      )}

      <div className="chat-body" ref={scrollerRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-row ${m.role === "user" ? "user" : "assistant"}`}>
            <div className="bubble">
              <strong>{m.role === "user" ? "You" : "Assistant"}: </strong>{m.content}
              {m.personalizedUsed && <span className="badge">personalized</span>}
            </div>

            {m.role === "assistant" && (m.sources?.length || m.memories?.length) && (
              <div className="meta-block">
                {m.sources?.length > 0 && <div className="sources">📚 Sources: {m.sources.map((s,ix)=>(<span key={ix}>[{ix+1}] {s.title}#{s.chunkIndex}</span>))}</div>}
                {m.memories?.length > 0 && <div className="memories">💭 Recalled: {m.memories.slice(0,3).map((mm,ix)=>(<span key={ix}>{mm.role}: “{mm.content.slice(0,40)}”</span>))}</div>}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="typing">Assistant is typing…</div>}
      </div>

      <div className="chat-input">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder={showProfilePrompt ? "Create profile first to chat" : "Ask something…"} disabled={showProfilePrompt} />
        <button onClick={handleSend} disabled={loading || showProfilePrompt}>{loading ? "Sending…" : "Send"}</button>
      </div>
    </div>
  );
}
