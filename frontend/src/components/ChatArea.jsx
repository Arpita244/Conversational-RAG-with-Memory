// frontend/src/components/ChatArea.jsx
import React, { useEffect, useRef, useState } from "react";
import { sendMessage } from "../api";

export default function ChatArea({ user, session, messages, addMessage }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, loading]);

  const handleSend = async () => {
  const text = input.trim();
  if (!text) return;

  // REMOVE the return so it still tries sending
  if (!session?.sessionId) {
    console.error("No active session found, using fallback.");
  }

  addMessage({ role: "user", content: text });
  setInput("");
  setLoading(true);

  try {
    const res = await sendMessage(session?.sessionId || "default", text); // fallback sessionId

    if (!res || !res.reply) {
      throw new Error("Invalid API response");
    }

    const { reply, sources = [], memories = [] } = res;
    addMessage({ role: "assistant", content: reply, sources, memories });
  } catch (e) {
    console.error("Send message error", e);
    addMessage({
      role: "assistant",
      content: "⚠️ Network or server issue — please try again."
    });
  } finally {
    setLoading(false);
  }
};


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-wrap">
      <header className="chat-header">
        <div className="chat-title">{session?.title || "New Chat"}</div>
        <div className="chat-sub">
          Hi {user?.displayName || "User"}! Your chat is private & personalized.
        </div>
      </header>

      <div ref={scrollerRef} className="chat-scroll">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "msg user" : "msg ai"}>
            <div className="bubble">
              <div className="role">
                {m.role === "user" ? "You" : "Assistant"}
              </div>
              <div className="content">{m.content}</div>
              {m.role === "assistant" &&
                (m.sources?.length || m.memories?.length) && (
                  <div className="meta">
                    {m.sources?.length ? (
                      <div className="sources">
                        <em>Sources:</em>{" "}
                        {m.sources.map((s, idx) => (
                          <span key={idx} className="chip">
                            [{idx + 1}] {s.title}#{s.chunkIndex} (score{" "}
                            {s.score})
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {m.memories?.length ? (
                      <div className="memories">
                        <em>Recalled:</em>{" "}
                        {m.memories.slice(0, 3).map((mm, idx) => (
                          <span key={idx} className="chip">
                            {mm.role}: “{mm.content.slice(0, 40)}”
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
            </div>
          </div>
        ))}
        {loading && <div className="typing">Assistant is typing…</div>}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message NerveSpark…"
          disabled={loading}
        />
        <button className="send" onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
