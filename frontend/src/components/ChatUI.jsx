import React, { useEffect, useRef, useState } from "react";
import { sendMessage } from "../api/chatApi";
import { v4 as uuid } from "uuid";

export default function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef(null);

  // Persist userId locally
  const [userId] = useState(() => {
    const existing = localStorage.getItem("ns_user_id");
    if (existing) return existing;
    const id = uuid();
    localStorage.setItem("ns_user_id", id);
    return id;
  });

  // Auto-scroll on new messages
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const { reply } = await sendMessage(userId, text);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network issue—please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>Conversational RAG with Memory (Gemini)</h2>

      <div
        ref={scrollerRef}
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          height: 420,
          overflowY: "auto",
          background: "#fafafa"
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 8
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "8px 12px",
                borderRadius: 12,
                whiteSpace: "pre-wrap",
                background: m.role === "user" ? "#dbeafe" : "white",
                border: "1px solid #e5e7eb"
              }}
            >
              <strong>{m.role === "user" ? "You" : "Assistant"}: </strong>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ opacity: 0.7, fontStyle: "italic" }}>Assistant is typing…</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message…"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #2563eb",
            background: loading ? "#93c5fd" : "#3b82f6",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
